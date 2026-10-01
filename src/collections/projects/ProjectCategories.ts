import type { CollectionConfig } from 'payload'
import { createBreadcrumbsField, createParentField } from '@payloadcms/plugin-nested-docs'
import { anyone } from '@/access/publishedOrAuthenticated'
import { legacyIdField } from '@/fields/legacyId'
import { requiredInDefaultLocale } from '@/fields/validation'
import { GROUPS } from '@/i18n/groups'

// Two-level tree (top-level groups with child categories). The `parent` and `breadcrumbs` fields
// come from the nested-docs plugin, declared here so they get translated labels; drag-and-drop
// order in the list view is the display order.
export const ProjectCategories: CollectionConfig = {
  slug: 'project-categories',
  labels: {
    singular: { en: 'Project category', de: 'Projektkategorie' },
    plural: { en: 'Project categories', de: 'Projektkategorien' },
  },
  orderable: true,
  admin: {
    useAsTitle: 'name',
    group: GROUPS.projects,
    defaultColumns: ['name', 'parent', 'menuColumn'],
  },
  access: { read: anyone },
  fields: [
    {
      name: 'name',
      label: { en: 'Name', de: 'Name' },
      type: 'text',
      localized: true,
      validate: requiredInDefaultLocale,
    },
    {
      name: 'menuColumn',
      label: { en: 'Menu column', de: 'Menüspalte' },
      type: 'select',
      options: ['1', '2', '3', '4'].map((value) => ({
        label: { en: `Column ${value}`, de: `Spalte ${value}` },
        value,
      })),
      admin: {
        condition: (data) => !data?.parent,
        description: {
          en: 'Column of the project filter menu this top-level group appears in.',
          de: 'Spalte des Projektfilter-Menüs, in der diese Gruppe der obersten Ebene erscheint.',
        },
      },
    },
    legacyIdField,
    createParentField('project-categories', {
      label: { en: 'Parent group', de: 'Übergeordnete Gruppe' },
    }),
    // Maintained by the plugin and only read by the website, so editors don't need to see it.
    createBreadcrumbsField('project-categories', { admin: { hidden: true } }),
  ],
}
