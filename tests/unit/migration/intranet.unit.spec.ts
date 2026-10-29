import { describe, expect, it, vi } from 'vitest'
import { type CmsGroup, type CmsPerson, planIntranet, type PlanOptions } from '@/migration/intranet/plan'
import { type IntranetGroup, type IntranetPerson, toIntranetGroup, toIntranetPerson } from '@/migration/intranet/source'
import { Report } from '@/migration/report'

// The intranet's tree: a wrapping root, two branches, leaves.
const groups: IntranetGroup[] = [
  { intranetId: 1, name: 'Fachgruppen', parent: 0 },
  { intranetId: 2, name: 'Service', parent: 1 },
  { intranetId: 3, name: 'Fachthemen', parent: 1 },
  { intranetId: 4, name: 'Spielplatz', parent: 3 },
  { intranetId: 5, name: 'Regenwasser', parent: 3 },
  { intranetId: 6, name: 'Kaffeemaschine', parent: 2 },
]

const person = (overrides: Partial<IntranetPerson> = {}): IntranetPerson => ({
  intranetId: 900,
  firstName: 'Max',
  lastName: 'Mustermann',
  email: 'max.mustermann@rehwaldt.de',
  mobilePhone: null,
  groups: [5, 6],
  certificates: [],
  degree: null,
  retired: false,
  hasPortrait: false,
  ...overrides,
})

const employee = (overrides: Partial<CmsPerson> = {}): CmsPerson => ({
  id: 1,
  firstName: 'Max',
  lastName: 'Mustermann',
  email: 'max.mustermann@rehwaldt.de',
  intranetId: null,
  status: 'published',
  pendingDraft: false,
  mobilePhone: null,
  hasPortrait: true,
  expertise: [],
  qualifications: [],
  degree: null,
  exitDate: null,
  ...overrides,
})

function plan(
  people: IntranetPerson[],
  employees: CmsPerson[],
  options: Partial<PlanOptions> & { cmsGroups?: CmsGroup[] } = {},
) {
  const report = new Report()
  const recorded: [string, string][] = []
  const add = report.add.bind(report)
  vi.spyOn(report, 'add').mockImplementation((category, detail) => {
    recorded.push([category, detail])
    add(category, detail)
  })
  const { cmsGroups = [], ...rest } = options
  const result = planIntranet(people, groups, employees, cmsGroups, report, {
    pairs: {},
    skip: [],
    external: [],
    today: '2026-10-29',
    adminUrl: (id) => `/admin/collections/employees/${id}`,
    ...rest,
  })
  const issues = (category: string) => recorded.filter(([c]) => c === category).map(([, detail]) => detail)
  return { ...result, issues, report }
}

describe('planIntranet: groups', () => {
  it('drops the wrapping root and creates parents first, siblings alphabetically', () => {
    expect(plan([], []).groups.creates).toEqual([
      { intranetId: 3, name: 'Fachthemen', parent: null },
      { intranetId: 5, name: 'Regenwasser', parent: 3 },
      { intranetId: 4, name: 'Spielplatz', parent: 3 },
      { intranetId: 2, name: 'Service', parent: null },
      { intranetId: 6, name: 'Kaffeemaschine', parent: 2 },
    ])
  })

  it('updates existing groups by intranet id and leaves unchanged ones alone', () => {
    const cmsGroups: CmsGroup[] = [
      { id: 10, intranetId: 3, name: 'Fachthemen', parent: null },
      { id: 11, intranetId: 5, name: 'Regen', parent: null },
      { id: 12, intranetId: 4, name: 'Spielplatz', parent: 10 },
      { id: 13, intranetId: 2, name: 'Service', parent: null },
      { id: 14, intranetId: 6, name: 'Kaffeemaschine', parent: 13 },
    ]
    const { groups: planned } = plan([], [], { cmsGroups })
    expect(planned.creates).toEqual([])
    expect(planned.updates).toEqual([{ id: 11, name: 'Regenwasser', parent: 3 }])
  })
})

