import type { Row } from '../legacy'
import { num, str } from '../legacy'
import type { PlanContext } from './context'
import { type Data, type Locale, LEGACY_SUFFIX, LOCALES, ref } from './types'

// ---------------------------------------------------------------------------------------------
// Visibility
// ---------------------------------------------------------------------------------------------

/** Locales whose flag column (`anzeige_{suffix}`) is set. */
export const localesWithFlag = (row: Row, base: string): Locale[] =>
  LOCALES.filter((locale) => Number(row[`${base}_${LEGACY_SUFFIX[locale]}`] ?? 0) === 1)

/** Locales whose column is non-null — how news, awards and publications mark visibility. */
export const localesWithValue = (row: Row, base: string): Locale[] =>
  LOCALES.filter((locale) => str(row, `${base}_${LEGACY_SUFFIX[locale]}`) !== null)

// ---------------------------------------------------------------------------------------------
// Links: "label;target|label;target", target = URL or "proj:CODE"
// ---------------------------------------------------------------------------------------------

export function parseLinks(ctx: PlanContext, value: string | null, where: string): Data[] {
  if (!value) return []
  const links: Data[] = []
  for (const entry of value.split('|')) {
    if (!entry.trim()) continue
    const parts = entry.split(';')
    if (parts.length !== 2) {
      ctx.report.add('Malformed link entry (dropped)', `${where}: "${entry}"`)
      continue
    }
    const label = ctx.plain(parts[0].trim() || null, where)
    const target = parts[1].trim()
    if (target.toLowerCase().startsWith('proj:')) {
      const project = ctx.projectRef(target.slice(5), `${where} link`)
      if (project) links.push({ kind: 'project', label, project })
      continue
    }
    if (!target) {
      ctx.report.add('Malformed link entry (dropped)', `${where}: "${entry}"`)
      continue
    }
    if (!/^(https?:|mailto:)/i.test(target)) {
      ctx.report.add('Link URL without protocol (kept as is)', `${where}: "${target}"`)
    }
    links.push({ kind: 'external', label, url: target })
  }
  return links
}

// ---------------------------------------------------------------------------------------------
// Flows: "size modifier…:ref|…", ref = image id, t… text element, f… topic, a… news
// ---------------------------------------------------------------------------------------------

const SIZES = new Set(['one6', 'one4', 'one3', 'one2', 'two3', 'full'])
const MODIFIERS = new Set(['clear', 'right', 'center', 'crop', 'topmargin'])
// Class name the legacy editor kept appending to text items; carries no meaning.
const IGNORED_TOKENS = new Set(['textelement'])

type FlowItem = {
  kind: 'image' | 'text' | 'news' | 'topic'
  id: number
  size: string | null
  modifiers: string[]
}

function parseFlowItems(ctx: PlanContext, value: string | null, where: string): FlowItem[] {
  if (!value) return []
  const items: FlowItem[] = []
  for (const entry of value.split('|')) {
    const parts = entry.split(':')
    const target = parts[parts.length - 1].trim()
    if (!target) continue
    const match = /^([atf]?)(\d+)$/.exec(target)
    if (!match) {
      ctx.report.add('Flow item without a valid reference (dropped)', `${where}: "${entry}"`)
      continue
    }
    const kind = ({ '': 'image', t: 'text', f: 'topic', a: 'news' } as const)[match[1] as '' | 't' | 'f' | 'a']
    const tokens = parts.length > 1 ? parts[0].split(/\s+/).filter(Boolean) : []
    let size: string | null = null
    const modifiers: string[] = []
    for (const token of tokens) {
      if (IGNORED_TOKENS.has(token)) continue
      if (SIZES.has(token)) size = token
      else if (MODIFIERS.has(token)) modifiers.push(token)
      else if (token === 'separator' && kind === 'text') modifiers.push(token)
      else ctx.report.add('Unknown flow layout token (dropped)', `${where}: "${token}" in "${entry}"`)
    }
    items.push({ kind, id: Number(match[2]), size, modifiers })
  }
  return items
}

const DEFAULT_SIZE: Record<FlowItem['kind'], string> = { image: 'one3', text: 'one2', news: 'one3', topic: 'one3' }

/**
 * Turns a flow column into blocks for one locale. Text blocks take their title/body from the
 * referenced text element in that locale; with `fallback` they fall back to en, then de, as the
 * legacy site did for per-language flows.
 */
