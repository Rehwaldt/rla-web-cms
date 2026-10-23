import fs from 'fs'
import { bool, num, pipeList, str } from '../legacy'
import { byLocale, docPlan } from './build'
import type { PlanContext } from './context'
import { flowBlocks, localesWithFlag, localesWithValue, parseLinks, splitTimeline } from './parsers'
import { type DocPlan, type Locale, LEGACY_SUFFIX, LOCALES, ref } from './types'

const linksByLocale = (ctx: PlanContext, row: Record<string, unknown>, where: string) =>
  Object.fromEntries(
    LOCALES.map((locale) => [locale, parseLinks(ctx, str(row, `links_${LEGACY_SUFFIX[locale]}`), `${where} [${locale}]`)]),
  )

export function planProjectCategories(ctx: PlanContext): DocPlan[] {
  // Top-level groups first, then children — creation order becomes the list order.
  const rows = [...ctx.snapshot.projektkategorien].sort(
    (a, b) =>
      Number(num(a, 'kategorie') !== null) - Number(num(b, 'kategorie') !== null) ||
      num(a, 'position')! - num(b, 'position')! ||
      num(a, 'index')! - num(b, 'index')!,
  )
  const ids = new Set(rows.map((row) => num(row, 'index')))
  return rows.map((row) => {
    const legacyId = num(row, 'index')!
    const where = `project category ${legacyId}`
    const parentId = num(row, 'kategorie')
    if (parentId !== null && !ids.has(parentId)) ctx.report.add('Category with an unknown parent', where)
    const column = num(row, 'spalte')
    return docPlan({
      collection: 'project-categories',
      legacyId,
      perLocale: byLocale({ name: ctx.plainByLocale(row, 'name', where) }),
      shared: {
        parent: parentId !== null ? ref('project-categories', parentId) : null,
        menuColumn: parentId === null && column ? String(column) : null,
      },
    })
  })
}

export function planPublicationCategories(ctx: PlanContext): DocPlan[] {
  return [...ctx.snapshot.publikationskategorien]
    .sort((a, b) => num(a, 'index')! - num(b, 'index')!)
    .map((row) => {
      const legacyId = num(row, 'index')!
      return docPlan({
        collection: 'publication-categories',
        legacyId,
        perLocale: byLocale({ name: ctx.plainByLocale(row, 'name', `publication category ${legacyId}`) }),
        shared: {},
      })
    })
}

export function planTopics(ctx: PlanContext): DocPlan[] {
  return ctx.snapshot.themen.map((row) => {
    const legacyId = num(row, 'index')!
    const where = `topic ${legacyId}`
    const flow = str(row, 'flow')
    const perLocale = byLocale({
      name: ctx.plainByLocale(row, 'name', where),
      description: ctx.richTextByLocale(row, 'text', where),
    })
    const flowForLocale = (locale: Locale) =>
      flowBlocks(ctx, flow, where, locale, { fallback: false, rowIdPrefix: `topics/${legacyId}/flow` })
    perLocale.de.flow = flowForLocale('de')
    for (const locale of ['en', 'zh', 'cs'] as const) {
      const blocks = flowForLocale(locale)
      if (blocks.some((block) => block.blockType === 'text')) perLocale[locale].flow = blocks
    }
    return docPlan({
      collection: 'topics',
      legacyId,
      status: 'published',
      perLocale,
      shared: {
        image: ctx.imageRef(num(row, 'bild'), `${where} image`),
        projects: pipeList(row, 'projekte')
          .map((code) => ctx.projectRef(code, where))
          .filter(Boolean),
      },
    })
  })
}

