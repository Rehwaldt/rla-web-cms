import path from 'path'
import type { LegacySnapshot } from '../legacy'
import { num, str } from '../legacy'
import type { Report } from '../report'
import { byLocale, docPlan } from './build'
import { createPlanContext, type PlanContext, type RichTextConverter } from './context'
import {
  planAwards,
  planJobs,
  planNews,
  planPages,
  planProjectCategories,
  planPublicationCategories,
  planPublications,
  planTopics,
} from './content'
import { planEmployees, planOffices } from './office'
import { flowTextElementIds } from './parsers'
import { planProjectGallery, planProjects } from './projects'
import type { DocPlan, Plan } from './types'

/** Media documents for every image some plan referenced (must run after all other planners). */
function planImages(ctx: PlanContext): DocPlan[] {
  const images = new Map(ctx.snapshot.bilder.map((row) => [num(row, 'index'), row]))
  return ctx.usedImageIds().map((imageId) => {
    const row = images.get(imageId)!
    const where = `image ${imageId}`
    const folder = str(row, 'projekt')
    const project = folder && !folder.startsWith('_') ? ctx.projectKeyByCode(folder) : null
    if (folder && !folder.startsWith('_') && !project) {
      ctx.report.add('Image folder is not a known project code (no project set)', `${where}: ${folder}`)
    }
    return docPlan({
      collection: 'media',
      legacyId: imageId,
      filePath: path.join(ctx.filesRoot, '0_img', str(row, 'pfad')!),
      perLocale: byLocale({ alt: ctx.plainByLocale(row, 'label', where) }),
      shared: {
        credit: str(row, 'copyright'),
        project: project ? { $ref: { collection: 'projects', key: project } } : null,
      },
    })
  })
}

/**
 * Maps the whole legacy snapshot to a write plan. Pure apart from checking which files exist:
 * no Payload access, no ids — documents reference each other by legacy key.
 */
export function planWebsite(
  snapshot: LegacySnapshot,
  report: Report,
  filesRoot: string,
  convertHtml: RichTextConverter,
): Plan {
  const ctx = createPlanContext(snapshot, report, filesRoot, convertHtml)
  const publications = planPublications(ctx)
  const contentDocs = [
    ...planProjectCategories(ctx),
    ...planPublicationCategories(ctx),
    ...planOffices(ctx),
    ...planProjects(ctx),
    ...planTopics(ctx),
    ...planNews(ctx),
    ...planAwards(ctx),
    ...publications.docs,
    ...planJobs(ctx),
    ...planPages(ctx),
    ...planEmployees(ctx),
  ]
  const gallery = planProjectGallery(ctx)

  const referenced = new Set([
    ...snapshot.projekte.flatMap((row) => flowTextElementIds(str(row, 'bilder_flow'))),
    ...snapshot.themen.flatMap((row) => flowTextElementIds(str(row, 'flow'))),
    ...snapshot.buero.flatMap((row) => ['de', 'en', 'zh', 'cz'].flatMap((suffix) => flowTextElementIds(str(row, `flow_${suffix}`)))),
  ])
  const unreferenced = snapshot.textelemente.filter((row) => !referenced.has(num(row, 'index')!)).length
  report.count('text elements not referenced by any flow (not imported)', unreferenced)

  const media = [...planImages(ctx), ...publications.pdfs]
  const docs = [...media, ...contentDocs]
  for (const doc of docs) report.count(`planned ${doc.collection}`)
  return { docs, globals: [gallery] }
}