export function flowBlocks(
  ctx: PlanContext,
  value: string | null,
  where: string,
  locale: Locale,
  { fallback, rowIdPrefix }: { fallback: boolean; rowIdPrefix: string },
): Data[] {
  const textElements = new Map(ctx.snapshot.textelemente.map((row) => [num(row, 'index'), row]))
  const newsIds = new Set(ctx.snapshot.aktuell.map((row) => num(row, 'index')))
  const topicIds = new Set(ctx.snapshot.themen.map((row) => num(row, 'index')))

  const pick = (row: Row, base: string): string | null => {
    const chain: Locale[] = fallback ? [locale, 'en', 'de'] : [locale]
    for (const candidate of chain) {
      const value = str(row, `${base}_${LEGACY_SUFFIX[candidate]}`)
      if (value) return value
    }
    return null
  }

  const blocks: Data[] = []
  parseFlowItems(ctx, value, where).forEach((item, index) => {
    const common = {
      id: ctx.rowId(rowIdPrefix, index),
      size: item.size ?? DEFAULT_SIZE[item.kind],
      modifiers: item.modifiers,
    }
    if (item.kind === 'image') {
      const image = ctx.imageRef(item.id, `${where} flow`)
      if (image) blocks.push({ ...common, blockType: 'image', image })
    } else if (item.kind === 'text') {
      const element = textElements.get(item.id)
      if (!element) {
        ctx.report.add('Flow references an unknown text element (dropped)', `${where}: t${item.id}`)
        return
      }
      const elementWhere = `text element ${item.id}`
      blocks.push({
        ...common,
        blockType: 'text',
        title: ctx.plain(pick(element, 'titel'), elementWhere),
        body: ctx.richText(pick(element, 'text'), elementWhere),
      })
    } else if (item.kind === 'news') {
      if (!newsIds.has(item.id)) {
        ctx.report.add('Flow references an unknown news item (dropped)', `${where}: a${item.id}`)
        return
      }
      blocks.push({ ...common, blockType: 'newsReference', news: ref('news', item.id) })
    } else {
      if (!topicIds.has(item.id)) {
        ctx.report.add('Flow references an unknown topic (dropped)', `${where}: f${item.id}`)
        return
      }
      blocks.push({ ...common, blockType: 'topicReference', topic: ref('topics', item.id) })
    }
  })
  return blocks
}

/** Text element ids referenced by a flow column (for reporting unreferenced ones). */
export const flowTextElementIds = (value: string | null): number[] =>
  (value ?? '')
    .split('|')
    .map((entry) => /(?:^|:)t(\d+)$/.exec(entry.trim())?.[1])
    .filter((id): id is string => Boolean(id))
    .map(Number)

// ---------------------------------------------------------------------------------------------
// Country / region: free text in four languages, sometimes a region instead of a country
// ---------------------------------------------------------------------------------------------

const COUNTRY_NAMES: Record<string, string> = {
  deutschland: 'DE', germany: 'DE', '德国': 'DE', 'německo': 'DE',
  china: 'CN', '中国': 'CN', "'中国'": 'CN', 'čína': 'CN',
  'tschechische republik': 'CZ', tschechien: 'CZ', tschechischen: 'CZ', 'czech republic': 'CZ',
  '捷克': 'CZ', 'česká republika': 'CZ',
  polen: 'PL', poland: 'PL', '波兰': 'PL', polsko: 'PL',
  'österreich': 'AT', '奥地利': 'AT',
  frankreich: 'FR', france: 'FR', '法国': 'FR',
  korea: 'KR', corea: 'KR', '韩国': 'KR',
  finnland: 'FI', finland: 'FI', '芬兰': 'FI',
  norwegen: 'NO', '挪威': 'NO',
}

const REGIONS: Record<string, string> = {
  'baden-württemberg': 'DE', sachsen: 'DE', 'sachsen-anhalt': 'DE', 'nordrhein-westfalen': 'DE',
  '北莱茵-威斯特法伦州': 'DE', 'thüringen': 'DE', 'mecklenburg-vorpommern': 'DE', '德国萨克森州': 'DE',
  'provinz guangdong': 'CN', sichuan: 'CN', 'provinz shandong': 'CN', 'provinz shanxi': 'CN',
  vorarlberg: 'AT',
}

export function resolveCountry(
  ctx: PlanContext,
  row: Row,
  where: string,
): { country: string | null; region: Record<Locale, string | null> } {
  const region = { de: null, en: null, zh: null, cs: null } as Record<Locale, string | null>
  const found: { locale: Locale; code: string }[] = []
  for (const locale of LOCALES) {
    const value = str(row, `land_${LEGACY_SUFFIX[locale]}`)
    if (!value) continue
    const key = value.toLowerCase()
    if (COUNTRY_NAMES[key]) {
      found.push({ locale, code: COUNTRY_NAMES[key] })
    } else if (REGIONS[key]) {
      found.push({ locale, code: REGIONS[key] })
      region[locale] = value
    } else {
      ctx.report.add('Unknown country value (dropped)', `${where} [${locale}]: "${value}"`)
    }
  }
  const codes = [...new Set(found.map(({ code }) => code))]
  if (codes.length > 1) {
    ctx.report.add(
      'Conflicting countries across languages (first one kept)',
      `${where}: ${found.map(({ locale, code }) => `${locale}=${code}`).join(', ')}`,
    )
  }
  return { country: codes[0] ?? null, region }
}
