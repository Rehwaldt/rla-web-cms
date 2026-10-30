import type { CollectionConfig } from 'payload'
import { createBreadcrumbsField, createParentField } from '@payloadcms/plugin-nested-docs'
import { authenticated } from '@/access/authenticated'
import { intranetIdField } from '@/fields/intranetId'
import { requiredInDefaultLocale } from '@/fields/validation'
import { GROUPS } from '@/i18n/groups'

// What employees take care of in the office, as a tree: subject areas, planning phases and office
// services (from the intranet's "Fachgruppen"). Internal: the website doesn't show it. Employees may
// belong to any level, e.g. to all of "IT and technology". Drag-and-drop order is the display order.
export const Expertise: CollectionConfig = {
  slug: 'expertise',
  labels: {
    singular: { en: 'Specialist group', de: 'Fachgruppe' },
    plural: { en: 'Specialist groups', de: 'Fachgruppen' },
  },
  orderable: true,
  admin: {
    useAsTitle: 'name',
    group: GROUPS.team,
    defaultColumns: ['name', 'parent'],
  },
  access: {
    read: authenticated,
  },
  fields: [
    {
      name: 'name',
      label: { en: 'Name', de: 'Name' },
      type: 'text',
      localized: true,
      validate: requiredInDefaultLocale,
    },
    intranetIdField,
    createParentField('expertise', {
      label: { en: 'Parent group', de: 'Übergeordnete Gruppe' },
    }),
    createBreadcrumbsField('expertise', { admin: { hidden: true } }),
  ],
}
