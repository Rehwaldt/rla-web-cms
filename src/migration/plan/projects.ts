import { bool, num, pipeList, str } from '../legacy'
import { byLocale, docPlan } from './build'
import { cleanProjectCode, type PlanContext } from './context'
import { flowBlocks, localesWithFlag, parseLinks, reportFlowNews, resolveCountry } from './parsers'
import { type DocPlan, type GlobalPlan, type Locale, LEGACY_SUFFIX, LOCALES, ref, type Ref } from './types'

function projectType(ctx: PlanContext, row: Record<string, unknown>, where: string) {
  if (bool(row, 'als_wettbewerb')) return 'competition'
  if (bool(row, 'als_projekt')) return bool(row, 'objektplanung') ? 'object' : 'concept'
  ctx.report.add('Project without a type (left empty)', where)
  return null
}

function year(ctx: PlanContext, value: number | null, where: string): number | null {
  if (value === null) return null
  if (value < 1950 || value > 2200) {
    ctx.report.add('Implausible year (dropped)', `${where}: ${value}`)
    return null
  }
  return value
}

export function planProjects(ctx: PlanContext): DocPlan[] {
  const { snapshot, report } = ctx
  const categoryIds = new Set(snapshot.projektkategorien.map((row) => num(row, 'index')))

  // Similar projects are symmetric in the legacy data; each pair is stored once, on its first side.
  const similar = new Map<string, Set<string>>()
  for (const pair of snapshot.aehnliche_projekte) {
    const where = `similar projects pair ${num(pair, 'id')}`
    const a = ctx.projectKeyByCode(str(pair, 'projekt1'))
    const b = ctx.projectKeyByCode(str(pair, 'projekt2'))
    if (!a || !b) {
      report.add('Similar-projects pair with an unknown project code (dropped)', `${where}: ${str(pair, 'projekt1')} ↔ ${str(pair, 'projekt2')}`)
      continue
    }
    if (a === b || similar.get(b)?.has(a)) continue
    similar.set(a, (similar.get(a) ?? new Set()).add(b))
  }

  return snapshot.projekte.map((row) => {
    const legacyId = num(row, 'ID')!
    const rawCode = str(row, 'kuerzel')
    const code = cleanProjectCode(rawCode)
    const where = `project ${legacyId} (${rawCode ?? 'no code'})`
    if (!code) report.add('Project without a code (imported without one)', where)

    const { country, region } = resolveCountry(ctx, row, where)
    const categories = pipeList(row, 'kategorie')
      .map(Number)
      .filter((id) => {
        if (categoryIds.has(id)) return true
        report.add('Project references an unknown category (dropped)', `${where}: ${id}`)
        return false
      })
      .map((id) => ref('project-categories', id))

    const completed = num(row, 'fertigstellung')
    const planned = num(row, 'fertigstellung_geplant')
    const ongoing = bool(row, 'in_planung')
    if (ongoing && completed) report.add('Project is ongoing but has a completion year', `${where}: ${completed}`)

    const flow = str(row, 'bilder_flow')
    reportFlowNews(ctx, flow, where)
    const flowForLocale = (locale: Locale) =>
      flowBlocks(ctx, flow, where, locale, { fallback: false, rowIdPrefix: `projects/${legacyId}/flow` })

    const perLocale = byLocale({
      name: ctx.plainByLocale(row, 'name', where),
      motto: ctx.plainByLocale(row, 'motto', where),
      summary: ctx.plainByLocale(row, 'kurzbeschreibung', where),
      description: ctx.richTextByLocale(row, 'text', where),
      place: ctx.plainByLocale(row, 'ort', where),
      region,
      client: ctx.plainByLocale(row, 'auftraggeber', where),
      architect: ctx.plainByLocale(row, 'architekt', where),
      planningPartners: ctx.plainByLocale(row, 'planungspartner', where),
      additionalInfo: ctx.plainByLocale(row, 'weitere_daten', where),
      links: Object.fromEntries(
        LOCALES.map((locale) => [locale, parseLinks(ctx, str(row, `links_${LEGACY_SUFFIX[locale]}`), `${where} [${locale}]`)]),
      ),
    })
    // The flow's structure is shared; only the text inside text blocks differs per locale.
    perLocale.de.flow = flowForLocale('de')
    for (const locale of ['en', 'zh', 'cs'] as const) {
      const blocks = flowForLocale(locale)
      if (blocks.some((block) => block.blockType === 'text')) perLocale[locale].flow = blocks
    }

    return docPlan({
      collection: 'projects',
      legacyId,
      status: bool(row, 'aktiv') ? 'published' : 'draft',
      perLocale,
      shared: {
        code,
        type: projectType(ctx, row, where),
        ongoing,
        completionYear: year(ctx, completed ?? planned, where),
        area: num(row, 'flaeche'),
        country,
        competition: {
          year: year(ctx, num(row, 'wettbewerb'), `${where} competition`),
          prize: num(row, 'preis'),
          purchased: bool(row, 'ankauf'),
        },
        categories,
        heroImage: ctx.imageRef(num(row, 'titelbild'), `${where} hero image`),
        previewImage: ctx.imageRef(num(row, 'vorschaubild'), `${where} preview image`),
        similarProjects: [...(similar.get(String(legacyId)) ?? [])].map((key) => ref('projects', key)),
        visibleIn: localesWithFlag(row, 'anzeige'),
      },
    })
  })
}

/** Per-locale ordered gallery (`galerieposition_{suffix}`), unpublished projects included. */
export function planProjectGallery(ctx: PlanContext): GlobalPlan {
  const localized = {} as Record<Locale, { projects: Ref[] }>
  for (const locale of LOCALES) {
    const column = `galerieposition_${LEGACY_SUFFIX[locale]}`
    localized[locale] = {
      projects: ctx.snapshot.projekte
        .filter((row) => num(row, column) !== null)
        .sort((a, b) => num(a, column)! - num(b, column)!)
        .map((row) => ref('projects', num(row, 'ID')!)),
    }
  }
  return { slug: 'project-gallery', localized }
}
