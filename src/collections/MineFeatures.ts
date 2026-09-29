import type { CollectionConfig } from 'payload'

export const MineFeatures: CollectionConfig = {
  slug: 'mine-features',
  admin: {
    useAsTitle: 'name',
    group: 'Minescapes',
    defaultColumns: ['name', 'iconName', 'color'],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      localized: true,
      required: true,
    },
    {
      name: 'iconName',
      type: 'text',
      label: 'Icon File Name (e.g., fishing.svg)',
    },
    {
      name: 'color',
      type: 'select',
      options: [
        { label: 'Blue (Water)', value: 'blue' },
        { label: 'Green (Recreation)', value: 'green' },
        { label: 'Grey (Infrastructure)', value: 'grey' },
      ],
    },
  ],
}
