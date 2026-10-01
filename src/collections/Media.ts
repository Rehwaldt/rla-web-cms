import type { CollectionConfig } from 'payload'
import { anyone } from '@/access/publishedOrAuthenticated'
import { legacyIdField } from '@/fields/legacyId'
import { GROUPS } from '@/i18n/groups'

// Widths match the website's responsive image breakpoints. Sizes larger than the original are
// not generated (Payload's default; `withoutEnlargement: true` would instead store a full-size
// copy of the original under that size).
const RESPONSIVE_WIDTHS = [480, 768, 992, 1382, 3000]

export const Media: CollectionConfig = {
  slug: 'media',
  labels: {
    singular: { en: 'Media item', de: 'Medium' },
    plural: { en: 'Media', de: 'Medien' },
  },
  admin: {
    group: GROUPS.media,
    defaultColumns: ['filename', 'alt', 'project'],
  },
  access: { read: anyone },
  fields: [
    { name: 'alt', label: { en: 'Alt text', de: 'Alternativtext' }, type: 'text', localized: true },
    {
      name: 'credit',
      label: { en: 'Credit', de: 'Copyright' },
      type: 'text',
      admin: {
        description: {
          en: 'Photographer or copyright holder.',
          de: 'Wer das Bild fotografiert hat oder die Rechte daran hält.',
        },
      },
    },
    {
      name: 'project',
      label: { en: 'Project', de: 'Projekt' },
      type: 'relationship',
      relationTo: 'projects',
      admin: {
        description: {
          en: 'Project the image shows. Flows use it as caption and link target.',
          de: 'Projekt, das das Bild zeigt. Flows nutzen es als Bildunterschrift und Linkziel.',
        },
      },
    },
    legacyIdField,
  ],
  upload: {
    staticDir: 'public/media',
    imageSizes: [
      { name: 'thumbnail', width: 300, height: 300, position: 'centre' },
      ...RESPONSIVE_WIDTHS.map((width) => ({ name: `w${width}`, width })),
    ],
    adminThumbnail: 'thumbnail',
    mimeTypes: ['image/*', 'application/pdf'],
  },
}
