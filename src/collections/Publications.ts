import type { CollectionConfig } from 'payload'
import { publishedOrAuthenticated } from '@/access/publishedOrAuthenticated'
import { legacyIdField } from '@/fields/legacyId'
import { visibleInField } from '@/fields/visibleIn'
import { GROUPS } from '@/i18n/groups'
import { websitePreview } from '@/websitePreview'

// A publication is either a stand-alone book (title = book title) or an article that appeared in
// a journal or in a book (title = article/chapter, plus that journal or book in publishedIn).
export const Publications: CollectionConfig = {
  slug: 'publications',
  labels: {
    singular: { en: 'Publication', de: 'Publikation' },
    plural: { en: 'Publications', de: 'Publikationen' },
  },
  defaultSort: '-year',
  admin: {
    preview: websitePreview('publications'),
    useAsTitle: 'title',
    group: GROUPS.publications,
    defaultColumns: ['title', 'year', 'category', 'authors', '_status'],
  },
  access: { read: publishedOrAuthenticated },
  versions: { drafts: true },
  fields: [
    {
      name: 'category',
      label: { en: 'Category', de: 'Kategorie' },
      type: 'relationship',
      relationTo: 'publication-categories',
    },
    { name: 'title', label: { en: 'Title', de: 'Titel' }, type: 'text', localized: true },
    {
      name: 'subtitle',
      label: { en: 'Subtitle', de: 'Untertitel' },
      type: 'text',
      localized: true,
    },
    { name: 'authors', label: { en: 'Authors', de: 'Autorschaft' }, type: 'text', localized: true },
    {
      type: 'collapsible',
      label: { en: 'Published in', de: 'Erschienen in' },
      fields: [
        {
          name: 'publishedIn',
          label: { en: 'Journal or book', de: 'Zeitschrift oder Buch' },
          type: 'group',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'title',
                  label: { en: 'Title', de: 'Titel' },
                  type: 'text',
                  localized: true,
                  admin: { width: '50%' },
                },
                {
                  name: 'subtitle',
                  label: { en: 'Subtitle', de: 'Untertitel' },
                  type: 'text',
                  localized: true,
                  admin: { width: '50%' },
                },
              ],
            },
          ],
        },
        {
          type: 'row',
          fields: [
            {
              name: 'editors',
              label: { en: 'Editors', de: 'Herausgeberschaft' },
              type: 'text',
              localized: true,
              admin: { width: '50%' },
            },
            {
              name: 'publisher',
              label: { en: 'Publisher', de: 'Verlag' },
              type: 'text',
              localized: true,
              admin: { width: '50%' },
            },
          ],
        },
        {
          type: 'row',
          fields: [
            {
              name: 'year',
              label: { en: 'Year', de: 'Jahr' },
              type: 'number',
              admin: { width: '33%' },
            },
            {
              name: 'month',
              label: { en: 'Month', de: 'Monat' },
              type: 'number',
              min: 1,
              max: 12,
              admin: { width: '33%' },
            },
            {
              name: 'pages',
              label: { en: 'Pages', de: 'Seiten' },
              type: 'text',
              admin: {
                width: '34%',
                description: {
                  en: 'A page or range, e.g. "12-34".',
                  de: 'Eine Seite oder ein Bereich, z. B. „12-34“.',
                },
              },
            },
          ],
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'image',
          label: { en: 'Image', de: 'Bild' },
          type: 'upload',
          relationTo: 'media',
          admin: { width: '50%' },
        },
        {
          name: 'file',
          label: { en: 'PDF', de: 'PDF' },
          type: 'upload',
          relationTo: 'media',
          filterOptions: { mimeType: { equals: 'application/pdf' } },
          admin: { width: '50%' },
        },
      ],
    },
    { name: 'url', label: { en: 'External URL', de: 'Externe URL' }, type: 'text' },
    {
      name: 'projects',
      label: { en: 'Projects', de: 'Projekte' },
      type: 'relationship',
      relationTo: 'projects',
      hasMany: true,
    },
    visibleInField,
    legacyIdField,
  ],
}
