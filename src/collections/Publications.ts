import type { CollectionConfig } from 'payload'
import { publishedOrAuthenticated } from '@/access/publishedOrAuthenticated'
import { legacyIdField } from '@/fields/legacyId'
import { visibleInField } from '@/fields/visibleIn'

// A publication is either a stand-alone book (title = book title) or a piece that appeared in a
// journal or in a book (title = article/chapter, plus the journal or book fields).
export const Publications: CollectionConfig = {
  slug: 'publications',
  defaultSort: '-year',
  admin: {
    useAsTitle: 'title',
    group: 'Content',
    defaultColumns: ['title', 'year', 'category', 'authors', '_status'],
  },
  access: { read: publishedOrAuthenticated },
  versions: { drafts: true },
  fields: [
    { name: 'category', type: 'relationship', relationTo: 'publication-categories' },
    { name: 'title', type: 'text', localized: true },
    { name: 'subtitle', type: 'text', localized: true },
    { name: 'authors', type: 'text', localized: true },
    {
      type: 'collapsible',
      label: 'Published in',
      fields: [
        { name: 'journal', type: 'text', localized: true },
        {
          type: 'row',
          fields: [
            { name: 'bookTitle', type: 'text', localized: true, admin: { width: '50%' } },
            { name: 'bookSubtitle', type: 'text', localized: true, admin: { width: '50%' } },
          ],
        },
        {
          type: 'row',
          fields: [
            { name: 'editors', type: 'text', localized: true, admin: { width: '50%' } },
            { name: 'publisher', type: 'text', localized: true, admin: { width: '50%' } },
          ],
        },
        {
          type: 'row',
          fields: [
            { name: 'year', type: 'number', admin: { width: '33%' } },
            { name: 'month', type: 'number', min: 1, max: 12, admin: { width: '33%' } },
            {
              name: 'pages',
              type: 'text',
              admin: { width: '34%', description: 'A page or range, e.g. "12-34".' },
            },
          ],
        },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'image', type: 'upload', relationTo: 'media', admin: { width: '50%' } },
        {
          name: 'file',
          label: 'PDF',
          type: 'upload',
          relationTo: 'media',
          filterOptions: { mimeType: { equals: 'application/pdf' } },
          admin: { width: '50%' },
        },
      ],
    },
    { name: 'url', label: 'External URL', type: 'text' },
    { name: 'projects', type: 'relationship', relationTo: 'projects', hasMany: true },
    visibleInField,
    legacyIdField,
  ],
}
