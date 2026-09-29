import type { CollectionSlug } from 'payload'
import { type Data, type DocPlan, type Locale, SECONDARY_LOCALES } from './types'

const isEmpty = (value: unknown) =>
  value === null || value === undefined || (Array.isArray(value) && value.length === 0)

const compact = (data: Data): Data =>
  Object.fromEntries(Object.entries(data).filter(([, value]) => !isEmpty(value)))

/**
 * Assembles a DocPlan from shared values and per-locale values. Empty per-locale values are left
 * out so Payload's locale fallback applies instead of storing blanks.
 */
export function docPlan(args: {
  collection: CollectionSlug
  legacyId?: number
  status?: DocPlan['status']
  shared: Data
  perLocale?: Partial<Record<Locale, Data>>
  key?: string
  match?: DocPlan['match']
  filePath?: string
}): DocPlan {
  const perLocale = args.perLocale ?? {}
  return {
    collection: args.collection,
    key: args.key ?? String(args.legacyId),
    match: args.match ?? { field: 'legacyId', value: args.legacyId! },
    status: args.status,
    data: { ...(args.legacyId !== undefined && { legacyId: args.legacyId }), ...args.shared, ...compact(perLocale.de ?? {}) },
    localized: Object.fromEntries(
      SECONDARY_LOCALES.map((locale) => [locale, compact(perLocale[locale] ?? {})]).filter(
        ([, data]) => Object.keys(data as Data).length > 0,
      ),
    ),
    filePath: args.filePath,
  }
}

/** Per-locale records from several per-locale value maps: { name: {de,en…}, … } → { de: {name…} … }. */
export function byLocale(fields: Record<string, Partial<Record<Locale, unknown>>>): Record<Locale, Data> {
  const result = { de: {}, en: {}, zh: {}, cs: {} } as Record<Locale, Data>
  for (const [field, values] of Object.entries(fields)) {
    for (const [locale, value] of Object.entries(values)) result[locale as Locale][field] = value
  }
  return result
}
