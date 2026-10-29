import { describe, expect, it, vi } from 'vitest'
import { type CmsEmployee, planWerkx, type PlanOptions } from '@/migration/werkx/plan'
import { toWerkxPerson, type WerkxPerson } from '@/migration/werkx/source'
import { Report } from '@/migration/report'

const person = (overrides: Partial<WerkxPerson> = {}): WerkxPerson => ({
  code: 'MxMn',
  name: 'Max Mustermann',
  email: 'max.mustermann@rehwaldt.de',
  birthDate: '1990-05-17',
  entryDate: '2015-03-01',
  exitDate: null,
  location: 'Dresden',
  active: true,
  ...overrides,
})

const employee = (overrides: Partial<CmsEmployee> = {}): CmsEmployee => ({
  id: 1,
  firstName: 'Max',
  lastName: 'Mustermann',
  email: 'max.mustermann@rehwaldt.de',
  code: null,
  office: 'Dresden',
  entryDate: '2015-01-01T12:00:00.000Z', // the placeholder from the entry year
  exitDate: null,
  birthDate: null,
  status: 'published',
  pendingDraft: false,
  ...overrides,
})

function plan(people: WerkxPerson[], employees: CmsEmployee[], options: Partial<PlanOptions> = {}) {
  const report = new Report()
  const recorded: [string, string][] = []
  const add = report.add.bind(report)
  vi.spyOn(report, 'add').mockImplementation((category, detail) => {
    recorded.push([category, detail])
    add(category, detail)
  })
  const result = planWerkx(people, employees, report, {
    pairs: {},
    skip: [],
    offices: ['Dresden', 'Berlin'],
    officeIds: { Dresden: 1, Berlin: 2 },
    today: '2026-10-29',
    adminUrl: (id) => `/admin/collections/employees/${id}`,
    ...options,
  })
  const issues = (category: string) => recorded.filter(([c]) => c === category).map(([, detail]) => detail)
  return { ...result, issues, report }
}

