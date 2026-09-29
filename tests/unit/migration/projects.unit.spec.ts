import { describe, expect, it } from 'vitest'
import { planProjectGallery, planProjects } from '@/migration/plan/projects'
import { ref } from '@/migration/plan/types'
import { harness, projectRow } from './fixtures'

describe('planProjects', () => {
  const planOne = (overrides = {}, tables = {}) => {
    const h = harness({ projekte: [projectRow(overrides)], ...tables })
    return { ...h, plan: planProjects(h.ctx)[0] }
  }

  it('maps the legacy type flags', () => {
    expect(planOne().plan.data.type).toBe('object')
    expect(planOne({ objektplanung: 0 }).plan.data.type).toBe('concept')
    expect(planOne({ als_wettbewerb: 1 }).plan.data.type).toBe('competition')
    const { plan, issues } = planOne({ als_projekt: 0 })
    expect(plan.data.type).toBeNull()
    expect(issues('Project without a type (left empty)')).toHaveLength(1)
  })

  it('imports inactive projects as drafts and keys them by legacy id', () => {
    const { plan } = planOne({ ID: 42, aktiv: 0 })
    expect(plan).toMatchObject({ key: '42', status: 'draft', match: { field: 'legacyId', value: 42 } })
  })

  it('imports projects with the placeholder code without one', () => {
    const { plan, issues } = planOne({ kuerzel: 'zz' })
    expect(plan.data.code).toBeNull()
    expect(issues('Project without a code (imported without one)')).toHaveLength(1)
  })

  it('falls back to the planned completion year and drops implausible years', () => {
    expect(planOne({ fertigstellung_geplant: 2030 }).plan.data.completionYear).toBe(2030)
    const { plan, issues } = planOne({ fertigstellung: 20015 })
    expect(plan.data.completionYear).toBeNull()
    expect(issues('Implausible year (dropped)')).toHaveLength(1)
  })

  it('keeps known categories only', () => {
    const { plan, issues } = planOne({ kategorie: '1|2' }, { projektkategorien: [{ index: 1 }] })
    expect(plan.data.categories).toEqual([ref('project-categories', 1)])
    expect(issues('Project references an unknown category (dropped)')).toHaveLength(1)
  })

  it('stores each similar-projects pair once, on its first side', () => {
    const { ctx, issues } = harness({
      projekte: [projectRow({ ID: 1, kuerzel: 'A' }), projectRow({ ID: 2, kuerzel: 'B' })],
      aehnliche_projekte: [
        { id: 1, projekt1: 'a', projekt2: 'B' },
        { id: 2, projekt1: 'B', projekt2: 'A' },
        { id: 3, projekt1: 'A', projekt2: 'A' },
        { id: 4, projekt1: 'A', projekt2: 'Q' },
      ],
    })
    const [a, b] = planProjects(ctx)
    expect(a.data.similarProjects).toEqual([ref('projects', 2)])
    expect(b.data.similarProjects).toEqual([])
    expect(issues('Similar-projects pair with an unknown project code (dropped)')).toHaveLength(1)
  })

  it('writes secondary-locale flows only when they carry their own text', () => {
    const tables = {
      bilder: [{ index: 3, pfad: 'a.jpg' }],
      textelemente: [{ index: 1, titel_de: 'Titel', titel_en: 'Title' }],
    }
    const withText = harness(
      { projekte: [projectRow({ bilder_flow: '3|t1', name_en: 'Park EN' })], ...tables },
      ['a.jpg'],
    )
    const [plan] = planProjects(withText.ctx)
    expect(plan.data.flow).toHaveLength(2)
    expect(plan.localized.en).toMatchObject({ name: 'Park EN', flow: expect.any(Array) })
    expect(plan.localized.en?.flow).toHaveLength(2)

    const imagesOnly = harness({ projekte: [projectRow({ bilder_flow: '3' })], ...tables }, ['a.jpg'])
    expect(planProjects(imagesOnly.ctx)[0].localized).toEqual({})
  })

  it('reads visibility flags per language', () => {
    expect(planOne({ anzeige_de: 1, anzeige_cz: 1 }).plan.data.visibleIn).toEqual(['de', 'cs'])
  })
})

describe('planProjectGallery', () => {
  it('orders projects per language by gallery position', () => {
    const { ctx } = harness({
      projekte: [
        projectRow({ ID: 1, galerieposition_de: 2, galerieposition_en: 1 }),
        projectRow({ ID: 2, galerieposition_de: 1, aktiv: 0 }),
        projectRow({ ID: 3 }),
      ],
    })
    const { localized } = planProjectGallery(ctx)
    expect(localized.de.projects).toEqual([ref('projects', 2), ref('projects', 1)])
    expect(localized.en.projects).toEqual([ref('projects', 1)])
    expect(localized.cs.projects).toEqual([])
  })
})
