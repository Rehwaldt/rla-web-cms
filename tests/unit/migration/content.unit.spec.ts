import { describe, expect, it } from 'vitest'
import {
  planJobs,
  planNews,
  planPages,
  planProjectCategories,
  planPublications,
  planTopics,
} from '@/migration/plan/content'
import { ref } from '@/migration/plan/types'
import { harness } from './fixtures'

const projekte = [{ ID: 7, kuerzel: 'PRK' }]

describe('planProjectCategories', () => {
  it('orders groups before children and keeps the menu column on groups only', () => {
    const { ctx, issues } = harness({
      projektkategorien: [
        { index: 3, kategorie: 1, position: 1, spalte: 2, name_de: 'Child' },
        { index: 1, position: 2, spalte: 2, name_de: 'Group B' },
        { index: 2, position: 1, spalte: 1, name_de: 'Group A' },
        { index: 4, kategorie: 99, position: 0, name_de: 'Orphan' },
      ],
    })
    const plans = planProjectCategories(ctx)
    expect(plans.map((plan) => plan.key)).toEqual(['2', '1', '4', '3'])
    const byKey = Object.fromEntries(plans.map((plan) => [plan.key, plan.data]))
    expect(byKey['1']).toMatchObject({ parent: null, menuColumn: '2', name: 'Group B' })
    expect(byKey['3']).toMatchObject({ parent: ref('project-categories', 1), menuColumn: null })
    expect(issues('Category with an unknown parent')).toEqual(['project category 4'])
  })
})

describe('planTopics', () => {
  it('publishes topics and keeps known projects only', () => {
    const { ctx, issues } = harness({ projekte, themen: [{ index: 1, name_de: 'Wasser', projekte: 'PRK|QQ' }] })
    const [plan] = planTopics(ctx)
    expect(plan).toMatchObject({ status: 'published', data: { name: 'Wasser', image: null } })
    expect(plan.data.projects).toEqual([ref('projects', 7)])
    expect(issues('Reference to an unknown project code (dropped)')).toEqual(['topic 1: "QQ"'])
  })
})

describe('planNews', () => {
  it('maps status, date and per-language visibility', () => {
    const { ctx } = harness({
      aktuell: [
        { index: 1, aktiv: 1, datum: '2024-05-01', name_de: 'Neu', position_en: 3 },
        { index: 2, aktiv: 0 },
      ],
    })
    const [published, draft] = planNews(ctx)
    expect(published).toMatchObject({ status: 'published', data: { date: '2024-05-01', title: 'Neu', visibleIn: ['en'] } })
    expect(draft.status).toBe('draft')
  })

  it('reports a legacy project field only when no link points at that project', () => {
    const { ctx, issues } = harness({
      projekte,
      aktuell: [
        { index: 1, projekt: 'PRK', links_en: 'Park;proj:prk' },
        { index: 2, projekt: 'PRK' },
      ],
    })
    const [linked] = planNews(ctx)
    expect(linked.localized.en?.links).toEqual([{ kind: 'project', label: 'Park', project: ref('projects', 7) }])
    expect(issues('News project field not covered by its links (dropped)')).toEqual(['news 2: PRK'])
  })
})

describe('planPublications', () => {
  const pdf = '4_res/publikationen/a.pdf'
  const plan = () => {
    const h = harness(
      {
        projekte,
        publikationen: [
          {
            index: 1,
            aktiv: 1,
            name: 'Article',
            untertitel: 'Sub',
            buch: 'Book',
            buchuntertitel: 'Book sub',
            datei: 'a.pdf',
            kategorie: 2,
            projekte: 'PRK|QQ',
          },
          { index: 2, buch: 'Book', untertitel: 'S1', buchuntertitel: 'S2', datei: 'a.pdf' },
          { index: 3, name: 'Lost', datei: 'missing.pdf' },
        ],
      },
      [],
      [pdf],
    )
    return { ...h, result: planPublications(h.ctx) }
  }

  it('maps articles with their book as book title', () => {
    const [article] = plan().result.docs
    expect(article).toMatchObject({
      status: 'published',
      data: {
        title: 'Article',
        subtitle: 'Sub',
        bookTitle: 'Book',
        bookSubtitle: 'Book sub',
        category: ref('publication-categories', 2),
        file: ref('media', 'pdf:a.pdf'),
        projects: [ref('projects', 7)],
      },
    })
  })

  it('titles books by the book and keeps its subtitle', () => {
    const { result, issues } = plan()
    const book = result.docs[1]
    expect(book.status).toBe('draft')
    expect(book.data).toMatchObject({ title: 'Book', subtitle: 'S2' })
    expect(book.data).not.toHaveProperty('bookTitle')
    expect(issues('Book publication with two subtitles (book subtitle kept)')).toEqual(['publication 2'])
  })

  it('plans each PDF once, matched by file name, and drops missing ones', () => {
    const { result, issues } = plan()
    expect(result.pdfs).toHaveLength(1)
    expect(result.pdfs[0]).toMatchObject({
      collection: 'media',
      key: 'pdf:a.pdf',
      match: { field: 'filename', value: 'a.pdf' },
      data: { alt: 'Article' },
    })
    expect(result.pdfs[0].filePath).toMatch(/4_res[\\/]publikationen[\\/]a\.pdf$/)
    expect(result.docs[2].data.file).toBeNull()
    expect(issues('Publication PDF missing on disk (dropped)')).toEqual(['publication 3: 4_res/publikationen/missing.pdf'])
  })
})

describe('planJobs', () => {
  it('publishes jobs shown in any language and links the office', () => {
    const { ctx } = harness({ jobs: [{ id: 1, anzeige_de: 1, standort: 5 }, { id: 2 }] })
    const [shown, hidden] = planJobs(ctx)
    expect(shown).toMatchObject({ status: 'published', data: { office: ref('offices', 5), visibleIn: ['de'] } })
    expect(hidden).toMatchObject({ status: 'draft', data: { office: null, visibleIn: [] } })
  })
})

describe('planPages', () => {
  const plan = () => {
    const h = harness({
      buero: [
        {
          index: 1,
          seite: 'kontakt-impressum',
          titel_de: 'Impressum',
          untertitel_de: '<p>a</p><p>b</p>',
          flow_de: 't1',
          flow_en: 't1',
        },
        { index: 2, seite: 'buero-profil-2026' },
        { index: 3, seite: 'unknown' },
      ],
      textelemente: [{ index: 1, titel_de: 'Titel' }],
    })
    return { ...h, plans: planPages(h.ctx) }
  }

  it('maps legacy page ids to English keys and skips the abandoned draft', () => {
    const { plans, issues } = plan()
    expect(plans).toHaveLength(1)
    expect(plans[0]).toMatchObject({ status: 'published', data: { key: 'imprint', title: 'Impressum', subtitle: 'a\nb' } })
    expect(issues('Page with an unmapped key (skipped)')).toEqual(['page 3 (unknown)'])
  })

  it('gives each language its own flow, with text falling back to en, then de', () => {
    const [page] = plan().plans
    expect(page.data.flow).toMatchObject([{ blockType: 'text', title: 'Titel' }])
    expect(page.localized.en?.flow).toMatchObject([{ blockType: 'text', title: 'Titel' }])
    expect(page.localized.zh).toBeUndefined()
  })
})
