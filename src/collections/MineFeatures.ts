import type { CollectionConfig } from 'payload'
import { GROUPS } from '@/i18n/groups'

export const MineFeatures: CollectionConfig = {
  slug: 'mine-features',
  labels: {
    singular: { en: 'Mine feature', de: 'Nachnutzung' },
    plural: { en: 'Mine features', de: 'Nachnutzungen' },
  },
  admin: {
    useAsTitle: 'name',
    group: GROUPS.minescapes,
    // Hidden until the Minescapes section goes live.
    hidden: true,
    defaultColumns: ['name', 'iconName', 'color'],
  },
  fields: [
    {
      name: 'name',
      label: { en: 'Name', de: 'Name' },
      type: 'text',
      localized: true,
      required: true,
    },
    {
      name: 'iconName',
      label: { en: 'Icon file', de: 'Icon-Datei' },
      type: 'text',
      admin: {
        description: {
          en: 'File name of the icon, e.g. fishing.svg.',
          de: 'Dateiname des Icons, z. B. fishing.svg.',
        },
      },
    },
    {
      name: 'color',
      label: { en: 'Color', de: 'Farbe' },
      type: 'select',
      options: [
        { label: { en: 'Blue (water)', de: 'Blau (Wasser)' }, value: 'blue' },
        { label: { en: 'Green (recreation)', de: 'Grün (Freizeit)' }, value: 'green' },
        { label: { en: 'Grey (infrastructure)', de: 'Grau (Infrastruktur)' }, value: 'grey' },
      ],
    },
  ],
}
