import type { GlobalConfig } from 'payload'
import { anyone } from '@/access/publishedOrAuthenticated'

// The curated, ordered selection of featured projects the projects page shows by default.
export const ProjectGallery: GlobalConfig = {
  slug: 'project-gallery',
  admin: { group: 'Projects' },
  access: { read: anyone },
  fields: [
    {
      name: 'projects',
      type: 'relationship',
      relationTo: 'projects',
      hasMany: true,
      localized: true,
      admin: {
        description: 'Featured projects in display order. Each language has its own selection.',
      },
    },
  ],
}
