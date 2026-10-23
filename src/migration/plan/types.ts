import type { CollectionSlug, GlobalSlug } from 'payload'

export type Locale = 'de' | 'en' | 'zh' | 'cs'
export type SecondaryLocale = Exclude<Locale, 'de'>

export const LOCALES: Locale[] = ['de', 'en', 'zh', 'cs']
export const SECONDARY_LOCALES: SecondaryLocale[] = ['en', 'zh', 'cs']

// Parts of the import that can run on their own (`--only`): the website database, the mines, and
// the excursions from the WordPress site.
export const SECTIONS = ['website', 'mines', 'excursions'] as const
export type Section = (typeof SECTIONS)[number]

// Legacy column suffix per locale (the legacy database spells Czech `cz`).
export const LEGACY_SUFFIX: Record<Locale, string> = { de: 'de', en: 'en', zh: 'zh', cs: 'cz' }

// A reference to another planned document, resolved to its Payload id by the sink. Plans never
// contain Payload ids, which keeps planning pure and independent of write order.
export type Ref = { $ref: { collection: CollectionSlug; key: string } }

export const ref = (collection: CollectionSlug, key: string | number): Ref => ({
  $ref: { collection, key: String(key) },
})

export const isRef = (value: unknown): value is Ref =>
  typeof value === 'object' && value !== null && '$ref' in value

export type Data = Record<string, unknown>

export interface DocPlan {
  collection: CollectionSlug
  /** Stable identity of the legacy record within its collection; also how refs point at it. */
  key: string
  /**
   * How to find an already-imported document: by legacyId, or, for documents without one, by
   * filename (PDFs, WordPress images) or slug (excursions). Those keys are `{field}:{value}`.
   */
  match: { field: 'legacyId' | 'filename' | 'slug'; value: string | number }
  /** Only for collections with drafts. */
  status?: 'published' | 'draft'
  /** Non-localized values plus the German (default locale) values. */
  data: Data
  /** Values for the other locales; missing keys fall back at read time. */
  localized: Partial<Record<SecondaryLocale, Data>>
  /** Upload source for media documents. */
  filePath?: string
}

export interface GlobalPlan {
  slug: GlobalSlug
  localized: Record<Locale, Data>
}

export interface Plan {
  docs: DocPlan[]
  globals: GlobalPlan[]
}
