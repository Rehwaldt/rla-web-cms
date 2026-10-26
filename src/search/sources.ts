import { collapse, fold, lexicalToPlainText } from './text'

// What the site search finds of each collection. The website searched these fields before
// (rla-website's utils/search/Engine.php); `title` weighs most, then `secondary`, then `body`.

type Doc = Record<string, unknown> & { id: number | string }

export type SearchFields = {
  title: string
  secondary: string
  body: string
  image: number | null // media id of the hit's picture
  code: string | null // projects: their URL is /p/{code}
  category: number | null // publications: they're listed on their category's page
}

type Source = {
  /** Has `visibleIn`: listed (and so found) only in the languages selected there */
  listed: boolean
  /** The fields `fields()` reads */
  select: string[]
  fields: (doc: Doc) => SearchFields
}

const text = (value: unknown): string => (typeof value === 'string' ? collapse(value) : '')

// A relationship at depth 0 is the id; populated, it's the document
const idOf = (value: unknown): number | null => {
  const id = value && typeof value === 'object' ? (value as { id?: unknown }).id : value
  return typeof id === 'number' ? id : null
}

const nothing = { image: null, code: null, category: null }

export const SEARCH_SOURCES = {
  projects: {
    listed: true,
    select: ['name', 'place', 'description', 'previewImage', 'code'],
    fields: (doc) => ({
      ...nothing,
      title: text(doc.name),
      secondary: text(doc.place),
      body: lexicalToPlainText(doc.description),
      image: idOf(doc.previewImage),
      code: text(doc.code) || null,
    }),
  },
  topics: {
    listed: false,
    select: ['name', 'description', 'image'],
    fields: (doc) => ({
      ...nothing,
      title: text(doc.name),
      secondary: '',
      body: lexicalToPlainText(doc.description),
      image: idOf(doc.image),
    }),
  },
  publications: {
    listed: true,
    select: ['title', 'subtitle', 'bookTitle', 'bookSubtitle', 'authors', 'image', 'category'],
    // books keep their title in bookTitle, as on the publications page
    fields: (doc) => ({
      ...nothing,
      title: text(doc.title) || text(doc.bookTitle),
      secondary: text(doc.authors),
      body: text(doc.subtitle) || text(doc.bookSubtitle),
      image: idOf(doc.image),
      category: idOf(doc.category),
    }),
  },
  awards: {
    listed: true,
    select: ['name', 'issuer', 'description', 'image'],
    fields: (doc) => ({
      ...nothing,
      title: text(doc.name),
      secondary: text(doc.issuer),
      body: lexicalToPlainText(doc.description),
      image: idOf(doc.image),
    }),
  },
  news: {
    listed: true,
    select: ['title', 'content', 'previewImage', 'heroImage', 'gallery'],
    fields: (doc) => ({
      ...nothing,
      title: text(doc.title),
      secondary: '',
      body: lexicalToPlainText(doc.content),
      // the tile picture, as on the news cards: preview image, else hero image, else the first of the gallery
      image: idOf(doc.previewImage) ?? idOf(doc.heroImage) ?? idOf((doc.gallery as unknown[] | null | undefined)?.[0]),
    }),
  },
} satisfies Record<string, Source>

export type SearchableCollection = keyof typeof SEARCH_SOURCES

export const SEARCHABLE_COLLECTIONS = Object.keys(SEARCH_SOURCES) as SearchableCollection[]

export type SearchEntry = SearchFields & {
  docCollection: SearchableCollection
  docId: number
  language: string
  titleFolded: string
  secondaryFolded: string
  bodyFolded: string
}

/**
 * The index entries of one document, from its main-table version in each language (fallback
 * applied, as the API serves it). Like the API's anonymous access: nothing while it isn't
 * published, and only in the languages it's listed in.
 */
export function entriesFor(collection: SearchableCollection, byLanguage: Record<string, Doc | undefined>): SearchEntry[] {
  const source: Source = SEARCH_SOURCES[collection]
  return Object.entries(byLanguage).flatMap(([language, doc]) => {
    if (!doc || doc._status !== 'published') return []
    if (source.listed && !((doc.visibleIn as string[] | null | undefined) ?? []).includes(language)) return []
    const fields = source.fields(doc)
    return [
      {
        ...fields,
        docCollection: collection,
        docId: Number(doc.id),
        language,
        titleFolded: fold(fields.title),
        secondaryFolded: fold(fields.secondary),
        bodyFolded: fold(fields.body),
      },
    ]
  })
}

/** The select of a collection's reads for the index */
export function selectFor(collection: SearchableCollection): Record<string, true> {
  const fields = [...SEARCH_SOURCES[collection].select, '_status', ...(SEARCH_SOURCES[collection].listed ? ['visibleIn'] : [])]
  return Object.fromEntries(fields.map((field) => [field, true]))
}
