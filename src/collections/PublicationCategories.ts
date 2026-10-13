import type { CollectionConfig } from 'payload'
import { anyone } from '@/access/publishedOrAuthenticated'
import { legacyIdField } from '@/fields/legacyId'
import { requiredInDefaultLocale } from '@/fields/validation'
import { GROUPS } from '@/i18n/groups'

export const PublicationCategories: CollectionConfig = {
  slug: 'publication-categories',
  labels: {
    singular: { en: 'Category', de: 'Kategorie' },
    plural: { en: 'Categories', de: 'Kategorien' },
  },
  orderable: true,
  admin: {
    useAsTitle: 'name',
    group: GROUPS.publications,
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
    legacyIdField,
  ],
}
