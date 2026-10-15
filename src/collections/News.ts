import type { CollectionConfig } from 'payload'
import { publishedOrAuthenticated } from '@/access/publishedOrAuthenticated'
import { legacyIdField } from '@/fields/legacyId'
import { linksField } from '@/fields/links'
import { richTextField } from '@/fields/richText'
import { visibleInField } from '@/fields/visibleIn'
import { GROUPS } from '@/i18n/groups'

export const News: CollectionConfig = {
  slug: 'news',
  labels: {
    singular: { en: 'News item', de: 'News' },
    plural: { en: 'News', de: 'News' },
  },
  defaultSort: '-date',
  admin: {
    useAsTitle: 'title',
    group: GROUPS.content,
    defaultColumns: ['title', 'date', '_status'],
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
          required: true,
          admin: {
            width: '50%',
            date: { pickerAppearance: 'dayOnly', displayFormat: 'dd.MM.yyyy' },
          },
        },
        {
          name: 'image',
          label: { en: 'Image', de: 'Bild' },
          type: 'upload',
          relationTo: 'media',
          admin: { width: '50%' },
        },
      ],
    },
    ...richTextField('content', { en: 'Content', de: 'Inhalt' }),
    linksField,
    visibleInField,
    legacyIdField,
  ],
}
