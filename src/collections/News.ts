import type { CollectionConfig } from 'payload'
import { publishedOrAuthenticated } from '@/access/publishedOrAuthenticated'
import { legacyIdField } from '@/fields/legacyId'
import { linksField } from '@/fields/links'
import { richTextField } from '@/fields/richText'
import { visibleInField } from '@/fields/visibleIn'

export const News: CollectionConfig = {
  slug: 'news',
  defaultSort: '-date',
  admin: {
    useAsTitle: 'title',
    group: 'Content',
    defaultColumns: ['title', 'date', '_status'],
  },
  access: { read: publishedOrAuthenticated },
  versions: { drafts: true },
  fields: [
    { name: 'title', type: 'text', localized: true },
    {
      type: 'row',
      fields: [
        {
          name: 'date',
          type: 'date',
          required: true,
          admin: {
            width: '50%',
            date: { pickerAppearance: 'dayOnly', displayFormat: 'dd.MM.yyyy' },
          },
        },
        { name: 'image', type: 'upload', relationTo: 'media', admin: { width: '50%' } },
      ],
    },
    richTextField('content'),
    linksField,
    visibleInField,
    legacyIdField,
  ],
}