export function planNews(ctx: PlanContext): DocPlan[] {
  return ctx.snapshot.aktuell.map((row) => {
    const legacyId = num(row, 'index')!
    const where = `news ${legacyId}`
    const links = linksByLocale(ctx, row, where)
    const legacyProject = str(row, 'projekt')
    if (legacyProject) {
      const key = ctx.projectKeyByCode(legacyProject)
      const linked = Object.values(links).some((list) =>
        list.some((link) => link.kind === 'project' && JSON.stringify(link.project) === JSON.stringify(ref('projects', key ?? ''))),
      )
      if (!linked) ctx.report.add('News project field not covered by its links (dropped)', `${where}: ${legacyProject}`)
    }
    return docPlan({
      collection: 'news',
      legacyId,
      status: bool(row, 'aktiv') ? 'published' : 'draft',
      perLocale: byLocale({
        title: ctx.plainByLocale(row, 'name', where),
        content: ctx.richTextByLocale(row, 'inhalt', where),
        links,
      }),
      shared: {
        date: str(row, 'datum'),
        image: ctx.imageRef(num(row, 'bild'), `${where} image`),
        visibleIn: localesWithValue(row, 'position'),
      },
    })
  })
}

export function planAwards(ctx: PlanContext): DocPlan[] {
  return ctx.snapshot.auszeichnungen.map((row) => {
    const legacyId = num(row, 'index')!
    const where = `award ${legacyId}`
    return docPlan({
      collection: 'awards',
      legacyId,
      status: bool(row, 'aktiv') ? 'published' : 'draft',
      perLocale: byLocale({
        name: ctx.plainByLocale(row, 'name', where),
        issuer: ctx.plainByLocale(row, 'auslober', where),
        description: ctx.richTextByLocale(row, 'inhalt', where),
        links: linksByLocale(ctx, row, where),
      }),
      shared: {
        year: num(row, 'jahr'),
        month: num(row, 'monat'),
        image: ctx.imageRef(num(row, 'bild'), `${where} image`),
        visibleIn: localesWithValue(row, 'position'),
      },
    })
  })
}

// Legacy publications are single-language; their text goes into the default locale.
export function planPublications(ctx: PlanContext): { docs: DocPlan[]; pdfs: DocPlan[] } {
  const pdfs = new Map<string, DocPlan>()
  const docs = ctx.snapshot.publikationen.map((row) => {
    const legacyId = num(row, 'index')!
    const where = `publication ${legacyId}`
    const text = (column: string) => ctx.plain(str(row, column), where)
    const article = text('name')
    const book = text('buch')
    const articleSubtitle = text('untertitel')
    const bookSubtitle = text('buchuntertitel')
    if (!article && articleSubtitle && bookSubtitle) {
      ctx.report.add('Book publication with two subtitles (book subtitle kept)', where)
    }

    let file = null
    const fileName = str(row, 'datei')
    if (fileName) {
      const filePath = `${ctx.filesRoot}/4_res/publikationen/${fileName}`
      if (fs.existsSync(filePath)) {
        if (!pdfs.has(fileName)) {
          pdfs.set(
            fileName,
            docPlan({
              collection: 'media',
              key: `pdf:${fileName}`,
              match: { field: 'filename', value: fileName },
              filePath,
              shared: {},
              perLocale: { de: { alt: article ?? book } },
            }),
          )
        }
        file = ref('media', `pdf:${fileName}`)
      } else {
        ctx.report.add('Publication PDF missing on disk (dropped)', `${where}: 4_res/publikationen/${fileName}`)
      }
    }

    return docPlan({
      collection: 'publications',
      legacyId,
      status: bool(row, 'aktiv') ? 'published' : 'draft',
      perLocale: {
        de: {
          title: article ?? book,
          subtitle: article ? articleSubtitle : (bookSubtitle ?? articleSubtitle),
          authors: text('autor'),
          journal: text('zeitschrift'),
          bookTitle: article ? book : null,
          bookSubtitle: article ? bookSubtitle : null,
          editors: text('hrsg'),
          publisher: text('verlag'),
        },
      },
      shared: {
        category: num(row, 'kategorie') !== null ? ref('publication-categories', num(row, 'kategorie')!) : null,
        year: num(row, 'jahr'),
        month: num(row, 'monat'),
        pages: str(row, 'seiten'),
        image: ctx.imageRef(num(row, 'bild'), `${where} image`),
        file,
        url: str(row, 'url'),
        projects: pipeList(row, 'projekte')
          .map((code) => ctx.projectRef(code, where))
          .filter(Boolean),
        visibleIn: localesWithValue(row, 'position'),
      },
    })
  })
  return { docs, pdfs: [...pdfs.values()] }
}

