import type { CollectionConfig } from 'payload'
import { anyone } from '@/access/publishedOrAuthenticated'
import { legacyIdField } from '@/fields/legacyId'
import { requiredInDefaultLocale } from '@/fields/validation'

export const PublicationCategories: CollectionConfig = {
  slug: 'publication-categories',
  orderable: true,
  admin: {
    useAsTitle: 'name',
    group: 'Content',
  },
  access: { read: anyone },
  fields: [
    { name: 'name', type: 'text', localized: true, validate: requiredInDefaultLocale },
    legacyIdField,
  ],
}
