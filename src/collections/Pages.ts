import type { CollectionConfig } from 'payload'
import { publishedOrAuthenticated } from '@/access/publishedOrAuthenticated'
import { flowField } from '@/fields/flow'
import { legacyIdField } from '@/fields/legacyId'
import { richTextField } from '@/fields/richText'
import { GROUPS } from '@/i18n/groups'

// Stand-alone website pages (office profile, contact, imprint, …), fetched by `key`.
export const Pages: CollectionConfig = {
  slug: 'pages',
  labels: {
    singular: { en: 'Page', de: 'Seite' },
    plural: { en: 'Pages', de: 'Seiten' },
  },
  admin: {
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
    richTextField('content', { en: 'Content', de: 'Inhalt' }),
    flowField({ localized: true }),
    legacyIdField,
  ],
}
