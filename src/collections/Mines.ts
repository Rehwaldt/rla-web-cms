import type { CollectionConfig } from 'payload'
import { lexicalEditor, FixedToolbarFeature } from '@payloadcms/richtext-lexical'

export const Mines: CollectionConfig = {
  slug: 'mines',
  admin: {
    useAsTitle: 'title',
    group: 'Minescapes',
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        // general
        {
          label: 'General',
          description: 'Enter the mines name, center & description here.',
          fields: [
            {
              name: 'title',
              type: 'text',
              localized: true,
              required: true,
            },
            {
              name: 'location',
              type: 'point',
              label: 'Location',
              admin: {
                components: {
                  Field: '@/components/cms/MapFieldLoader', // Path to your component
                },
              },
            },
            {
              name: 'content',
              type: 'richText',
              localized: true,
              editor: lexicalEditor({
                features: ({ defaultFeatures }) => [...defaultFeatures, FixedToolbarFeature()],
              }),
            },
          ],
        },
        // details
        {
          label: 'Details',
          description: 'Enter all historical & industrial data here.',
          fields: [
            {
              name: 'siteType',
              type: 'select',
              label: 'Site / Mine Type',
              hasMany: true, // Recommended because a site often includes both a pit and a dump
              options: [
                {
                  label: 'Open-Cast / Open-Pit Mine',
                  value: 'open_cast',
                },
                {
                  label: 'External Dump / Spoil Tip',
                  value: 'external_dump',
                },
                {
                  label: 'Underground Mine',
                  value: 'underground',
                },
                {
                  label: 'Quarry',
                  value: 'quarry',
                },
                {
                  label: 'Mountaintop Removal',
                  value: 'mountaintop_removal',
                },
              ],
            },
            {
              name: 'status',
              type: 'select',
              label: 'Status',
              options: [
                {
                  label: 'in use',
                  value: 'in_use',
                },
                {
                  label: 'in revitalization',
                  value: 'in_revitalization',
                },
                {
                  label: 'revitalized',
                  value: 'revitalized',
                },
              ],
            },
            {
              name: 'closureYear',
              type: 'number',
              label: 'Year of Closure',
              admin: {
                placeholder: 'e.g. 1984',
                condition: (data) => data?.status && data?.status !== 'in_use',
              },
              min: 1800,
              max: 2100,
            },
            {
              name: 'extractedMaterials',
              type: 'select',
              label: 'Extracted Materials',
              hasMany: true,
              options: [
                {
                  label: 'Coal',
                  value: 'coal',
                },
                {
                  label: 'Iron',
                  value: 'iron',
                },
                {
                  label: 'Bauxite',
                  value: 'bauxite',
                },
                {
                  label: 'Copper',
                  value: 'copper',
                },
                {
                  label: 'Gold',
                  value: 'gold',
                },
                {
                  label: 'Lithium',
                  value: 'lithium',
                },
                {
                  label: 'Nickel',
                  value: 'nickel',
                },
                {
                  label: 'Phosphorite',
                  value: 'phosphorite',
                },
                {
                  label: 'Silver',
                  value: 'silver',
                },
                {
                  label: 'Zinc',
                  value: 'zinc',
                },
              ],
            },
          ],
        },
        // topography
        {
          label: 'Topography',
          description: 'Enter all surface data here.',
          fields: [
            {
              name: 'surface',
              type: 'group',
              label: 'Surface Area',
              fields: [
                {
                  name: 'total',
                  type: 'number',
                  label: 'Total Size (in ha)',
                },
                {
                  name: 'lake',
                  type: 'number',
                  label: 'Lake Size (in ha)',
                },
                {
                  name: 'forest',
                  type: 'number',
                  label: 'Forest Size (in ha)',
                },
                {
                  name: 'agriculture',
                  type: 'number',
                  label: 'Agriculture Size (in ha)',
                },
                {
                  name: 'settlement',
                  type: 'number',
                  label: 'Settlement Size (in ha)',
                },
              ],
            },
          ],
        },
        // recreational usage
        {
          label: 'Recreational Usage',
          description: 'Enter all recreational usage data here.',
          fields: [
            {
              name: 'features',
              type: 'relationship',
              relationTo: 'mine-features',
              hasMany: true,
              label: 'Post-Mining Features',
              admin: {
                description: 'What is this site used for now?',
              },
            },
          ],
        },
      ],
    },
  ],
}
