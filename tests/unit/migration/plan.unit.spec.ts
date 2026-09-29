import { describe, expect, it } from 'vitest'
import { planWebsite } from '@/migration/plan'
import { ref } from '@/migration/plan/types'
import { Report } from '@/migration/report'
import { convertHtml, filesRoot, projectRow, snapshot } from './fixtures'

describe('planWebsite', () => {
  const plan = () => {
    const report = new Report()
    const legacy = snapshot({
      projekte: [projectRow({ ID: 1, kuerzel: 'ABC', bilder_flow: '3', galerieposition_de: 1 })],
      bilder: [
        { index: 3, pfad: 'abc/a.jpg', projekt: 'ABC', label_en: 'Park' },
        { index: 4, pfad: 'misc/b.jpg', projekt: '_misc' },
      ],
      textelemente: [{ index: 1 }],
      publikationen: [{ index: 1, name: 'Article', datei: 'p.pdf' }],
    })
    const root = filesRoot(['0_img/abc/a.jpg', '0_img/misc/b.jpg', '4_res/publikationen/p.pdf'])
    return { report, result: planWebsite(legacy, report, root, convertHtml) }
  }

  it('plans media first, and only for images something references', () => {
    const { docs } = plan().result
    expect(docs.slice(0, 2).map((doc) => `${doc.collection}:${doc.key}`)).toEqual(['media:3', 'media:pdf:p.pdf'])
    expect(docs.filter((doc) => doc.collection === 'media')).toHaveLength(2)
  })

  it('links images to the project named by their folder', () => {
    const [image] = plan().result.docs
    expect(image).toMatchObject({ data: { project: ref('projects', 1) }, localized: { en: { alt: 'Park' } } })
    expect(image.filePath).toMatch(/0_img[\\/]abc[\\/]a\.jpg$/)
  })

  it('plans the gallery global and counts unreferenced text elements', () => {
    const { result, report } = plan()
    expect(result.globals).toEqual([
      {
        slug: 'project-gallery',
        localized: {
          de: { projects: [ref('projects', 1)] },
          en: { projects: [] },
          zh: { projects: [] },
          cs: { projects: [] },
        },
      },
    ])
    expect(report.summary()).toContain('text elements not referenced by any flow (not imported): 1')
    expect(report.summary()).toContain('planned projects: 1')
  })
})
