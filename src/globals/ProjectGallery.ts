import type { GlobalConfig } from 'payload'
import { anyone } from '@/access/publishedOrAuthenticated'
import { GROUPS } from '@/i18n/groups'

// The curated, ordered selection of featured projects the projects page shows by default.
export const ProjectGallery: GlobalConfig = {
  slug: 'project-gallery',
  label: { en: 'Project gallery', de: 'Projektgalerie' },
  admin: { group: GROUPS.projects },
  access: { read: anyone },
  fields: [
    {
      name: 'projects',
      label: { en: 'Projects', de: 'Projekte' },
      type: 'relationship',
      relationTo: 'projects',
      hasMany: true,
      localized: true,
      admin: {
        description: {
          en: 'Featured projects in display order. Each language has its own selection.',
          de: 'Hervorgehobene Projekte in Anzeigereihenfolge. Jede Sprache hat ihre eigene Auswahl.',
        },
      },
    },
  ],
}
