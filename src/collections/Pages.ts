import type { CollectionConfig } from 'payload'
import { publishedOrAuthenticated } from '@/access/publishedOrAuthenticated'
import { featuredNewsField } from '@/fields/featuredNews'
import { featuredProjectsField } from '@/fields/featuredProjects'
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
      type: 'tabs',
      tabs: [
        {
          label: { en: 'Overview', de: 'Übersicht' },
          fields: [
            { name: 'title', label: { en: 'Title', de: 'Titel' }, type: 'text', localized: true },
            {
              name: 'subtitle',
              label: { en: 'Subtitle', de: 'Untertitel' },
              type: 'textarea',
              localized: true,
            },
            {
              name: 'image',
              label: { en: 'Image', de: 'Bild' },
              type: 'upload',
              relationTo: 'media',
            },
            ...richTextField('content', { en: 'Content', de: 'Inhalt' }),
          ],
        },
        {
          label: { en: 'Flow', de: 'Flow' },
          fields: [flowField({ localized: true })],
        },
        {
          label: { en: 'Featured', de: 'Verlinkungen' },
          fields: [featuredNewsField, featuredProjectsField],
        },
      ],
    },
    legacyIdField,
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
  ],
}
