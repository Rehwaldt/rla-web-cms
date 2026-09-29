import type { CollectionConfig } from 'payload'
import { publishedOrAuthenticated } from '@/access/publishedOrAuthenticated'
import { legacyIdField } from '@/fields/legacyId'
import { linksField } from '@/fields/links'
import { richTextField } from '@/fields/richText'
import { visibleInField } from '@/fields/visibleIn'

export const Awards: CollectionConfig = {
  slug: 'awards',
  defaultSort: '-year',
  admin: {
    useAsTitle: 'name',
    group: 'Content',
    defaultColumns: ['name', 'year', 'issuer', '_status'],
  },
  access: { read: publishedOrAuthenticated },
  versions: { drafts: true },
  fields: [
    { name: 'name', type: 'text', localized: true },
    { name: 'issuer', type: 'text', localized: true },
    {
      type: 'row',
      fields: [
        { name: 'year', type: 'number', required: true, admin: { width: '25%' } },
        { name: 'month', type: 'number', min: 1, max: 12, admin: { width: '25%' } },
        { name: 'image', type: 'upload', relationTo: 'media', admin: { width: '50%' } },
      ],
    },
    richTextField('description'),
    linksField,
    visibleInField,
    legacyIdField,
  ],
}
