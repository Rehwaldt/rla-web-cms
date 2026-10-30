import type { CollectionConfig } from 'payload'
import { anyone } from '@/access/publishedOrAuthenticated'
import { requiredInDefaultLocale } from '@/fields/validation'
import { GROUPS } from '@/i18n/groups'

// What a news item is about (competition, people, project update, …), as the intranet's news have
// it. Editors add their own; the list order is the order the website shows them in.
export const NewsCategories: CollectionConfig = {
  slug: 'news-categories',
  labels: {
    singular: { en: 'Category', de: 'Kategorie' },
    plural: { en: 'Categories', de: 'Kategorien' },
  },
  orderable: true,
  admin: {
    useAsTitle: 'name',
    group: GROUPS.news,
  },
  access: { read: anyone },
  fields: [
    {
      name: 'name',
      label: { en: 'Name', de: 'Name' },
      type: 'text',
      localized: true,
      validate: requiredInDefaultLocale,
    },
  ],
}
