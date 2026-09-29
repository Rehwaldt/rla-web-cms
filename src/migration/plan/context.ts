import crypto from 'crypto'
import fs from 'fs'
import path from 'path'
import { JSDOM } from 'jsdom'
import type { LegacySnapshot, Row } from '../legacy'
import { num, str } from '../legacy'
import type { Report } from '../report'
import { type Locale, LEGACY_SUFFIX, type Ref, ref } from './types'

export type RichTextConverter = (html: string) => unknown

// Everything planners share: text cleanup, HTML → rich text, and lookups that turn legacy
// identifiers into refs (reporting whatever doesn't resolve).
export interface PlanContext {
  snapshot: LegacySnapshot
  report: Report
  filesRoot: string
  /** Legacy HTML or plain text → plain text; `multiline` keeps line breaks. */
  plain: (value: string | null, where: string, options?: { multiline?: boolean }) => string | null
  /** Legacy HTML or plain text → Lexical rich text. */
  richText: (value: string | null, where: string) => unknown
  /** One translated column (`{base}_{suffix}`) for every locale, as plain text. */
  plainByLocale: (row: Row, base: string, where: string) => Record<Locale, string | null>
  richTextByLocale: (row: Row, base: string, where: string) => Record<Locale, unknown>
  projectRef: (code: string | null, where: string) => Ref | null
  projectKeyByCode: (code: string | null) => string | null
  imageRef: (imageId: number | null, where: string) => Ref | null
  /** Canonical legacy image ids referenced by any plan, i.e. the images to upload. */
  usedImageIds: () => number[]
  /** Deterministic id for array/block rows, so every locale writes to the same rows. */
  rowId: (...parts: (string | number)[]) => string
}

const PROJECT_CODE_PLACEHOLDER = 'zz'

export const cleanProjectCode = (code: string | null): string | null =>
  !code || code.toLowerCase() === PROJECT_CODE_PLACEHOLDER ? null : code

const HTML_PATTERN = /<[a-z/!][^>]*>|&[a-z#0-9]+;/i

export function createPlanContext(
  snapshot: LegacySnapshot,
  report: Report,
  filesRoot: string,
  convertHtml: RichTextConverter,
): PlanContext {
  const dom = new JSDOM('')
  const scratch = dom.window.document.createElement('div')

  // Line breaks are marked with a private-use character before parsing; the HTML parser would
  // strip a NUL marker.
  const BREAK = ''
  const htmlToText = (html: string, lineBreak: string): string => {
    scratch.innerHTML = html.replace(/<\/?br\s*\/?>/gi, BREAK).replace(/<\/p>\s*<p[^>]*>/gi, BREAK)
    return (scratch.textContent ?? '')
      .split(BREAK)
      .map((line) => line.replace(/\s+/g, ' ').trim())
      .filter(Boolean)
      .join(lineBreak)
  }

  const plain: PlanContext['plain'] = (value, where, options = {}) => {
    if (!value) return null
    if (!HTML_PATTERN.test(value)) {
      return options.multiline ? value : value.replace(/\s*\n\s*/g, ' ')
    }
    const text = htmlToText(value, options.multiline ? '\n' : ' / ')
    if (/<[a-z/!][^>]*>/i.test(value)) report.add('HTML in a plain-text field (converted)', `${where}: ${value.slice(0, 120)}`)
    return text || null
  }

  const escapeHtml = (text: string) =>
    text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

  const richText: PlanContext['richText'] = (value, where) => {
    if (!value) return null
    const isHtml = /<[a-z/!][^>]*>/i.test(value)
    const html = isHtml
      ? value
      : `<p>${escapeHtml(value).replace(/\r?\n/g, '<br>')}</p>`
    if (isHtml) {
      const oldLinks = value.match(/href=["'][^"']*\.php[^"']*["']/gi)
      if (oldLinks) report.add('Link to an old *.php URL in rich text', `${where}: ${oldLinks.join(', ')}`)
      if (/<(dl|table|iframe|script)\b|style=/i.test(value)) {
        report.add('Structured or styled HTML in rich text (check by hand)', where)
      }
    }
    return convertHtml(html)
  }

  const plainByLocale: PlanContext['plainByLocale'] = (row, base, where) =>
    Object.fromEntries(
      (Object.keys(LEGACY_SUFFIX) as Locale[]).map((locale) => [
        locale,
        plain(str(row, `${base}_${LEGACY_SUFFIX[locale]}`), `${where} ${base} [${locale}]`),
      ]),
    ) as Record<Locale, string | null>

  const richTextByLocale: PlanContext['richTextByLocale'] = (row, base, where) =>
    Object.fromEntries(
      (Object.keys(LEGACY_SUFFIX) as Locale[]).map((locale) => [
        locale,
        richText(str(row, `${base}_${LEGACY_SUFFIX[locale]}`), `${where} ${base} [${locale}]`),
      ]),
    ) as Record<Locale, unknown>

  // Project codes resolve case-insensitively, as they did in MySQL.
  const projectKeys = new Map<string, string>()
  for (const project of snapshot.projekte) {
    const code = cleanProjectCode(str(project, 'kuerzel'))
    if (code) projectKeys.set(code.toLowerCase(), String(num(project, 'ID')))
  }
  const projectKeyByCode: PlanContext['projectKeyByCode'] = (code) =>
    code ? (projectKeys.get(code.trim().toLowerCase()) ?? null) : null

  const projectRef: PlanContext['projectRef'] = (code, where) => {
    if (!code) return null
    const key = projectKeyByCode(code)
    if (!key) {
      report.add('Reference to an unknown project code (dropped)', `${where}: "${code}"`)
      return null
    }
    return ref('projects', key)
  }

  // Several image rows can point at the same file; all of them map to the lowest id.
  const imagesById = new Map<number, Row>()
  const canonicalByPath = new Map<string, number>()
  for (const image of [...snapshot.bilder].sort((a, b) => num(a, 'index')! - num(b, 'index')!)) {
    const id = num(image, 'index')!
    imagesById.set(id, image)
    const filePath = str(image, 'pfad')
    if (filePath && !canonicalByPath.has(filePath)) canonicalByPath.set(filePath, id)
  }
  const fileExists = new Map<string, boolean>()
  const usedImages = new Set<number>()

  const imageRef: PlanContext['imageRef'] = (imageId, where) => {
    if (!imageId) return null
    const image = imagesById.get(imageId)
    const filePath = image ? str(image, 'pfad') : null
    if (!image || !filePath) {
      report.add('Reference to an unknown image id (dropped)', `${where}: ${imageId}`)
      return null
    }
    if (!fileExists.has(filePath)) {
      fileExists.set(filePath, fs.existsSync(path.join(filesRoot, '0_img', filePath)))
    }
    if (!fileExists.get(filePath)) {
      report.add('Image file missing on disk (dropped)', `${where}: ${imageId} → 0_img/${filePath}`)
      return null
    }
    const canonical = canonicalByPath.get(filePath)!
    usedImages.add(canonical)
    return ref('media', canonical)
  }

  const rowId: PlanContext['rowId'] = (...parts) =>
    crypto.createHash('sha1').update(parts.join('/')).digest('hex').slice(0, 24)

  return {
    snapshot,
    report,
    filesRoot,
    plain,
    richText,
    plainByLocale,
    richTextByLocale,
    projectRef,
    projectKeyByCode,
    imageRef,
    usedImageIds: () => [...usedImages].sort((a, b) => a - b),
    rowId,
  }
}
