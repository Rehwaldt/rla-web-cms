import type { CollectionConfig } from 'payload'
import { createBreadcrumbsField, createParentField } from '@payloadcms/plugin-nested-docs'
import { anyone } from '@/access/publishedOrAuthenticated'
import { legacyIdField } from '@/fields/legacyId'
import { requiredInDefaultLocale } from '@/fields/validation'
import { GROUPS } from '@/i18n/groups'
import { websitePreview } from '@/websitePreview'
import { groupsOnly, keepGroupsWithCategories, topLevelParent } from './categoryRules'

// Two-level tree (top-level groups with child categories), kept so by categoryRules. The `parent`
// and `breadcrumbs` fields come from the nested-docs plugin, declared here so they get translated
// labels. `_order` is the display order. The list view is replaced by the categories view
// (CategoryView), which lays them out like the website's project filter menu.
// Labelled just "Categories": the collection only appears under the Projects group.
export const ProjectCategories: CollectionConfig = {
  slug: 'project-categories',
  labels: {
    singular: { en: 'Category', de: 'Kategorie' },
    plural: { en: 'Categories', de: 'Kategorien' },
  },
  orderable: true,
  admin: {
    preview: websitePreview('project-categories'),
    useAsTitle: 'name',
    group: GROUPS.projects,
    defaultColumns: ['name', 'parent', 'menuColumn'],
    components: { views: { list: { Component: '@/components/cms/CategoryView#CategoryView' } } },
  },
  access: { read: anyone },
  hooks: { beforeDelete: [keepGroupsWithCategories] },
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
      filterOptions: groupsOnly,
      validate: topLevelParent('project-categories'),
    }),
    // Maintained by the plugin and only read by the website, so editors don't need to see it.
    createBreadcrumbsField('project-categories', { admin: { hidden: true } }),
  ],
}
