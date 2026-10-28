import { describe, expect, it } from 'vitest'
import { planEmployees, planOffices } from '@/migration/plan/office'
import { ref } from '@/migration/plan/types'
import { harness } from './fixtures'

describe('planOffices', () => {
  const plan = () => {
    const h = harness({
      standorte: [
        { index: 3, position: 2, name_de: 'Peking', kontakt_zh: '<p>联系人</p>' },
        { index: 1, position: 1, name_de: 'Dresden' },
        { index: 9, position: 3, name_de: 'Neu' },
      ],
    })
    return { ...h, plans: planOffices(h.ctx) }
  }

  it('orders offices by position', () => {
    expect(plan().plans.map((office) => office.key)).toEqual(['1', '3', '9'])
  })

  it('fills address and contact from the transcribed details', () => {
    const [dresden] = plan().plans
    expect(dresden.data).toMatchObject({
      name: 'Dresden',
      address: { street: 'Bautzner Strasse 133', postalCode: '01099', city: 'Dresden', country: 'DE' },
      contact: { email: 'mail@rehwaldt.de' },
    })
  })

  it('localizes the city and the contact notes', () => {
    const beijing = plan().plans[1]
    expect(beijing.data.address).toMatchObject({ city: 'Peking', country: 'CN' })
    expect(beijing.localized.en?.address).toEqual({ city: 'Beijing' })
    expect(beijing.localized.zh).toMatchObject({ address: { city: '北京' }, contactNote: { html: '<p>联系人</p>' } })
    expect(JSON.stringify(beijing.data.contactNote)).toContain('Guangzhou')
  })

  it('reports offices without transcribed details', () => {
    const { plans, issues } = plan()
    expect(plans[2].data).toMatchObject({ address: {}, contact: {} })
    expect(issues('Office without transcribed address (address left empty)')).toEqual(['office 9'])
  })
})

describe('planEmployees', () => {
  const bilder = [{ index: 3, pfad: 'a.jpg' }]

  it('maps an active employee with office, portrait and Chinese name', () => {
    const { ctx } = harness(
      {
        standorte: [{ index: 1 }],
        bilder,
        mitarbeiter: [
          { index: 1, aktiv: 1, vorname: 'Jing', nachname: 'Wu', vorname_zh: '吴', nachname_zh: '婧', standort: 1, bild: 3 },
        ],
      },
      ['a.jpg'],
    )
    const [employee] = planEmployees(ctx)
    expect(employee).toMatchObject({
      status: 'published',
      data: { firstName: 'Jing', lastName: 'Wu', chineseName: '吴婧', office: ref('offices', 1), portrait: ref('media', 3) },
    })
    expect(employee.localized.zh ?? {}).not.toHaveProperty('firstName')
  })

  it('imports former employees as drafts without a portrait', () => {
    const { ctx, issues } = harness(
      { standorte: [{ index: 1 }], bilder, mitarbeiter: [{ index: 2, aktiv: 0, standort: 7, bild: 3 }] },
      ['a.jpg'],
    )
    const [employee] = planEmployees(ctx)
    expect(employee).toMatchObject({ status: 'draft', data: { chineseName: null, office: null, portrait: null } })
    expect(ctx.usedImageIds()).toEqual([])
    expect(issues('Employee with an unknown office')).toEqual(['employee 2'])
  })

  it('flags status notes stored as qualifications', () => {
    const { ctx, issues } = harness({ mitarbeiter: [{ index: 1, aktiv: 1, quali_de: 'Elternzeit', quali_en: 'M.Sc.' }] })
    planEmployees(ctx)
    expect(issues('Status note stored as a qualification (check by hand)')).toEqual(['employee 1 [de]: Elternzeit'])
  })
})
