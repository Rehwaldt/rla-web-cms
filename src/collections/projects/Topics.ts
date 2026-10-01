import type { CollectionConfig } from 'payload'
import { publishedOrAuthenticated } from '@/access/publishedOrAuthenticated'
import { flowField } from '@/fields/flow'
import { legacyIdField } from '@/fields/legacyId'
import { richTextField } from '@/fields/richText'
import { GROUPS } from '@/i18n/groups'

// Thematic focus areas (e.g. "Water in the city") that group projects.
export const Topics: CollectionConfig = {
  slug: 'topics',
  labels: {
    singular: { en: 'Topic', de: 'Thema' },
    plural: { en: 'Topics', de: 'Themen' },
  },
  admin: {
    useAsTitle: 'name',
    group: GROUPS.projects,
    defaultColumns: ['name', '_status'],
  },
  access: { read: publishedOrAuthenticated },
  versions: { drafts: true },
  fields: [
    { name: 'name', label: { en: 'Name', de: 'Name' }, type: 'text', localized: true },
    { name: 'image', label: { en: 'Image', de: 'Bild' }, type: 'upload', relationTo: 'media' },
    richTextField('description', { en: 'Description', de: 'Beschreibung' }),
    {
      name: 'projects',
      label: { en: 'Projects', de: 'Projekte' },
      type: 'relationship',
      relationTo: 'projects',
      hasMany: true,
    },
    flowField(),
    legacyIdField,
  ],
}
