import { JSDOM } from 'jsdom'
import {
  FLOW_BLOCKS,
  type FlowBlockType,
  type FlowModifier,
  type FlowSize,
  isFlowModifier,
  isFlowSize,
} from '../../fields/flowBlocks'
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
// Links inside legacy rich text: old *.php pages and bare e-mail addresses
// ---------------------------------------------------------------------------------------------

/**
 * Where a legacy rich-text href should point instead: a project (by code), or a URL the new
 * website understands. Website paths carry no language; the website adds it. Null keeps the href.
 */
export function legacyHref(href: string): { project: string } | { url: string } | null {
  const project = /^projekt\.php\?(?:[^#]*&)?proj=([^&#]+)/i.exec(href)
  if (project) return { project: decodeURIComponent(project[1]) }
  const page = /^([a-z][\w-]*)\.php(?:\?lang=[a-z]+)?$/i.exec(href)
  if (page) return { url: page[1].toLowerCase() === 'index' ? '/' : `/${page[1]}` }
  if (/^[^\s@/:]+@[^\s@/:]+\.[a-z]{2,}$/i.test(href)) return { url: `mailto:${href}` }
  return null
}

// ---------------------------------------------------------------------------------------------
// Timeline: a page's definition list (<dt>period</dt><dd>entry</dd>…), e.g. the founder's CV
// ---------------------------------------------------------------------------------------------

let timelineDom: JSDOM | undefined

// Only <br> breaks a line; line breaks in the HTML source are plain whitespace.
const LINE_BREAK = ''
const elementText = (element: Element): string => {
  element.querySelectorAll('br').forEach((br) => br.replaceWith(LINE_BREAK))
  return (element.textContent ?? '')
    .split(LINE_BREAK)
    .map((line) => line.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
    .join('\n')
}

/**
 * Moves the definition lists out of a page's HTML into timeline entries, since Lexical has no
 * definition list. Returns the remaining HTML (null if nothing is left). The legacy lists leave
 * some `<dd>` unclosed and have stray empty ones; the HTML parser and the empty-entry check
 * absorb that.
 */
export function splitTimeline(
  ctx: PlanContext,
  html: string | null,
  where: string,
): { html: string | null; timeline: Data[] } {
  if (!html || !/<dl\b/i.test(html)) return { html, timeline: [] }
  timelineDom ??= new JSDOM('')
  const container = timelineDom.window.document.createElement('div')
  container.innerHTML = html
  const timeline: { period: string; text: string }[] = []
  for (const list of container.querySelectorAll('dl')) {
    for (const item of list.children) {
      const text = elementText(item)
      if (item.tagName === 'DT') timeline.push({ period: text, text: '' })
      else if (item.tagName === 'DD' && text) {
        const entry = timeline.at(-1)
        if (entry) entry.text = entry.text ? `${entry.text}\n${text}` : text
        else ctx.report.add('Timeline entry without a period (dropped)', `${where}: ${text}`)
      }
    }
    list.remove()
  }
  for (const { period, text } of timeline) {
    if (!period || !text) ctx.report.add('Incomplete timeline entry (dropped)', `${where}: "${period}" "${text}"`)
  }
  ctx.report.add('Definition list (moved to the timeline)', where)
  return {
    html: container.textContent?.trim() ? container.innerHTML.trim() : null,
    timeline: timeline.filter(({ period, text }) => period && text),
  }
}

// ---------------------------------------------------------------------------------------------
// Flows: "size modifier…:ref|…", ref = image id, t… text element, f… topic, a… news
// ---------------------------------------------------------------------------------------------

// The prefix of a legacy reference tells the block type; an image has none.
const BLOCK_TYPE_BY_PREFIX = { '': 'image', t: 'text', f: 'topicReference', a: 'newsReference' } as const
// Class name the legacy editor kept appending to text items; carries no meaning.
const IGNORED_TOKENS = new Set(['textelement'])

type FlowItem = {
  blockType: FlowBlockType
  /** The reference as the legacy flow spells it, e.g. `t12`. */
  target: string
  id: number
  size: FlowSize
  modifiers: FlowModifier[]
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
    const blockType = BLOCK_TYPE_BY_PREFIX[match[1] as keyof typeof BLOCK_TYPE_BY_PREFIX]
    const block = FLOW_BLOCKS[blockType]
    const tokens = parts.length > 1 ? parts[0].split(/\s+/).filter(Boolean) : []
    let size: FlowSize = block.defaultSize
    const modifiers = new Set<FlowModifier>()
    for (const token of tokens) {
      if (IGNORED_TOKENS.has(token)) continue
      if (isFlowSize(token)) size = token
      else if (!isFlowModifier(token)) ctx.report.add('Unknown flow layout token (dropped)', `${where}: "${token}" in "${entry}"`)
      else if ((block.modifiers as readonly FlowModifier[]).includes(token)) modifiers.add(token)
      else ctx.report.add('Flow modifier not allowed on this block type (dropped)', `${where}: "${token}" in "${entry}"`)
    }
    items.push({
      blockType,
      target,
      id: Number(match[2]),
      size,
      modifiers: block.modifiers.filter((modifier) => modifiers.has(modifier)),
    })
  }
  return items
}

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
  const referenced = {
    newsReference: { name: 'news item', ids: new Set(ctx.snapshot.aktuell.map((row) => num(row, 'index'))) },
    topicReference: { name: 'topic', ids: new Set(ctx.snapshot.themen.map((row) => num(row, 'index'))) },
  }

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
      blockType: item.blockType,
      size: item.size,
      modifiers: item.modifiers,
    }
    if (item.blockType === 'image') {
      const image = ctx.imageRef(item.id, `${where} flow`)
      if (image) blocks.push({ ...common, [FLOW_BLOCKS.image.reference.field]: image })
    } else if (item.blockType === 'text') {
      const element = textElements.get(item.id)
      if (!element) {
        ctx.report.add('Flow references an unknown text element (dropped)', `${where}: ${item.target}`)
        return
      }
      const elementWhere = `text element ${item.id}`
      blocks.push({
        ...common,
        title: ctx.plain(pick(element, 'titel'), elementWhere),
        body: ctx.richText(pick(element, 'text'), elementWhere),
      })
    } else {
      const { name, ids } = referenced[item.blockType]
      if (!ids.has(item.id)) {
        ctx.report.add(`Flow references an unknown ${name} (dropped)`, `${where}: ${item.target}`)
        return
      }
      const { field, collection } = FLOW_BLOCKS[item.blockType].reference
      blocks.push({ ...common, [field]: ref(collection, item.id) })
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
