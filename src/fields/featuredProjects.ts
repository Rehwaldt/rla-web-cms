import type { Field } from 'payload'

// Projects picked by hand for a document, in the order the website shows them. Meant as the
// source of the front page's banner carousel (one slide per project: its hero image, its name as
// caption, a link to the project), which replaces the legacy carousel built from the page image
// and the flow's images (#40). Not wired up yet: the carousel is still being built on the website
// and may be dropped again, so nothing reads this field so far and the importer leaves it empty.
export const featuredProjectsField: Field = {
  name: 'featuredProjects',
  label: { en: 'Featured projects', de: 'Ausgewählte Projekte' },
  type: 'relationship',
  relationTo: 'projects',
  hasMany: true,
  localized: true,
  admin: {
    isSortable: true,
    description: {
      en: "For the page's banner carousel, in this order: each project shows with its hero image, name and link. Each language has its own selection. Not shown on the website yet.",
      de: 'Für das Banner-Karussell der Seite, in dieser Reihenfolge: Jedes Projekt erscheint mit Titelbild, Namen und Link. Jede Sprache hat ihre eigene Auswahl. Noch nicht auf der Website sichtbar.',
    },
  },
}
