import type { CollectionConfig } from 'payload'
import { publishedOrAuthenticated } from '@/access/publishedOrAuthenticated'
import { legacyIdField } from '@/fields/legacyId'
import { richTextField } from '@/fields/richText'
import { visibleInField } from '@/fields/visibleIn'

export const Jobs: CollectionConfig = {
  slug: 'jobs',
  defaultSort: '-date',
  admin: {
    useAsTitle: 'title',
    group: 'Content',
    defaultColumns: ['title', 'office', 'date', '_status'],
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
          admin: {
            width: '50%',
            date: { pickerAppearance: 'dayOnly', displayFormat: 'dd.MM.yyyy' },
          },
        },
        { name: 'office', type: 'relationship', relationTo: 'offices', admin: { width: '50%' } },
      ],
    },
    richTextField('description'),
    visibleInField,
    legacyIdField,
  ],
}