describe('planWerkx', () => {
  it('fills the code and replaces the dates of an employee matched by email', () => {
    const { updates, creates } = plan([person({ email: 'MAX.Mustermann@rehwaldt.de ' })], [employee()])
    expect(creates).toEqual([])
    expect(updates).toEqual([
      {
        id: 1,
        status: 'published',
        data: {
          code: 'MxMn',
          entryDate: '2015-03-01T12:00:00.000Z',
          birthDate: '1990-05-17T12:00:00.000Z',
        },
      },
    ])
  })

  it('keeps the date of birth out of the report', () => {
    const { issues } = plan([person()], [employee()])
    const [updated] = issues('Updated')
    expect(updated).toContain('birth date set')
    expect(updated).not.toContain('1990')
  })

  it('changes nothing on a second run', () => {
    const { updates, report } = plan(
      [person()],
      [employee({ code: 'MxMn', entryDate: '2015-03-01T12:00:00.000Z', birthDate: '1990-05-17T12:00:00.000Z' })],
    )
    expect(updates).toEqual([])
    expect(report.summary()).toContain('unchanged: 1')
  })

  it("doesn't clear what WerkX doesn't know", () => {
    const { updates } = plan(
      [person({ birthDate: null, exitDate: null })],
      [employee({ code: 'MxMn', entryDate: '2015-03-01T12:00:00.000Z', exitDate: '2020-06-30T12:00:00.000Z' })],
    )
    expect(updates).toEqual([])
  })

  it('matches by name parts, ignoring accents, case and order, and asks to check it', () => {
    const { updates, issues } = plan(
      [person({ email: null, name: 'Anezka Marie Bauerova' })],
      [employee({ firstName: 'Anežka', lastName: 'Bauerová', email: 'anezka@rehwaldt.de' })],
    )
    expect(updates[0]?.data.code).toBe('MxMn')
    expect(issues('Matched by name (check)')).toHaveLength(1)
  })

  it("doesn't let a name match take an employee someone matches by email", () => {
    const { updates, creates } = plan(
      [
        person({ code: 'MxMa', email: null }), // same name, matched first by name alone
        person({ code: 'MxMn' }),
      ],
      [employee()],
    )
    expect(updates.map((update) => update.data.code)).toEqual(['MxMn'])
    expect(creates.map((create) => create.code)).toEqual(['MxMa'])
  })

  it('creates nobody when several employees match the name', () => {
    const { updates, creates, issues } = plan(
      [person({ email: null })],
      [employee({ id: 1, email: null }), employee({ id: 2, email: null })],
    )
    expect(updates).toEqual([])
    expect(creates).toEqual([])
    expect(issues('Several employees match the name (add a pair)')).toEqual(['Max Mustermann (MxMn)'])
  })

  it('follows a pair over the email', () => {
    const { updates } = plan(
      [person({ code: 'WnYg', name: 'Wen Yang', email: 'yang@rehwaldt.de' })],
      [employee({ id: 54, firstName: 'Binyu', lastName: 'Yang', email: 'other@rehwaldt.de' }), employee({ id: 7, email: 'yang@rehwaldt.de' })],
      { pairs: { '54': 'WnYg' } },
    )
    expect(updates.map((update) => update.id)).toEqual([54])
  })

  it('leaves out skipped WerkX people', () => {
    const { updates, creates, issues } = plan(
      [person(), person({ code: 'MxOd', name: 'Max Mustermann alt', email: null })],
      [employee()],
      { skip: ['MxOd', 'XxXx'] },
    )
    expect(updates.map((update) => update.data.code)).toEqual(['MxMn'])
    expect(creates).toEqual([])
    expect(issues('Skipped (pairs file)')).toEqual(['Max Mustermann alt (MxOd)'])
    expect(issues('Skip with an unknown WerkX code')).toEqual(['XxXx'])
  })

  it('reports pairs that point nowhere', () => {
    const { issues } = plan([person()], [employee()], { pairs: { '99': 'XxXx' } })
    expect(issues('Pair with an unknown WerkX code')).toEqual(['99 → XxXx'])
    expect(issues('Pair with an unknown employee id')).toEqual(['99 → XxXx'])
  })

  it('skips employees with unpublished changes or another code', () => {
    const { updates, issues } = plan(
      [person(), person({ code: 'ErMr', name: 'Erika Muster', email: 'erika@rehwaldt.de' })],
      [
        employee({ pendingDraft: true }),
        employee({ id: 2, firstName: 'Erika', lastName: 'Muster', email: 'erika@rehwaldt.de', code: 'EmMu' }),
      ],
    )
    expect(updates).toEqual([])
    expect(issues('Unpublished changes in the CMS (skipped, set the dates by hand)')).toHaveLength(1)
    expect(issues('Different code in the CMS (skipped)')).toHaveLength(1)
  })

  it('lists published employees who leave the website and inactive ones without an exit date', () => {
    const { issues } = plan(
      [
        person({ exitDate: '2024-12-31', active: false }),
        person({ code: 'ErMr', name: 'Erika Muster', email: 'erika@rehwaldt.de', active: false }),
      ],
      [employee(), employee({ id: 2, firstName: 'Erika', lastName: 'Muster', email: 'erika@rehwaldt.de' })],
    )
    expect(issues('Published, leaves the website (exit date passed)')).toHaveLength(1)
    expect(issues('Inactive in WerkX without an exit date')).toHaveLength(1)
  })

  it('takes no dates for someone now in an office WerkX doesn’t cover', () => {
    // A stint in Dresden, then a move to Prague: WerkX's exit date ends the Dresden stint only.
    const { updates, issues } = plan(
      [person({ exitDate: '2018-02-09', active: false })],
      [employee({ office: 'Prag' })],
    )
    expect(updates).toEqual([{ id: 1, status: 'published', data: { code: 'MxMn' } }])
    expect(issues("Works in Prag, which WerkX doesn't cover (dates kept)")).toHaveLength(1)
    expect(issues('Published, leaves the website (exit date passed)')).toEqual([])
  })

  it('reports differences in name, email and office without changing them', () => {
    const { updates, issues } = plan(
      [person({ code: 'MxMn', name: 'Maximilian Mustermann', email: 'max@werkx.local', location: 'Berlin' })],
      [employee({ code: 'MxMn', entryDate: '2015-03-01T12:00:00.000Z', birthDate: '1990-05-17T12:00:00.000Z' })],
    )
    expect(updates).toEqual([])
    expect(issues('Name differs (kept)')).toHaveLength(1)
    expect(issues('Email differs (kept)')).toHaveLength(1)
    expect(issues('Office differs (kept)')).toHaveLength(1)
  })

  it('creates a draft for someone only WerkX knows', () => {
    const { creates, issues } = plan(
      [person({ code: 'JnDe', name: 'Jana Doe', email: null, exitDate: '2019-08-31', active: false, location: 'Berlin' })],
      [],
    )
    expect(creates).toEqual([
      {
        code: 'JnDe',
        data: {
          firstName: 'Jana',
          lastName: 'Doe',
          code: 'JnDe',
          entryDate: '2015-03-01T12:00:00.000Z',
          exitDate: '2019-08-31T12:00:00.000Z',
          birthDate: '1990-05-17T12:00:00.000Z',
          office: 2,
        },
      },
    ])
    expect(issues('Created as draft')).toEqual(['Jana Doe (JnDe)'])
  })

  it('splits names at the first space and asks to check unusual ones', () => {
    const { creates, issues } = plan(
      [person({ code: 'AnMr', name: 'Anna-Lena van Meer', email: null })],
      [],
    )
    expect(creates[0].data).toMatchObject({ firstName: 'Anna-Lena', lastName: 'van Meer' })
    expect(issues('Name split to check')).toHaveLength(1)
  })

  it('lists active people without a profile', () => {
    const { issues } = plan([person({ code: 'TmHn', name: 'Tim Example', email: null })], [])
    expect(issues('Active in WerkX, not on the website yet (draft)')).toEqual(['Tim Example (TmHn)'])
  })

  it('lists employees WerkX doesn’t know, by office', () => {
    const { issues } = plan([], [employee({ office: 'Prag' }), employee({ id: 2, office: null })])
    expect(issues('Not in WerkX: Prag')).toHaveLength(1)
    expect(issues('Not in WerkX: no office')).toHaveLength(1)
  })
})

describe('toWerkxPerson', () => {
  it('keeps only the fields the import needs', () => {
    const record = {
      id: 'MxMn ',
      name: ' Max Mustermann',
      email: '',
      birthday: '1990-05-17',
      entry_date: '2015-03-01',
      exit_date: null,
      location: { id: 1, name: 'Dresden' },
      team_id: null,
      color: '#CCCCCC',
      active: true,
      balance_start: 12,
    }
    expect(toWerkxPerson(record)).toEqual({
      code: 'MxMn',
      name: 'Max Mustermann',
      email: null,
      birthDate: '1990-05-17',
      entryDate: '2015-03-01',
      exitDate: null,
      location: 'Dresden',
      active: true,
    })
  })
})
