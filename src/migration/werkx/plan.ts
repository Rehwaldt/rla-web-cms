import type { Report } from '../report'
import type { WerkxPerson } from './source'

// Plans the WerkX import: matches each WerkX person to an employee and lists what to change.
// WerkX is the most reliable record of the dates, so it wins on entry, exit and birth date and
// fills in the code; name, email and office are kept and differences only reported. People
// WerkX has but the CMS doesn't become drafts. Pure apart from the report, so it's tested.

export type CmsEmployee = {
  id: number
  firstName: string
  lastName: string
  email: string | null
  code: string | null
  office: string | null // office name
  entryDate: string | null // ISO timestamp as Payload returns it
  exitDate: string | null
  birthDate: string | null
  status: 'draft' | 'published'
  pendingDraft: boolean // published, with newer unpublished changes
}

export type EmployeeData = {
  code?: string
  entryDate?: string
  exitDate?: string
  birthDate?: string
  firstName?: string
  lastName?: string
  email?: string
  office?: number
}

export type WerkxPlan = {
  updates: { id: number; status: CmsEmployee['status']; data: EmployeeData }[]
  creates: { code: string; data: EmployeeData }[]
}

export type PlanOptions = {
  pairs: Record<string, string> // CMS id → WerkX code, for people the rules can't match
  skip: string[] // WerkX codes to leave out, e.g. a second account of the same person
  offices: string[] // names of the offices WerkX covers
  officeIds: Record<string, number> // office name → id
  today: string // YYYY-MM-DD
  adminUrl: (id: number) => string
}

// Dates go in at noon UTC, as the admin's day picker stores them.
export const toCmsDate = (day: string) => `${day}T12:00:00.000Z`
const dayOf = (value: string | null) => (value ? value.slice(0, 10) : null)

// Name parts without accents and case: "Bauerová" and "bauerova" are the same part.
export const nameParts = (name: string) =>
  name
    .replace(/ß/g, 'ss')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean)

const sameEmail = (a: string | null, b: string | null) =>
  Boolean(a && b && a.trim().toLowerCase() === b.trim().toLowerCase())

