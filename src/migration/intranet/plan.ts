import type { Report } from '../report'
import { nameParts } from '../werkx/plan'
import type { IntranetGroup, IntranetPerson } from './source'

// Plans the intranet import: the specialist groups as a tree (without the intranet's wrapping root
// "Fachgruppen"), and per employee the groups, certificates, mobile phone and intranet id. The
// intranet is the source of the groups; certificates and mobile phones only fill what the CMS
// lacks. Retired people without an exit date are archived (drafts only). Name, degree, portrait and
// leaving are otherwise only compared and reported. People the CMS doesn't have become drafts (the
// intranet links them to projects), marked external where the pairs file says so. Pure apart from
// the report, so it's tested.

export type CmsGroup = { id: number; intranetId: number | null; name: string; parent: number | null }

export type CmsPerson = {
  id: number
  firstName: string
  lastName: string
  email: string | null
  intranetId: number | null
  status: 'draft' | 'published'
  pendingDraft: boolean
  mobilePhone: string | null
  hasPortrait: boolean
  expertise: number[] // CMS ids of specialist groups
  qualifications: string[] // German list
  degree: string | null // profession and university, German
  exitDate: string | null
  archived: boolean
}

export type IntranetPlan = {
  groups: {
    creates: { intranetId: number; name: string; parent: number | null }[] // parent: intranet id
    updates: { id: number; name?: string; parent?: number | null }[]
  }
  employees: {
    id: number
    status: CmsPerson['status']
    data: { intranetId?: number; mobilePhone?: string; archived?: true }
    groups?: number[] // intranet ids
    qualifications?: string[] // German list
  }[]
  creates: {
    intranetId: number
    data: { firstName: string; lastName: string; email?: string; mobilePhone?: string; external: boolean; archived: boolean }
    groups: number[] // intranet ids
    qualifications: string[] // German list
  }[]
}

export type PlanOptions = {
  pairs: Record<string, number> // CMS id → intranet id, for people the rules can't match
  skip: number[] // intranet ids to leave out
  external: number[] // intranet ids of people who work with the office without being employed
  today: string // YYYY-MM-DD
  adminUrl: (id: number) => string
}

const sameEmail = (a: string | null, b: string | null) =>
  Boolean(a && b && a.trim().toLowerCase() === b.trim().toLowerCase())
const sameText = (a: string | null, b: string | null) => nameParts(a ?? '').join(' ') === nameParts(b ?? '').join(' ')
const sameSet = (a: number[], b: number[]) => a.length === b.length && a.every((value) => b.includes(value))

