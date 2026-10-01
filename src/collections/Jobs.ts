import type { CollectionConfig } from 'payload'
import { publishedOrAuthenticated } from '@/access/publishedOrAuthenticated'
import { legacyIdField } from '@/fields/legacyId'
import { richTextField } from '@/fields/richText'
import { visibleInField } from '@/fields/visibleIn'
import { GROUPS } from '@/i18n/groups'

export const Jobs: CollectionConfig = {
  slug: 'jobs',
  labels: {
    singular: { en: 'Job', de: 'Stellenangebot' },
    plural: { en: 'Jobs', de: 'Stellenangebote' },
  },
  defaultSort: '-date',
  admin: {
    useAsTitle: 'title',
    group: GROUPS.content,
    defaultColumns: ['title', 'office', 'date', '_status'],
  },
  access: { read: publishedOrAuthenticated },
  versions: { drafts: true },
  fields: [
    { name: 'title', label: { en: 'Title', de: 'Titel' }, type: 'text', localized: true },
    {
      type: 'row',
      fields: [
        {
          name: 'date',
          label: { en: 'Date', de: 'Datum' },
          type: 'date',
          admin: {
            width: '50%',
            date: { pickerAppearance: 'dayOnly', displayFormat: 'dd.MM.yyyy' },
          },
        },
        {
          name: 'office',
          label: { en: 'Office', de: 'Büro' },
          type: 'relationship',
          relationTo: 'offices',
          admin: { width: '50%' },
        },
      ],
    },
    richTextField('description', { en: 'Description', de: 'Beschreibung' }),
    visibleInField,
    legacyIdField,
  ],
}
