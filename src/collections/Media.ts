import type { CollectionConfig } from 'payload'
import { anyone } from '@/access/publishedOrAuthenticated'
import { legacyIdField } from '@/fields/legacyId'

// Widths match the website's responsive image breakpoints. Sizes larger than the original are
// not generated.
const RESPONSIVE_WIDTHS = [480, 768, 992, 1382, 3000]

export const Media: CollectionConfig = {
  slug: 'media',
  admin: {
    group: 'Media',
    defaultColumns: ['filename', 'alt', 'project'],
  },
  access: { read: anyone },
  fields: [
    { name: 'alt', type: 'text', localized: true },
    { name: 'credit', type: 'text', admin: { description: 'Photographer or copyright holder.' } },
    {
      name: 'project',
      type: 'relationship',
      relationTo: 'projects',
      admin: {
        description: 'Project the image shows. Flows use it as caption and link target.',
      },
    },
    legacyIdField,
  ],
  upload: {
    staticDir: 'public/media',
    imageSizes: [
      { name: 'thumbnail', width: 300, height: 300, position: 'centre' },
      ...RESPONSIVE_WIDTHS.map((width) => ({ name: `w${width}`, width, withoutEnlargement: true })),
    ],
    adminThumbnail: 'thumbnail',
    mimeTypes: ['image/*', 'application/pdf'],
  },
}