describe('planIntranet: employees', () => {
  it('fills the intranet id, groups, qualifications and mobile phone of an employee matched by email', () => {
    const { employees } = plan(
      [person({ certificates: ['Zertifikat Umweltbaubegleitung'], mobilePhone: '+49 170 1234567' })],
      [employee()],
    )
    expect(employees).toEqual([
      {
        id: 1,
        status: 'published',
        data: { intranetId: 900, mobilePhone: '+49 170 1234567' },
        groups: [5, 6],
        qualifications: ['Zertifikat Umweltbaubegleitung'],
      },
    ])
  })

  it('never assigns the wrapping root', () => {
    const { employees } = plan([person({ groups: [1, 4] })], [employee()])
    expect(employees[0].groups).toEqual([4])
  })

  it('changes nothing on a second run', () => {
    const cmsGroups: CmsGroup[] = [
      { id: 20, intranetId: 5, name: 'Regenwasser', parent: null },
      { id: 21, intranetId: 6, name: 'Kaffeemaschine', parent: null },
    ]
    const { employees, report } = plan([person()], [employee({ intranetId: 900, expertise: [21, 20] })], { cmsGroups })
    expect(employees).toEqual([])
    expect(report.summary()).toContain('unchanged: 1')
  })

  it('keeps what the CMS already has and reports differences', () => {
    const { employees, issues } = plan(
      [person({ intranetId: 900, groups: [], certificates: ['Gutachter'], mobilePhone: '0170 111', degree: 'M.Sc. Landschaftsarchitektur, TU Berlin' })],
      [employee({ intranetId: 900, qualifications: ['Sachverständiger'], mobilePhone: '0170 222', degree: 'M.Sc. Landschaftsarchitektur, TU Dresden' })],
    )
    expect(employees).toEqual([])
    expect(issues('Qualifications differ (kept)')).toHaveLength(1)
    expect(issues('Mobile phone differs (kept)')).toHaveLength(1)
    expect(issues('Degree differs (kept)')).toHaveLength(1)
  })

  it('matches by name parts only among employees nobody else matched', () => {
    const { employees, issues } = plan(
      [person({ intranetId: 901, email: null }), person({ intranetId: 900 })],
      [employee()],
    )
    expect(employees.map((update) => update.data.intranetId)).toEqual([900])
    expect(issues('Created as draft')).toEqual(['Max Mustermann (intranet 901)'])
  })

  it('creates drafts for people the CMS doesn’t have, external ones marked', () => {
    const { creates, issues } = plan(
      [
        person({ intranetId: 910, firstName: 'Jana', lastName: 'Doe', email: null, retired: true, groups: [1, 4], certificates: ['Gutachterin'] }),
        person({ intranetId: 911, firstName: 'Ole', lastName: 'Frei', email: 'ole@rehwaldt.de', mobilePhone: '0170 1' }),
      ],
      [],
      { external: [911, 999] },
    )
    expect(creates).toEqual([
      { intranetId: 910, data: { firstName: 'Jana', lastName: 'Doe', external: false }, groups: [4], qualifications: ['Gutachterin'] },
      {
        intranetId: 911,
        data: { firstName: 'Ole', lastName: 'Frei', email: 'ole@rehwaldt.de', mobilePhone: '0170 1', external: true },
        groups: [5, 6],
        qualifications: [],
      },
    ])
    expect(issues('Created as external draft')).toEqual(['Ole Frei (intranet 911)'])
    expect(issues('Retired, created without an exit date (add it by hand)')).toEqual(['Jana Doe (intranet 910, retired)'])
    expect(issues('External with an unknown intranet id')).toEqual(['999'])
  })

  it('follows pairs and skips', () => {
    const { employees, issues } = plan(
      [person({ intranetId: 901, firstName: 'Jana', lastName: 'Doe', email: null }), person({ intranetId: 902, email: null, retired: true })],
      [employee({ id: 7, firstName: 'Jana', lastName: 'Doe-Meyer', email: null })],
      { pairs: { '7': 901 }, skip: [902] },
    )
    expect(employees.map((update) => update.id)).toEqual([7])
    expect(issues('Skipped (pairs file)')).toEqual(['Max Mustermann (intranet 902, retired)'])
  })

  it('skips employees with unpublished changes or another intranet id', () => {
    const { employees, issues } = plan(
      [person(), person({ intranetId: 905, firstName: 'Erika', lastName: 'Muster', email: 'erika@rehwaldt.de' })],
      [employee({ pendingDraft: true }), employee({ id: 2, firstName: 'Erika', lastName: 'Muster', email: 'erika@rehwaldt.de', intranetId: 777 })],
    )
    expect(employees).toEqual([])
    expect(issues('Unpublished changes in the CMS (skipped, fill in by hand)')).toHaveLength(1)
    expect(issues('Different intranet id in the CMS (skipped)')).toHaveLength(1)
  })

  it('reports portraits only in the intranet and disagreements about leaving', () => {
    const { issues } = plan(
      [
        person({ hasPortrait: true, retired: true }),
        person({ intranetId: 905, firstName: 'Erika', lastName: 'Muster', email: 'erika@rehwaldt.de', retired: false }),
      ],
      [
        employee({ hasPortrait: false }),
        employee({ id: 2, firstName: 'Erika', lastName: 'Muster', email: 'erika@rehwaldt.de', exitDate: '2024-06-30T12:00:00.000Z' }),
      ],
    )
    expect(issues('Portrait only in the intranet')).toHaveLength(1)
    expect(issues('Retired in the intranet, no exit date in the CMS')).toHaveLength(1)
    expect(issues('Not retired in the intranet, but the exit date has passed')).toHaveLength(1)
  })

  it('lists employees the intranet doesn’t have', () => {
    const { issues } = plan([], [employee()])
    expect(issues('Not in the intranet')).toEqual(['Max Mustermann (published) /admin/collections/employees/1'])
  })
})

describe('intranet source', () => {
  it('keeps only what the import needs', () => {
    const post = {
      id: 900,
      fachgruppen: [5],
      acf: {
        vorname: ' Max ',
        name: 'Mustermann',
        email: '',
        'mobil-telefon': '0170  1234',
        'uni-abschluss': 'M.Sc.  Landschaftsarchitektur',
        qualifikationen: [{ zertifikat_qualifikation: 'Gutachter' }, { zertifikat_qualifikation: '' }],
        retired: false,
        bild: 123,
        telefon: '0351 1',
        team: 'Sebastian',
      },
    }
    expect(toIntranetPerson(post)).toEqual({
      intranetId: 900,
      firstName: 'Max',
      lastName: 'Mustermann',
      email: null,
      mobilePhone: '0170 1234',
      groups: [5],
      certificates: ['Gutachter'],
      degree: 'M.Sc. Landschaftsarchitektur',
      retired: false,
      hasPortrait: true,
    })
  })

  it('decodes HTML entities in group names', () => {
    expect(toIntranetGroup({ id: 7, name: 'Brunnen&#047;Wasserspiel &amp; Co', parent: 3 }).name).toBe(
      'Brunnen/Wasserspiel & Co',
    )
  })
})