export function planWerkx(
  people: WerkxPerson[],
  employees: CmsEmployee[],
  report: Report,
  { pairs, skip, offices, officeIds, today, adminUrl }: PlanOptions,
): WerkxPlan {
  const plan: WerkxPlan = { updates: [], creates: [] }
  const label = (employee: CmsEmployee) =>
    `${employee.firstName} ${employee.lastName} (${employee.status}) ${adminUrl(employee.id)}`
  const werkxLabel = (person: WerkxPerson) => `${person.name} (${person.code})`
  const matchedIds = new Set<number>()
  const werkxOffices = new Set(offices)

  for (const code of skip) {
    const person = people.find((candidate) => candidate.code === code)
    report.add(person ? 'Skipped (pairs file)' : 'Skip with an unknown WerkX code', person ? werkxLabel(person) : code)
  }
  people = people.filter((person) => !skip.includes(person.code))

  for (const [id, code] of Object.entries(pairs)) {
    if (!people.some((person) => person.code === code)) report.add('Pair with an unknown WerkX code', `${id} → ${code}`)
    if (!employees.some((employee) => String(employee.id) === id)) {
      report.add('Pair with an unknown employee id', `${id} → ${code}`)
    }
  }

  const matchSure = (person: WerkxPerson): { employee: CmsEmployee; by: string } | null => {
    const byCode = employees.find((employee) => employee.code === person.code)
    if (byCode) return { employee: byCode, by: 'code' }
    const pairedId = Object.entries(pairs).find(([, code]) => code === person.code)?.[0]
    const byPair = pairedId ? employees.find((employee) => String(employee.id) === pairedId) : undefined
    if (byPair) return { employee: byPair, by: 'pair' }
    const byEmail = employees.find((employee) => sameEmail(employee.email, person.email))
    return byEmail ? { employee: byEmail, by: 'email' } : null
  }
  // Every part of the CMS name appears in the WerkX name. Only among employees nobody matched
  // otherwise; one with a code would have matched by it.
  const matchByName = (person: WerkxPerson) => {
    const parts = new Set(nameParts(person.name))
    return employees.filter(
      (employee) =>
        !employee.code &&
        !matchedIds.has(employee.id) &&
        nameParts(`${employee.firstName} ${employee.lastName}`).every((part) => parts.has(part)),
    )
  }

  const matches = new Map<WerkxPerson, { employee: CmsEmployee; by: string }>()
  const conflicts = new Set<WerkxPerson>() // neither updated nor created
  for (const person of people) {
    const found = matchSure(person)
    if (!found) continue
    if (matchedIds.has(found.employee.id)) {
      report.add('Employee matched by two WerkX people (add a pair)', `${werkxLabel(person)} → ${label(found.employee)}`)
      conflicts.add(person)
      continue
    }
    matchedIds.add(found.employee.id)
    matches.set(person, found)
  }
  for (const person of people.filter((person) => !matches.has(person) && !conflicts.has(person))) {
    const candidates = matchByName(person)
    if (candidates.length > 1) {
      report.add('Several employees match the name (add a pair)', werkxLabel(person))
      continue
    }
    if (candidates.length === 1) {
      matchedIds.add(candidates[0].id)
      matches.set(person, { employee: candidates[0], by: 'name' })
    } else planCreate(person)
  }
  for (const [person, { employee, by }] of matches) {
    report.count(`matched by ${by}`)
    planUpdate(person, employee, by)
  }

  for (const employee of employees.filter((employee) => !matchedIds.has(employee.id))) {
    report.add(`Not in WerkX: ${employee.office ?? 'no office'}`, label(employee))
  }

  return plan

  function planUpdate(person: WerkxPerson, employee: CmsEmployee, by: string) {
    const where = `${werkxLabel(person)} → ${label(employee)}`
    if (by === 'name') report.add('Matched by name (check)', where)
    if (employee.code && employee.code !== person.code) {
      report.add('Different code in the CMS (skipped)', `${where}: ${employee.code}`)
      return
    }
    if (employee.pendingDraft) {
      report.add('Unpublished changes in the CMS (skipped, set the dates by hand)', where)
      return
    }

    const data: EmployeeData = {}
    const changes: string[] = []
    if (!employee.code) data.code = person.code
    // Someone who moved to an office WerkX doesn't cover (Prague, Beijing) still works here; WerkX
    // only knows the stint in its own office, so its dates would end the current one.
    if (employee.office && !werkxOffices.has(employee.office)) {
      report.add(`Works in ${employee.office}, which WerkX doesn't cover (dates kept)`, where)
      if (data.code) {
        plan.updates.push({ id: employee.id, status: employee.status, data })
        report.add('Updated', `${where}: code`)
      } else report.count('unchanged')
      return
    }
    for (const field of ['entryDate', 'exitDate'] as const) {
      const value = person[field]
      if (value && value !== dayOf(employee[field])) {
        data[field] = toCmsDate(value)
        changes.push(`${field} ${dayOf(employee[field]) ?? '–'} → ${value}`)
      }
    }
    // The date of birth stays out of the report.
    if (person.birthDate && person.birthDate !== dayOf(employee.birthDate)) {
      data.birthDate = toCmsDate(person.birthDate)
      changes.push(employee.birthDate ? 'birth date changed' : 'birth date set')
    }

    if (nameParts(person.name).join(' ') !== nameParts(`${employee.firstName} ${employee.lastName}`).join(' ')) {
      report.add('Name differs (kept)', where)
    }
    if (person.email && employee.email && !sameEmail(person.email, employee.email)) {
      report.add('Email differs (kept)', `${where}: WerkX ${person.email}`)
    }
    if (person.location && employee.office && person.location !== employee.office) {
      report.add('Office differs (kept)', `${where}: WerkX ${person.location}, CMS ${employee.office}`)
    }

    const exitDate = person.exitDate ?? dayOf(employee.exitDate)
    if (employee.status === 'published' && exitDate && exitDate < today) {
      report.add('Published, leaves the website (exit date passed)', `${where}: ${exitDate}`)
    }
    if (!person.active && !exitDate) report.add('Inactive in WerkX without an exit date', where)

    if (Object.keys(data).length === 0) {
      report.count('unchanged')
      return
    }
    plan.updates.push({ id: employee.id, status: employee.status, data })
    report.add('Updated', `${where}: ${[...(data.code ? ['code'] : []), ...changes].join(', ')}`)
  }

  function planCreate(person: WerkxPerson) {
    const where = werkxLabel(person)
    const [firstName, ...rest] = person.name.split(/\s+/).filter(Boolean)
    if (!firstName || rest.length === 0) {
      report.add('Name without a first and last name (not created)', where)
      return
    }
    const lastName = rest.join(' ')
    if (rest.length > 1 || firstName.includes('-')) {
      report.add('Name split to check', `${where}: first name "${firstName}", last name "${lastName}"`)
    }

    const data: EmployeeData = { firstName, lastName, code: person.code }
    if (person.email) data.email = person.email
    if (person.entryDate) data.entryDate = toCmsDate(person.entryDate)
    if (person.exitDate) data.exitDate = toCmsDate(person.exitDate)
    if (person.birthDate) data.birthDate = toCmsDate(person.birthDate)
    if (person.location && officeIds[person.location] !== undefined) data.office = officeIds[person.location]
    else report.add('Office not found (left empty)', `${where}: ${person.location ?? 'none'}`)

    if (person.active) report.add('Active in WerkX, not on the website yet (draft)', where)
    if (!person.active && !person.exitDate) report.add('Inactive in WerkX without an exit date', `${where} (new draft)`)
    if (person.active && person.exitDate && person.exitDate < today) {
      report.add('Active in WerkX, but the exit date has passed', `${where}: ${person.exitDate}`)
    }
    plan.creates.push({ code: person.code, data })
    report.add('Created as draft', where)
  }
}