export function planIntranet(
  people: IntranetPerson[],
  groups: IntranetGroup[],
  employees: CmsPerson[],
  cmsGroups: CmsGroup[],
  report: Report,
  { pairs, skip, external, today, adminUrl }: PlanOptions,
): IntranetPlan {
  const plan: IntranetPlan = { groups: { creates: [], updates: [] }, employees: [], creates: [] }
  const label = (employee: CmsPerson) =>
    `${employee.firstName} ${employee.lastName} (${employee.status}) ${adminUrl(employee.id)}`
  const intranetLabel = (person: IntranetPerson) =>
    `${person.firstName} ${person.lastName} (intranet ${person.intranetId}${person.retired ? ', retired' : ''})`

  // Groups. The top level of the intranet only wraps the tree, so its children become the top level.
  const roots = new Set(groups.filter((group) => group.parent === 0).map((group) => group.intranetId))
  const parentOf = (group: IntranetGroup) => (roots.has(group.parent) ? null : group.parent)
  const byIntranetId = new Map(cmsGroups.flatMap((group) => (group.intranetId ? [[group.intranetId, group]] : [])))
  const cmsIntranetId = new Map(cmsGroups.map((group) => [group.id, group.intranetId]))
  const children = (parent: number | null) =>
    groups
      .filter((group) => !roots.has(group.intranetId) && parentOf(group) === parent)
      .sort((a, b) => a.name.localeCompare(b.name, 'de'))
  // Parents first, siblings alphabetically: the order they're created in is the order they show in.
  const walk = (parent: number | null) => {
    for (const group of children(parent)) {
      const existing = byIntranetId.get(group.intranetId)
      if (!existing) {
        plan.groups.creates.push({ intranetId: group.intranetId, name: group.name, parent })
        report.add('Specialist group created', group.name)
      } else {
        const existingParent = existing.parent === null ? null : (cmsIntranetId.get(existing.parent) ?? null)
        const update: IntranetPlan['groups']['updates'][number] = { id: existing.id }
        if (existing.name !== group.name) update.name = group.name
        if (existingParent !== parent) update.parent = parent
        if (Object.keys(update).length > 1) {
          plan.groups.updates.push(update)
          report.add('Specialist group updated', group.name)
        }
      }
      walk(group.intranetId)
    }
  }
  walk(null)

  // Employees.
  for (const id of skip) {
    const person = people.find((candidate) => candidate.intranetId === id)
    report.add(person ? 'Skipped (pairs file)' : 'Skip with an unknown intranet id', person ? intranetLabel(person) : String(id))
  }
  people = people.filter((person) => !skip.includes(person.intranetId))
  for (const [id, intranetId] of Object.entries(pairs)) {
    if (!people.some((person) => person.intranetId === intranetId)) report.add('Pair with an unknown intranet id', `${id} → ${intranetId}`)
    if (!employees.some((employee) => String(employee.id) === id)) report.add('Pair with an unknown employee id', `${id} → ${intranetId}`)
  }

  const matchedIds = new Set<number>()
  const matches = new Map<IntranetPerson, { employee: CmsPerson; by: string }>()
  const conflicts = new Set<IntranetPerson>()
  const matchSure = (person: IntranetPerson) => {
    const byId = employees.find((employee) => employee.intranetId === person.intranetId)
    if (byId) return { employee: byId, by: 'intranet id' }
    const pairedId = Object.entries(pairs).find(([, intranetId]) => intranetId === person.intranetId)?.[0]
    const byPair = pairedId ? employees.find((employee) => String(employee.id) === pairedId) : undefined
    if (byPair) return { employee: byPair, by: 'pair' }
    const byEmail = employees.find((employee) => sameEmail(employee.email, person.email))
    return byEmail ? { employee: byEmail, by: 'email' } : null
  }
  for (const person of people) {
    const found = matchSure(person)
    if (!found) continue
    if (matchedIds.has(found.employee.id)) {
      report.add('Employee matched by two intranet people (add a pair)', `${intranetLabel(person)} → ${label(found.employee)}`)
      conflicts.add(person)
      continue
    }
    matchedIds.add(found.employee.id)
    matches.set(person, found)
  }
  // Every part of the CMS name appears in the intranet name, among employees nobody else matched
  // and that have no intranet id yet.
  for (const person of people.filter((person) => !matches.has(person) && !conflicts.has(person))) {
    const parts = new Set(nameParts(`${person.firstName} ${person.lastName}`))
    const candidates = employees.filter(
      (employee) =>
        !employee.intranetId &&
        !matchedIds.has(employee.id) &&
        nameParts(`${employee.firstName} ${employee.lastName}`).every((part) => parts.has(part)),
    )
    if (candidates.length > 1) report.add('Several employees match the name (add a pair)', intranetLabel(person))
    else if (candidates.length === 1) {
      matchedIds.add(candidates[0].id)
      matches.set(person, { employee: candidates[0], by: 'name' })
    } else planCreate(person)
  }
  for (const id of external) {
    if (!people.some((person) => person.intranetId === id)) report.add('External with an unknown intranet id', String(id))
  }

  for (const [person, { employee, by }] of matches) {
    report.count(`matched by ${by}`)
    const where = `${intranetLabel(person)} → ${label(employee)}`
    if (by === 'name') report.add('Matched by name (check)', where)
    if (employee.intranetId && employee.intranetId !== person.intranetId) {
      report.add('Different intranet id in the CMS (skipped)', `${where}: ${employee.intranetId}`)
      continue
    }
    if (employee.pendingDraft) {
      report.add('Unpublished changes in the CMS (skipped, fill in by hand)', where)
      continue
    }

    const update: IntranetPlan['employees'][number] = { id: employee.id, status: employee.status, data: {} }
    const changes: string[] = []
    if (!employee.intranetId) update.data.intranetId = person.intranetId

    const personGroups = person.groups.filter((id) => !roots.has(id))
    const currentGroups = employee.expertise.flatMap((id) => cmsIntranetId.get(id) ?? [])
    if (!sameSet(personGroups, currentGroups)) {
      update.groups = personGroups
      changes.push(`${personGroups.length} specialist groups`)
    }
    if (person.certificates.length > 0) {
      if (employee.qualifications.length === 0) {
        update.qualifications = person.certificates
        changes.push(`${person.certificates.length} qualifications`)
      } else if (person.certificates.join('\n') !== employee.qualifications.join('\n')) {
        report.add('Qualifications differ (kept)', `${where}: intranet "${person.certificates.join('; ')}"`)
      }
    }
    if (person.mobilePhone) {
      if (!employee.mobilePhone) {
        update.data.mobilePhone = person.mobilePhone
        changes.push('mobile phone')
      } else if (person.mobilePhone.replace(/\D/g, '') !== employee.mobilePhone.replace(/\D/g, '')) {
        report.add('Mobile phone differs (kept)', where)
      }
    }

    if (!sameText(`${person.firstName} ${person.lastName}`, `${employee.firstName} ${employee.lastName}`)) {
      report.add('Name differs (kept)', where)
    }
    if (person.degree && !sameText(person.degree, employee.degree)) {
      report.add('Degree differs (kept)', `${where}: intranet "${person.degree}", CMS "${employee.degree ?? ''}"`)
    }
    if (person.hasPortrait && !employee.hasPortrait) report.add('Portrait only in the intranet', where)
    const exitDate = employee.exitDate?.slice(0, 10) ?? null
    // Retired without a known exit date: archived, so lists and the website leave them out. A
    // published employee is only reported, as archiving would take them off the website.
    if (person.retired && !exitDate && !employee.archived) {
      if (employee.status === 'draft') {
        update.data.archived = true
        changes.push('archived')
      } else report.add('Retired in the intranet, but published (archive by hand?)', where)
    }
    if (person.retired === false && exitDate && exitDate < today) {
      report.add('Not retired in the intranet, but the exit date has passed', `${where}: ${exitDate}`)
    }

    if (Object.keys(update.data).length === 0 && !update.groups && !update.qualifications) {
      report.count('unchanged')
      continue
    }
    plan.employees.push(update)
    report.add('Updated', `${where}: ${[...(update.data.intranetId ? ['intranet id'] : []), ...changes].join(', ')}`)
  }

  for (const employee of employees.filter((employee) => !matchedIds.has(employee.id))) {
    report.add('Not in the intranet', label(employee))
  }
  return plan

  function planCreate(person: IntranetPerson) {
    const where = intranetLabel(person)
    if (!person.firstName || !person.lastName) {
      report.add('Name without a first and last name (not created)', where)
      return
    }
    const isExternal = external.includes(person.intranetId)
    plan.creates.push({
      intranetId: person.intranetId,
      data: {
        firstName: person.firstName,
        lastName: person.lastName,
        ...(person.email ? { email: person.email } : {}),
        ...(person.mobilePhone ? { mobilePhone: person.mobilePhone } : {}),
        external: isExternal,
        archived: Boolean(person.retired),
      },
      groups: person.groups.filter((id) => !roots.has(id)),
      qualifications: person.certificates,
    })
    report.add(isExternal ? 'Created as external draft' : 'Created as draft', where)
    if (person.retired) report.add('Retired, created archived (no exit date)', where)
    if (person.hasPortrait) report.add('Portrait only in the intranet', where)
  }
}
