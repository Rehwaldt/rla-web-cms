import type { Field } from 'payload'

// News items picked by hand for a document, in the order the website shows them (on a page: its
// news section, e.g. the front page's). Each language picks its own.
export const featuredNewsField: Field = {
  name: 'featuredNews',
  label: { en: 'Featured news', de: 'Ausgewählte News' },
  type: 'relationship',
  relationTo: 'news',
  hasMany: true,
  localized: true,
  admin: {
    isSortable: true,
    description: {
      en: "Shown in the page's news section, in this order. Each language has its own selection.",
      de: 'Erscheinen im News-Bereich der Seite, in dieser Reihenfolge. Jede Sprache hat ihre eigene Auswahl.',
    },
  },
}
