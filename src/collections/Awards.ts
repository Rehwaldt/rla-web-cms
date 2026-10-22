import type { CollectionConfig } from 'payload'
import { publishedOrAuthenticated } from '@/access/publishedOrAuthenticated'
import { legacyIdField } from '@/fields/legacyId'
import { linksField } from '@/fields/links'
import { richTextField } from '@/fields/richText'
import { visibleInField } from '@/fields/visibleIn'
import { GROUPS } from '@/i18n/groups'
import { websitePreview } from '@/websitePreview'

export const Awards: CollectionConfig = {
  slug: 'awards',
  labels: {
    singular: { en: 'Award', de: 'Auszeichnung' },
    plural: { en: 'Awards', de: 'Auszeichnungen' },
  },
  defaultSort: '-year',
  admin: {
    preview: websitePreview('awards'),
    useAsTitle: 'name',
    group: GROUPS.content,
    defaultColumns: ['name', 'year', 'issuer', '_status'],
  },
  access: { read: publishedOrAuthenticated },
  versions: { drafts: true },
  fields: [
    { name: 'name', label: { en: 'Name', de: 'Name' }, type: 'text', localized: true },
    { name: 'issuer', label: { en: 'Issuer', de: 'Verliehen von' }, type: 'text', localized: true },
    {
      type: 'row',
      fields: [
        {
          name: 'year',
          label: { en: 'Year', de: 'Jahr' },
          type: 'number',
          required: true,
          admin: { width: '25%' },
        },
        {
          name: 'month',
          label: { en: 'Month', de: 'Monat' },
          type: 'number',
          min: 1,
          max: 12,
          admin: { width: '25%' },
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
    ...richTextField('description', { en: 'Description', de: 'Beschreibung' }),
    linksField,
    visibleInField,
    legacyIdField,
  ],
}
