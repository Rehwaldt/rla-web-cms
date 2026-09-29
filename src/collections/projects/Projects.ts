import type { CollectionConfig } from 'payload'
import { publishedOrAuthenticated } from '@/access/publishedOrAuthenticated'
import { countryField } from '@/fields/country'
import { flowField } from '@/fields/flow'
import { legacyIdField } from '@/fields/legacyId'
import { linksField } from '@/fields/links'
import { richTextField } from '@/fields/richText'
import { visibleInField } from '@/fields/visibleIn'

export const Projects: CollectionConfig = {
  slug: 'projects',
  admin: {
    useAsTitle: 'name',
    group: 'Projects',
    defaultColumns: ['name', 'code', 'type', 'completionYear', '_status'],
    listSearchableFields: ['name', 'code'],
  },
  access: { read: publishedOrAuthenticated },
  versions: { drafts: true },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'name', type: 'text', localized: true, admin: { width: '70%' } },
        {
          name: 'code',
          type: 'text',
          unique: true,
          index: true,
          admin: {
            width: '30%',
            description: 'Short project code shared across RLA systems and used in website URLs.',
          },
        },
      ],
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Overview',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'type',
                  type: 'select',
                  options: [
                    { label: 'Competition', value: 'competition' },
                    { label: 'Object planning', value: 'object' },
                    { label: 'Concept', value: 'concept' },
                  ],
                  admin: { width: '34%' },
                },
                {
                  name: 'ongoing',
                  type: 'checkbox',
                  admin: { width: '33%', description: 'Still in planning or under construction.' },
                },
                {
                  name: 'completionYear',
                  type: 'number',
                  min: 1950,
                  max: 2200,
                  admin: { width: '33%', description: 'The planned year while the project is ongoing.' },
                },
              ],
            },
            { name: 'motto', type: 'text', localized: true },
            {
              name: 'summary',
              type: 'text',
              localized: true,
              admin: { description: 'Short teaser shown in listings.' },
            },
            richTextField('description'),
            { name: 'categories', type: 'relationship', relationTo: 'project-categories', hasMany: true },
            {
              name: 'similarProjects',
              type: 'relationship',
              relationTo: 'projects',
              hasMany: true,
              filterOptions: ({ id }) => ({ id: { not_equals: id } }),
              admin: {
                description:
                  'Similarity is symmetric: projects listing this one appear under "Listed as similar by".',
              },
            },
            {
              name: 'listedAsSimilarBy',
              type: 'join',
              collection: 'projects',
              on: 'similarProjects',
            },
          ],
        },
        {
          label: 'Facts',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'place',
                  type: 'text',
                  localized: true,
                  admin: { width: '40%', description: 'Display location, usually the city.' },
                },
                {
                  name: 'region',
                  type: 'text',
                  localized: true,
                  admin: {
                    width: '30%',
                    description: 'Optional state or province, shown instead of the country.',
                  },
                },
                countryField({ admin: { width: '30%' } }),
              ],
            },
            {
              type: 'row',
              fields: [
                { name: 'client', type: 'text', localized: true, admin: { width: '50%' } },
                { name: 'architect', type: 'text', localized: true, admin: { width: '50%' } },
              ],
            },
            {
              type: 'row',
              fields: [
                { name: 'planningPartners', type: 'text', localized: true, admin: { width: '70%' } },
                {
                  name: 'area',
                  type: 'number',
                  min: 0,
                  admin: { width: '30%', description: 'In hectares.' },
                },
              ],
            },
            {
              name: 'additionalInfo',
              type: 'text',
              localized: true,
              admin: { description: 'Free-form extra fact, e.g. image credits.' },
            },
            {
              name: 'competition',
              type: 'group',
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'year', type: 'number', admin: { width: '34%' } },
                    {
                      name: 'prize',
                      type: 'number',
                      min: 1,
                      admin: { width: '33%', description: 'Prize rank, e.g. 1 for first prize.' },
                    },
                    {
                      name: 'purchased',
                      type: 'checkbox',
                      admin: { width: '33%', description: 'The entry was purchased by the jury.' },
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'Media',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'heroImage',
                  type: 'upload',
                  relationTo: 'media',
                  admin: { width: '50%', description: 'Large image at the top of the project page.' },
                },
                {
                  name: 'previewImage',
                  type: 'upload',
                  relationTo: 'media',
                  admin: { width: '50%', description: 'Tile image in listings and galleries.' },
                },
              ],
            },
            {
              name: 'darkControls',
              type: 'checkbox',
              admin: { description: 'Draw the page controls in dark colors, for light hero images.' },
            },
            flowField(),
          ],
        },
        {
          label: 'Links',
          fields: [linksField],
        },
      ],
    },
    visibleInField,
    legacyIdField,
  ],
}
