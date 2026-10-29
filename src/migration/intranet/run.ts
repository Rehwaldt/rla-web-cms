import 'dotenv/config'
import fs from 'fs'
import path from 'path'
import { Cms } from '../cms'
import { Report } from '../report'
import { type CmsGroup, type CmsPerson, planIntranet } from './plan'
import { readIntranet } from './source'

// Imports the intranet's specialist groups and the employees' groups, certificates, mobile phones
// and intranet ids, once. Reads the intranet's public REST API (WP_BASE_URL) and writes through the
// target CMS's REST API.
//   pnpm migrate:intranet --target http://localhost:3000 --dry-run   plan and report only
//   pnpm migrate:intranet --target https://cms.rehwaldt.de           import
// Logs in like migrate:werkx (CMS_TOKEN, or CMS_EMAIL + CMS_PASSWORD, set in the shell). The
// optional pairs file migration/intranet-pairs.json fixes what the rules get wrong and marks
// external people among the ones it creates:
//   { "pairs": { "<employee id>": <intranet id> }, "skip": [<intranet id>], "external": [<intranet id>] }
function arg(name: string) {
  const index = process.argv.indexOf(name)
  return index === -1 ? undefined : process.argv[index + 1]
}

type Doc = Record<string, unknown>
const text = (value: unknown) => (typeof value === 'string' && value.trim() ? value.trim() : null)
const id = (value: unknown) => (value == null ? null : Number(typeof value === 'object' ? (value as Doc).id : value))

async function readCms(cms: Cms) {
  const groups = await cms.request<{ docs: Doc[] }>('GET', 'expertise?pagination=false&depth=0&locale=de')
  const employees = await cms.request<{ docs: Doc[] }>('GET', 'employees?pagination=false&depth=0&locale=de')
  const latestDrafts = await cms.latestDrafts('employees')
  const cmsGroups: CmsGroup[] = groups.docs.map((doc) => ({
    id: Number(doc.id),
    intranetId: doc.intranetId == null ? null : Number(doc.intranetId),
    name: String(doc.name ?? ''),
    parent: id(doc.parent),
  }))
  const cmsPeople: CmsPerson[] = employees.docs.map((doc) => {
    const status = doc._status === 'published' ? 'published' : 'draft'
    return {
      id: Number(doc.id),
      firstName: String(doc.firstName ?? ''),
      lastName: String(doc.lastName ?? ''),
      email: text(doc.email),
      intranetId: doc.intranetId == null ? null : Number(doc.intranetId),
      status,
      pendingDraft: status === 'published' && latestDrafts.has(Number(doc.id)),
      mobilePhone: text(doc.mobilePhone),
      hasPortrait: doc.portrait != null,
      expertise: ((doc.expertise as unknown[]) ?? []).flatMap((value) => id(value) ?? []),
      qualifications: ((doc.qualifications as Doc[]) ?? []).flatMap((entry) => text(entry.name) ?? []),
      degree: [text(doc.profession), text(doc.university)].filter(Boolean).join(', ') || null,
      exitDate: text(doc.exitDate),
    }
  })
  return { cmsGroups, cmsPeople }
}

async function main() {
  const dryRun = process.argv.includes('--dry-run')
  const target = arg('--target')
  if (!target) throw new Error('--target <CMS url> is required, e.g. http://localhost:3000')
  if (!process.env.WP_BASE_URL) throw new Error('WP_BASE_URL (the intranet REST API base) is not set')
  const pairsFile = arg('--pairs') ?? path.resolve('migration/intranet-pairs.json')
  const { pairs = {}, skip = [], external = [] } = (
    fs.existsSync(pairsFile) ? JSON.parse(fs.readFileSync(pairsFile, 'utf8')) : {}
  ) as { pairs?: Record<string, number>; skip?: number[]; external?: number[] }

  const { people, groups } = await readIntranet(process.env.WP_BASE_URL)
  const cms = await Cms.connect(target, {
    token: process.env.CMS_TOKEN,
    email: process.env.CMS_EMAIL,
    password: process.env.CMS_PASSWORD,
  })
  const { cmsGroups, cmsPeople } = await readCms(cms)
  console.log(`Intranet: ${people.length} people, ${groups.length} groups · CMS ${cms.url}: ${cmsPeople.length} employees`)

  const report = new Report()
  const plan = planIntranet(people, groups, cmsPeople, cmsGroups, report, {
    pairs,
    skip,
    external,
    today: new Date().toISOString().slice(0, 10),
    adminUrl: (employeeId) => `${cms.url}/admin/collections/employees/${employeeId}`,
  })
  report.count('groups to create', plan.groups.creates.length)
  report.count('groups to update', plan.groups.updates.length)
  report.count('employees to update', plan.employees.length)
  report.count('employees to create', plan.creates.length)

  if (!dryRun) {
    // Groups first, parents before children, so every intranet id has a CMS id when it's needed.
    const groupIds = new Map(cmsGroups.flatMap((group) => (group.intranetId ? [[group.intranetId, group.id]] : [])))
    const parentId = (intranetParent: number | null) => (intranetParent === null ? null : (groupIds.get(intranetParent) ?? null))
    for (const group of plan.groups.creates) {
      await cms
        .request<{ doc: Doc }>('POST', 'expertise?depth=0&locale=de', {
          name: group.name,
          parent: parentId(group.parent),
          intranetId: group.intranetId,
        })
        .then(
          ({ doc }) => {
            groupIds.set(group.intranetId, Number(doc.id))
            report.count('groups created')
          },
          (error: Error) => report.add('Creating a group failed', `${group.name}: ${error.message}`),
        )
    }
    for (const { id: groupId, name, parent } of plan.groups.updates) {
      const data = { ...(name === undefined ? {} : { name }), ...(parent === undefined ? {} : { parent: parentId(parent) }) }
      await cms.request('PATCH', `expertise/${groupId}?depth=0&locale=de`, data).then(
        () => report.count('groups updated'),
        (error: Error) => report.add('Updating a group failed', `${groupId}: ${error.message}`),
      )
    }
    for (const update of plan.employees) {
      const data: Doc = { ...update.data, _status: update.status }
      if (update.groups) data.expertise = update.groups.flatMap((intranetId) => groupIds.get(intranetId) ?? [])
      if (update.qualifications) data.qualifications = update.qualifications.map((name) => ({ name }))
      // locale=de: the qualifications are the German list; the other fields aren't localized.
      await cms.request('PATCH', `employees/${update.id}?depth=0&locale=de`, data).then(
        () => report.count('employees updated'),
        (error: Error) => report.add('Updating an employee failed', `${update.id}: ${error.message}`),
      )
    }
    for (const create of plan.creates) {
      const data: Doc = {
        ...create.data,
        intranetId: create.intranetId,
        expertise: create.groups.flatMap((intranetId) => groupIds.get(intranetId) ?? []),
        qualifications: create.qualifications.map((name) => ({ name })),
        _status: 'draft',
      }
      await cms.request('POST', 'employees?depth=0&locale=de', data).then(
        () => report.count('employees created'),
        (error: Error) => report.add('Creating an employee failed', `${create.intranetId}: ${error.message}`),
      )
    }
  }

  const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
  const name = `intranet-${new URL(cms.url).hostname}-${dryRun ? 'dry-run' : 'run'}-${stamp}`
  const file = report.write(path.resolve('migration/reports'), name)
  console.log(report.summary())
  console.log(`Report: ${file}`)
}

// exitCode rather than exit(): exiting with open fetch connections crashes Node on Windows.
main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})
