import type { CollectionConfig } from 'payload'
import { publishedOrAuthenticated } from '@/access/publishedOrAuthenticated'
import { flowField } from '@/fields/flow'
import { legacyIdField } from '@/fields/legacyId'
import { richTextField } from '@/fields/richText'

// Stand-alone website pages (office profile, contact, imprint, …), fetched by `key`.
export const Pages: CollectionConfig = {
  slug: 'pages',
  admin: {
    useAsTitle: 'title',
    group: 'Content',
    defaultColumns: ['title', 'key', '_status'],
  },
  access: { read: publishedOrAuthenticated },
  versions: { drafts: true },
  fields: [
    {
      name: 'key',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        position: 'sidebar',
        description: 'Identifier the website uses to fetch this page, e.g. "office-profile".',
      },
    },
    { name: 'title', type: 'text', localized: true },
    { name: 'subtitle', type: 'textarea', localized: true },
    { name: 'image', type: 'upload', relationTo: 'media' },
    richTextField('content'),
    flowField({ localized: true }),
    legacyIdField,
  ],
}
