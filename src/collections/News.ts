import type { CollectionConfig } from 'payload'
import { publishedOrAuthenticated } from '@/access/publishedOrAuthenticated'
import { legacyIdField } from '@/fields/legacyId'
import { linksField } from '@/fields/links'
import { richTextField } from '@/fields/richText'
import { visibleInField } from '@/fields/visibleIn'
import { GROUPS } from '@/i18n/groups'
import { websitePreview } from '@/websitePreview'

const IMAGES_ONLY = { mimeType: { contains: 'image/' } }

// Shaped like the intranet's news (rlaintra24), so both can share this collection one day: a
// banner, a tile image, a gallery, categories and links to projects or other sites.
export const News: CollectionConfig = {
  slug: 'news',
  labels: {
    singular: { en: 'News item', de: 'News' },
    plural: { en: 'News', de: 'News' },
  },
  defaultSort: '-date',
  admin: {
    preview: websitePreview('news'),
    useAsTitle: 'title',
    group: GROUPS.content,
    defaultColumns: ['title', 'date', 'categories', '_status'],
  },
  access: { read: publishedOrAuthenticated },
  versions: { drafts: true },
  fields: [
    { name: 'title', label: { en: 'Title', de: 'Titel' }, type: 'text', localized: true },
    {
      type: 'row',
      fields: [
        {
          name: 'date',
          label: { en: 'Date', de: 'Datum' },
          type: 'date',
          required: true,
          admin: {
            width: '50%',
            date: { pickerAppearance: 'dayOnly', displayFormat: 'dd.MM.yyyy' },
          },
        },
        {
          name: 'categories',
          label: { en: 'Categories', de: 'Kategorien' },
          type: 'relationship',
          relationTo: 'news-categories',
          hasMany: true,
          admin: { width: '50%' },
        },
      ],
    },
    ...richTextField('content', { en: 'Content', de: 'Inhalt' }),
    {
      type: 'row',
      fields: [
        {
          name: 'heroImage',
          label: { en: 'Hero image', de: 'Titelbild' },
          type: 'upload',
          relationTo: 'media',
          filterOptions: IMAGES_ONLY,
          admin: {
            width: '50%',
            description: {
              en: 'Banner at the top of the news page. If empty, the first gallery image.',
              de: 'Banner oben auf der News-Seite. Wenn leer, das erste Bild der Galerie.',
            },
          },
        },
        {
          name: 'previewImage',
          label: { en: 'Preview image', de: 'Vorschaubild' },
          type: 'upload',
          relationTo: 'media',
          filterOptions: IMAGES_ONLY,
          admin: {
            width: '50%',
            description: {
              en: 'Tile image in listings. If empty, the hero image.',
              de: 'Kachelbild in Listen. Wenn leer, das Titelbild.',
            },
          },
        },
      ],
    },
    {
      name: 'gallery',
      label: { en: 'Gallery', de: 'Galerie' },
      type: 'upload',
      relationTo: 'media',
      hasMany: true,
      filterOptions: IMAGES_ONLY,
      admin: {
        description: {
          en: 'Images below the text, in this order. They open in a lightbox.',
          de: 'Bilder unter dem Text, in dieser Reihenfolge. Sie öffnen sich in einer Lightbox.',
        },
      },
    },
    linksField,
    visibleInField,
    legacyIdField,
  ],
}
