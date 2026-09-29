import type { CollectionConfig } from 'payload'
import { publishedOrAuthenticated } from '@/access/publishedOrAuthenticated'
import { flowField } from '@/fields/flow'
import { legacyIdField } from '@/fields/legacyId'
import { richTextField } from '@/fields/richText'

// Thematic focus areas (e.g. "Water in the city") that group projects.
export const Topics: CollectionConfig = {
  slug: 'topics',
  admin: {
    useAsTitle: 'name',
    group: 'Projects',
    defaultColumns: ['name', '_status'],
  },
  access: { read: publishedOrAuthenticated },
  versions: { drafts: true },
  fields: [
    { name: 'name', type: 'text', localized: true },
    { name: 'image', type: 'upload', relationTo: 'media' },
    richTextField('description'),
    { name: 'projects', type: 'relationship', relationTo: 'projects', hasMany: true },
    flowField(),
    legacyIdField,
  ],
}