export function planJobs(ctx: PlanContext): DocPlan[] {
  return ctx.snapshot.jobs.map((row) => {
    const legacyId = num(row, 'id')!
    const where = `job ${legacyId}`
    const visibleIn = localesWithFlag(row, 'anzeige')
    const office = num(row, 'standort')
    return docPlan({
      collection: 'jobs',
      legacyId,
      status: visibleIn.length > 0 ? 'published' : 'draft',
      perLocale: byLocale({
        title: ctx.plainByLocale(row, 'name', where),
        description: ctx.richTextByLocale(row, 'inhalt', where),
      }),
      shared: {
        date: str(row, 'datum'),
        offices: office !== null ? [ref('offices', office)] : [],
        visibleIn,
      },
    })
  })
}

// Legacy page ids → English page keys.
const PAGE_KEYS: Record<string, string> = {
  index: 'home',
  'buero-profil': 'office-profile',
  'buero-ansatz': 'approach',
  'buero-leistungen': 'services',
  'buero-team': 'team',
  'buero-mitarbeit': 'careers',
  'buero-vita': 'founder-vita',
  'projekte-alle': 'projects',
  themen: 'topics',
  'kontakt-kontakt': 'contact',
  'kontakt-impressum': 'imprint',
  datenschutz: 'privacy-policy',
}
const SKIPPED_PAGES = new Set(['buero-profil-2026'])

export function planPages(ctx: PlanContext): DocPlan[] {
  const plans: DocPlan[] = []
  for (const row of ctx.snapshot.buero) {
    const legacyId = num(row, 'index')!
    const legacyKey = str(row, 'seite') ?? ''
    if (SKIPPED_PAGES.has(legacyKey)) continue
    const key = PAGE_KEYS[legacyKey]
    const where = `page ${legacyId} (${legacyKey})`
    if (!key) {
      ctx.report.add('Page with an unmapped key (skipped)', where)
      continue
    }
    const subtitle = Object.fromEntries(
      LOCALES.map((locale) => [locale, ctx.plain(str(row, `untertitel_${LEGACY_SUFFIX[locale]}`), where, { multiline: true })]),
    )
    const flow = Object.fromEntries(
      LOCALES.map((locale) => [
        locale,
        flowBlocks(ctx, str(row, `flow_${LEGACY_SUFFIX[locale]}`), `${where} [${locale}]`, locale, {
          fallback: true,
          rowIdPrefix: `pages/${legacyId}/flow/${locale}`,
        }),
      ]),
    )
    // Definition lists (the founder's CV) become the timeline; the rest stays rich text.
    const content: Record<string, unknown> = {}
    const timeline: Record<string, unknown> = {}
    for (const locale of LOCALES) {
      const text = splitTimeline(ctx, str(row, `text_${LEGACY_SUFFIX[locale]}`), `${where} [${locale}]`)
      content[locale] = ctx.richText(text.html, `${where} text [${locale}]`)
      timeline[locale] = text.timeline
    }
    plans.push(
      docPlan({
        collection: 'pages',
        legacyId,
        status: 'published',
        perLocale: byLocale({
          title: ctx.plainByLocale(row, 'titel', where),
          subtitle,
          content,
          timeline,
          flow,
        }),
        shared: { key, image: ctx.imageRef(num(row, 'bild'), `${where} image`) },
      }),
    )
  }
  return plans
}
