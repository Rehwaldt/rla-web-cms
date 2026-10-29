import 'dotenv/config'
import fs from 'fs'
import path from 'path'
import { Report } from '../report'
import { Cms } from './cms'
import { planWerkx } from './plan'
import { readWerkxPeople } from './source'

// Fills the employees' dates and codes from WerkX (Dresden and Berlin), once. Runs on a machine
// in the office, which reaches the WerkX API, and writes through the target CMS's REST API.
//   pnpm migrate:werkx --target http://localhost:3000 --dry-run   plan and report only
//   pnpm migrate:werkx --target https://cms.rehwaldt.de           import
// Logs in with CMS_TOKEN (the admin's `payload-token` cookie) or CMS_EMAIL + CMS_PASSWORD; set
// them in the shell, not in .env. Reads WERKX_API_URL (default http://webserver:8000) and the
// optional pairs file migration/werkx-pairs.json, for people the rules get wrong:
//   { "pairs": { "<employee id>": "<WerkX code>" }, "skip": ["<WerkX code>"] }
function arg(name: string) {
  const index = process.argv.indexOf(name)
  return index === -1 ? undefined : process.argv[index + 1]
}

async function main() {
  const dryRun = process.argv.includes('--dry-run')
  const target = arg('--target')
  if (!target) throw new Error('--target <CMS url> is required, e.g. http://localhost:3000')
  const pairsFile = arg('--pairs') ?? path.resolve('migration/werkx-pairs.json')
  const { pairs = {}, skip = [] } = (
    fs.existsSync(pairsFile) ? JSON.parse(fs.readFileSync(pairsFile, 'utf8')) : {}
  ) as { pairs?: Record<string, string>; skip?: string[] }

  const people = await readWerkxPeople(process.env.WERKX_API_URL ?? 'http://webserver:8000')
  const cms = await Cms.connect(target, {
    token: process.env.CMS_TOKEN,
    email: process.env.CMS_EMAIL,
    password: process.env.CMS_PASSWORD,
  })
  const [employees, officeIds] = await Promise.all([cms.employees(), cms.offices()])
  console.log(`WerkX: ${people.length} people · CMS ${cms.url}: ${employees.length} employees`)

  const report = new Report()
  const plan = planWerkx(people, employees, report, {
    pairs,
    skip,
    officeIds,
    today: new Date().toISOString().slice(0, 10),
    adminUrl: (id) => `${cms.url}/admin/collections/employees/${id}`,
  })
  report.count('to update', plan.updates.length)
  report.count('to create', plan.creates.length)

  if (!dryRun) {
    for (const { id, status, data } of plan.updates) {
      await cms.update(id, status, data).then(
        () => report.count('updated'),
        (error: Error) => report.add('Update failed', `${id}: ${error.message}`),
      )
    }
    for (const { code, data } of plan.creates) {
      await cms.createDraft(data).then(
        () => report.count('created'),
        (error: Error) => report.add('Create failed', `${code}: ${error.message}`),
      )
    }
  }

  const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
  const name = `werkx-${new URL(cms.url).hostname}-${dryRun ? 'dry-run' : 'run'}-${stamp}`
  const file = report.write(path.resolve('migration/reports'), name)
  console.log(report.summary())
  console.log(`Report: ${file}`)
}

// exitCode rather than exit(): exiting with open fetch connections crashes Node on Windows.
main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})
