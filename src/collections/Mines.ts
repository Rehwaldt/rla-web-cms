import type { CollectionConfig } from 'payload'
import { richTextField } from '@/fields/richText'
import { GROUPS } from '@/i18n/groups'

export const Mines: CollectionConfig = {
  slug: 'mines',
  labels: {
    singular: { en: 'Mine', de: 'Bergbaustandort' },
    plural: { en: 'Mines', de: 'Bergbaustandorte' },
  },
  admin: {
    useAsTitle: 'title',
    group: GROUPS.minescapes,
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        // general
        {
          label: { en: 'General', de: 'Allgemein' },
          description: {
            en: "The mine's name, location and description.",
            de: 'Name, Lage und Beschreibung des Standorts.',
          },
          fields: [
            {
              name: 'title',
              label: { en: 'Name', de: 'Name' },
              type: 'text',
              localized: true,
              required: true,
            },
            {
              name: 'location',
              label: { en: 'Location', de: 'Lage' },
              type: 'point',
              admin: {
                components: {
                  Field: '@/components/cms/MapFieldLoader',
                },
              },
            },
            richTextField('content', { en: 'Content', de: 'Inhalt' }),
          ],
        },
        // details
        {
          label: { en: 'Details', de: 'Details' },
          description: {
            en: 'Historical and industrial data.',
            de: 'Historische und industrielle Daten.',
          },
          fields: [
            {
              name: 'siteType',
              label: { en: 'Site type', de: 'Standorttyp' },
              type: 'select',
              hasMany: true, // Recommended because a site often includes both a pit and a dump
              options: [
                { label: { en: 'Open-cast / open-pit mine', de: 'Tagebau' }, value: 'open_cast' },
                { label: { en: 'External dump / spoil tip', de: 'Außenhalde' }, value: 'external_dump' },
                { label: { en: 'Underground mine', de: 'Tiefbau (unter Tage)' }, value: 'underground' },
                { label: { en: 'Quarry', de: 'Steinbruch' }, value: 'quarry' },
                {
                  label: { en: 'Mountaintop removal', de: 'Bergkuppenabbau' },
                  value: 'mountaintop_removal',
                },
              ],
            },
            {
              name: 'status',
              label: { en: 'Status', de: 'Status' },
              type: 'select',
              options: [
                { label: { en: 'In use', de: 'In Betrieb' }, value: 'in_use' },
                {
                  label: { en: 'In revitalization', de: 'In Rekultivierung' },
                  value: 'in_revitalization',
                },
                { label: { en: 'Revitalized', de: 'Rekultiviert' }, value: 'revitalized' },
              ],
            },
            {
              name: 'closureYear',
              label: { en: 'Year of closure', de: 'Jahr der Stilllegung' },
              type: 'number',
              admin: {
                placeholder: { en: 'e.g. 1984', de: 'z. B. 1984' },
                condition: (data) => data?.status && data?.status !== 'in_use',
              },
              min: 1800,
              max: 2100,
            },
            {
              name: 'extractedMaterials',
              label: { en: 'Extracted materials', de: 'Abgebaute Rohstoffe' },
              type: 'select',
              hasMany: true,
              options: [
                { label: { en: 'Coal', de: 'Kohle' }, value: 'coal' },
                { label: { en: 'Iron', de: 'Eisen' }, value: 'iron' },
                { label: { en: 'Bauxite', de: 'Bauxit' }, value: 'bauxite' },
                { label: { en: 'Copper', de: 'Kupfer' }, value: 'copper' },
                { label: { en: 'Gold', de: 'Gold' }, value: 'gold' },
                { label: { en: 'Lithium', de: 'Lithium' }, value: 'lithium' },
                { label: { en: 'Nickel', de: 'Nickel' }, value: 'nickel' },
                { label: { en: 'Phosphorite', de: 'Phosphorit' }, value: 'phosphorite' },
                { label: { en: 'Silver', de: 'Silber' }, value: 'silver' },
                { label: { en: 'Zinc', de: 'Zink' }, value: 'zinc' },
              ],
            },
          ],
        },
        // topography
        {
          label: { en: 'Topography', de: 'Topografie' },
          description: { en: 'Surface data.', de: 'Flächendaten.' },
          fields: [
            {
              name: 'surface',
              label: { en: 'Surface area', de: 'Flächen' },
              type: 'group',
              fields: [
                {
                  name: 'total',
                  label: { en: 'Total area (ha)', de: 'Gesamtfläche (ha)' },
                  type: 'number',
                },
                {
                  name: 'lake',
                  label: { en: 'Lake area (ha)', de: 'Seefläche (ha)' },
                  type: 'number',
                },
                {
                  name: 'forest',
                  label: { en: 'Forest area (ha)', de: 'Waldfläche (ha)' },
                  type: 'number',
                },
                {
                  name: 'agriculture',
                  label: { en: 'Agricultural area (ha)', de: 'Landwirtschaftsfläche (ha)' },
                  type: 'number',
                },
                {
                  name: 'settlement',
                  label: { en: 'Settlement area (ha)', de: 'Siedlungsfläche (ha)' },
                  type: 'number',
                },
              ],
            },
          ],
        },
        // recreational usage
        {
          label: { en: 'Recreational use', de: 'Freizeitnutzung' },
          description: {
            en: 'How the site is used for recreation.',
            de: 'Wie der Standort für die Freizeit genutzt wird.',
          },
          fields: [
            {
              name: 'features',
              label: { en: 'Post-mining features', de: 'Nachnutzungen' },
              type: 'relationship',
              relationTo: 'mine-features',
              hasMany: true,
              admin: {
                description: {
                  en: 'What is this site used for now?',
                  de: 'Wofür wird der Standort heute genutzt?',
                },
              },
            },
          ],
        },
      ],
    },
  ],
}
