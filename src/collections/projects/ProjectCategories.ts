import type { CollectionConfig } from 'payload'
import { anyone } from '@/access/publishedOrAuthenticated'
import { legacyIdField } from '@/fields/legacyId'

// Two-level tree (top-level groups with child categories). The `parent` and `breadcrumbs` fields
// come from the nested-docs plugin; drag-and-drop order in the list view is the display order.
export const ProjectCategories: CollectionConfig = {
  slug: 'project-categories',
  orderable: true,
  admin: {
    useAsTitle: 'name',
    group: 'Projects',
    defaultColumns: ['name', 'parent', 'menuColumn'],
  },
  access: { read: anyone },
  fields: [
    { name: 'name', type: 'text', localized: true, required: true },
    {
      name: 'menuColumn',
      type: 'select',
      options: ['1', '2', '3', '4'].map((value) => ({ label: `Column ${value}`, value })),
      admin: {
        condition: (data) => !data?.parent,
        description: 'Column of the project filter menu this top-level group appears in.',
      },
    },
    legacyIdField,
  ],
}
