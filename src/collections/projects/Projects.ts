import type { CollectionConfig } from 'payload'
import { lexicalEditor, FixedToolbarFeature } from '@payloadcms/richtext-lexical'
import { locationField } from '@/fields/location'
import { flowField } from '@/fields/flow'

export const Projects: CollectionConfig = {
  slug: 'project',
  admin: {
    useAsTitle: 'name',
    group: 'Projects',
    defaultColumns: ['id', 'name', 'status'],
    listSearchableFields: ['name', 'id'],
  },
  fields: [
    {
      name: 'id',
      type: 'text',
      required: true,
      access: {
        update: () => false,
      },
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'General',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'name',
                  type: 'text',
                  localized: true,
                  required: true,
                },
                {
                  name: 'status',
                  type: 'select',
                  options: [
                    {
                      label: 'in planning',
                      value: 'planning',
                    },
                    {
                      label: 'under construction',
                      value: 'construction',
                    },
                    {
                      label: 'done',
                      value: 'done',
                    },
                    {
                      label: 'partially done',
                      value: 'partially_done',
                    },
                    {
                      label: 'finished (Study/Competition)',
                      value: 'finished',
                    },
                    {
                      label: 'paused',
                      value: 'paused',
                    },
                    {
                      label: 'canceled',
                      value: 'canceled',
                    },
                  ],
                },
                {
                  name: 'yearCompletion',
                  type: 'number',
                  label: 'Year of Completion',
                  min: 1950,
                  max: 2200,
                  admin: {
                    description: 'can be forecast aswell ',
                  },
                },
                {
                  name: 'surfaceArea',
                  type: 'number',
                  min: 0,
                  admin: {
                    description: 'in ha',
                  },
                },
              ],
            },
            {
              type: 'group',
              name: 'active_in',
              label: 'Display in/on...',
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'intranet',
                      type: 'checkbox',
                      defaultValue: true,
                    },
                    {
                      name: 'werkx',
                      type: 'checkbox',
                      defaultValue: true,
                    },
                    {
                      name: 'web',
                      type: 'checkbox',
                      defaultValue: false,
                    },
                  ],
                },
              ],
            },
            {
              name: 'similarProjects',
              label: 'Similar Projects',
              type: 'relationship',
              relationTo: 'project',
              hasMany: true,
              filterOptions: ({ id }) => ({
                id: { not_equals: id },
              }),
              admin: {
                description:
                  'Legacy aehnliche_projekte — a symmetric relation on the legacy side (queried both directions), so add the link on either project.',
              },
            },
          ],
        },
        {
          label: 'Location',
          fields: [locationField],
        },
        {
          label: 'Website',
          description:
            'Fields sourced from the public website (website_rla/1_php models/project.php).',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'type',
                  type: 'select',
                  options: [
                    { label: 'Competition', value: 'competition' },
                    { label: 'Object', value: 'object' },
                    { label: 'Concept', value: 'concept' },
                  ],
                  admin: {
                    description:
                      'Legacy type, derived from als_wettbewerb/als_projekt/objektplanung.',
                  },
                },
                {
                  name: 'usesDarkTheme',
                  type: 'checkbox',
                  admin: {
                    description: 'Legacy dunkle_buttons.',
                  },
                },
              ],
            },
            {
              name: 'categories',
              type: 'relationship',
              relationTo: 'projectCategory',
              hasMany: true,
              admin: {
                description: 'Legacy kategorie — pipe-delimited list of projektkategorien ids.',
              },
            },
            {
              name: 'location',
              type: 'text',
              localized: true,
              admin: {
                description:
                  'Legacy ort — a short display location, distinct from the full postal address on the Location tab.',
              },
            },
            {
              name: 'motto',
              type: 'text',
              localized: true,
            },
            {
              name: 'shortDescription',
              type: 'text',
              localized: true,
              admin: {
                description: 'Legacy kurzbeschreibung.',
              },
            },
            {
              name: 'description',
              type: 'richText',
              localized: true,
              editor: lexicalEditor({
                features: ({ defaultFeatures }) => [...defaultFeatures, FixedToolbarFeature()],
              }),
              admin: {
                description: 'Legacy text.',
              },
            },
            {
              name: 'thumbnail',
              type: 'upload',
              relationTo: 'media',
              admin: {
                description: 'Legacy titelbild.',
              },
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'client',
                  type: 'text',
                  localized: true,
                  admin: {
                    width: '50%',
                    description: 'Legacy auftraggeber.',
                  },
                },
                {
                  name: 'architect',
                  type: 'text',
                  localized: true,
                  admin: {
                    width: '50%',
                    description: 'Legacy architekt.',
                  },
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'planningPartners',
                  type: 'text',
                  localized: true,
                  admin: {
                    width: '50%',
                    description: 'Legacy planungspartner.',
                  },
                },
                {
                  name: 'additionalInfo',
                  type: 'text',
                  localized: true,
                  admin: {
                    width: '50%',
                    description: 'Legacy weitere_daten — shown as an unlabeled basic-info row.',
                  },
                },
              ],
            },
            {
              name: 'competition',
              type: 'group',
              label: 'Competition Result',
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'year',
                      type: 'number',
                      admin: {
                        width: '34%',
                        description: 'Legacy wettbewerb.',
                      },
                    },
                    {
                      name: 'place',
                      type: 'number',
                      admin: {
                        width: '33%',
                        description: 'Legacy preis.',
                      },
                    },
                    {
                      name: 'purchased',
                      type: 'checkbox',
                      admin: {
                        width: '33%',
                        description: 'Legacy ankauf.',
                      },
                    },
                  ],
                },
              ],
            },
            {
              name: 'links',
              type: 'array',
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'label',
                      type: 'text',
                      localized: true,
                      required: true,
                      admin: {
                        width: '40%',
                      },
                    },
                    {
                      name: 'url',
                      type: 'text',
                      required: true,
                      admin: {
                        width: '60%',
                        placeholder: 'https://...',
                      },
                    },
                  ],
                },
              ],
            },
            flowField('Legacy projekte.bilder_flow column.'),
          ],
        },
      ],
    },
  ],
}
