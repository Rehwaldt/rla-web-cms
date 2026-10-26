import type { CollectionConfig } from 'payload'

// The site search's index (see src/search/indexer.ts): one entry per searchable document and
// language, with the texts as plain text. Kept current by hooks, rebuilt with
// `pnpm search:reindex`; read by GET /api/search only. Hidden from the admin.
export const SearchIndex: CollectionConfig = {
  slug: 'search-index',
  labels: {
    singular: { en: 'Search index entry', de: 'Suchindex-Eintrag' },
    plural: { en: 'Search index', de: 'Suchindex' },
  },
  admin: { hidden: true },
  access: {
    read: ({ req }) => Boolean(req.user),
    create: () => false,
    update: () => false,
    delete: () => false,
  },
  fields: [
    { name: 'docCollection', label: { en: 'Collection', de: 'Sammlung' }, type: 'text', required: true, index: true },
    { name: 'docId', label: { en: 'Document', de: 'Dokument' }, type: 'number', required: true, index: true },
    // One entry per language, so not a localized field
    { name: 'language', label: { en: 'Language', de: 'Sprache' }, type: 'text', required: true, index: true },
    { name: 'title', label: { en: 'Title', de: 'Titel' }, type: 'text' },
    { name: 'secondary', label: { en: 'Secondary text', de: 'Nebentext' }, type: 'text' },
    { name: 'body', label: { en: 'Text', de: 'Text' }, type: 'textarea' },
    // The texts in lower case without accents, for substring matching
    { name: 'titleFolded', label: { en: 'Title (folded)', de: 'Titel (normalisiert)' }, type: 'text' },
    { name: 'secondaryFolded', label: { en: 'Secondary text (folded)', de: 'Nebentext (normalisiert)' }, type: 'text' },
    { name: 'bodyFolded', label: { en: 'Text (folded)', de: 'Text (normalisiert)' }, type: 'textarea' },
    { name: 'image', label: { en: 'Image', de: 'Bild' }, type: 'number' },
    { name: 'code', label: { en: 'Code', de: 'Kürzel' }, type: 'text' },
    { name: 'category', label: { en: 'Category', de: 'Kategorie' }, type: 'number' },
  ],
}
