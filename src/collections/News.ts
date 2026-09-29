import type { CollectionConfig } from 'payload'
import { lexicalEditor, FixedToolbarFeature } from '@payloadcms/richtext-lexical'
import { flowField } from '@/fields/flow'

export const News: CollectionConfig = {
  slug: 'news',
  admin: {
    useAsTitle: 'name',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      localized: true,
    },
    {
      name: 'thumbnail',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'content',
      type: 'richText',
      localized: true,
      editor: lexicalEditor({
        features: ({ defaultFeatures }) => [...defaultFeatures, FixedToolbarFeature()],
      }),
    },
    {
      name: 'externalLinks',
      label: 'Links',
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
                placeholder: 'Competition Line',
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
    {
      name: 'project',
      type: 'relationship',
      relationTo: 'project',
      admin: {
        description: 'Legacy acf.interner_link (WP post ID into the projekt CPT).',
      },
    },
    flowField('No legacy source — net-new capability, not backed by any existing column.'),
  ],
}
