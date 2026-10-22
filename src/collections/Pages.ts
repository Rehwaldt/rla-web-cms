import type { CollectionConfig } from 'payload'
import { publishedOrAuthenticated } from '@/access/publishedOrAuthenticated'
import { flowField } from '@/fields/flow'
import { legacyIdField } from '@/fields/legacyId'
import { richTextField } from '@/fields/richText'
import { GROUPS } from '@/i18n/groups'
import { websitePreview } from '@/websitePreview'

// Stand-alone website pages (office profile, contact, imprint, …), fetched by `key`.
export const Pages: CollectionConfig = {
  slug: 'pages',
  labels: {
    singular: { en: 'Page', de: 'Seite' },
    plural: { en: 'Pages', de: 'Seiten' },
  },
  admin: {
    preview: websitePreview('pages'),
    useAsTitle: 'title',
    group: GROUPS.content,
    defaultColumns: ['title', 'key', '_status'],
  },
  access: { read: publishedOrAuthenticated },
  versions: { drafts: true },
  fields: [
    {
      name: 'key',
      label: { en: 'Key', de: 'Seitenschlüssel' },
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        position: 'sidebar',
        description: {
          en: 'Identifier the website uses to fetch this page, e.g. "office-profile".',
          de: 'Kennung, mit der die Website diese Seite abruft, z. B. „office-profile“.',
        },
      },
    },
    { name: 'title', label: { en: 'Title', de: 'Titel' }, type: 'text', localized: true },
    { name: 'subtitle', label: { en: 'Subtitle', de: 'Untertitel' }, type: 'textarea', localized: true },
    { name: 'image', label: { en: 'Image', de: 'Bild' }, type: 'upload', relationTo: 'media' },
    ...richTextField('content', { en: 'Content', de: 'Inhalt' }),
    {
      name: 'timeline',
      label: { en: 'Timeline', de: 'Zeitleiste' },
      labels: {
        singular: { en: 'Entry', de: 'Eintrag' },
        plural: { en: 'Entries', de: 'Einträge' },
      },
      type: 'array',
      localized: true,
      admin: {
        description: {
          en: 'Periods and what happened in them, shown as two columns after the content, e.g. a CV.',
          de: 'Zeiträume und was in ihnen geschah, zweispaltig nach dem Inhalt dargestellt, z. B. ein Lebenslauf.',
        },
      },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'period',
              label: { en: 'Period', de: 'Zeitraum' },
              type: 'text',
              required: true,
              admin: { width: '25%' },
            },
            {
              name: 'text',
              label: { en: 'Entry', de: 'Eintrag' },
              type: 'textarea',
              required: true,
              admin: { width: '75%' },
            },
          ],
        },
      ],
    },
    flowField({ localized: true }),
    legacyIdField,
  ],
}
