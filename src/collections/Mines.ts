import type { CollectionConfig } from 'payload'
import { publishedOrAuthenticated } from '@/access/publishedOrAuthenticated'
import { countryField } from '@/fields/country'
import { legacyIdField } from '@/fields/legacyId'
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
    defaultColumns: ['title', 'code', 'country', 'operatingStatus', '_status'],
  },
  access: { read: publishedOrAuthenticated },
  versions: { drafts: true },
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
              type: 'row',
              fields: [
                {
                  // A proper noun, the same in every language.
                  name: 'title',
                  label: { en: 'Name', de: 'Name' },
                  type: 'text',
                  required: true,
                  admin: { width: '70%' },
                },
                {
                  name: 'code',
                  label: { en: 'Code', de: 'Kürzel' },
                  type: 'text',
                  unique: true,
                  index: true,
                  admin: { width: '30%', placeholder: { en: 'e.g. PL01', de: 'z. B. PL01' } },
                },
              ],
            },
            {
              name: 'parentMine',
              label: { en: 'Part of', de: 'Teil von' },
              type: 'relationship',
              relationTo: 'mines',
              filterOptions: ({ id }) => (id ? { id: { not_equals: id } } : true),
              admin: {
                description: {
                  en: 'The main site this one belongs to, e.g. the open-pit mine of an external dump.',
                  de: 'Der Hauptstandort, zu dem dieser gehört, z. B. der Tagebau einer Außenhalde.',
                },
              },
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
            {
              type: 'row',
              fields: [
                countryField({ admin: { width: '34%' } }),
                {
                  name: 'region',
                  label: { en: 'Region', de: 'Region' },
                  type: 'text',
                  localized: true,
                  admin: { width: '33%' },
                },
                {
                  name: 'district',
                  label: { en: 'District', de: 'Bezirk' },
                  type: 'text',
                  localized: true,
                  admin: { width: '33%' },
                },
              ],
            },
            {
              name: 'nearestCity',
              label: { en: 'Nearest city', de: 'Nächste Stadt' },
              type: 'group',
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'name',
                      label: { en: 'Name', de: 'Name' },
                      type: 'text',
                      localized: true,
                      admin: { width: '40%' },
                    },
                    {
                      name: 'population',
                      label: { en: 'Population', de: 'Einwohnerzahl' },
                      type: 'number',
                      min: 0,
                      admin: { width: '30%' },
                    },
                    {
                      name: 'distanceKm',
                      label: { en: 'Distance (km)', de: 'Entfernung (km)' },
                      type: 'number',
                      min: 0,
                      admin: { width: '30%' },
                    },
                  ],
                },
              ],
            },
            {
              name: 'website',
              label: { en: 'Website', de: 'Website' },
              type: 'text',
              admin: { placeholder: 'https://…' },
            },
            ...richTextField('content', { en: 'Content', de: 'Inhalt' }),
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
              // Not `status`: its database enum would clash with the one of the drafts' `_status`.
              name: 'operatingStatus',
              label: { en: 'Operating status', de: 'Betriebsstatus' },
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
              label: {
                en: 'Year of closure (planned, if in use)',
                de: 'Jahr der Stilllegung (geplant, wenn in Betrieb)',
              },
              type: 'number',
              admin: {
                placeholder: { en: 'e.g. 1984', de: 'z. B. 1984' },
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
                { label: { en: 'Lignite', de: 'Braunkohle' }, value: 'lignite' },
                { label: { en: 'Hard coal', de: 'Steinkohle' }, value: 'coal' },
                { label: { en: 'Iron', de: 'Eisen' }, value: 'iron' },
                { label: { en: 'Bauxite', de: 'Bauxit' }, value: 'bauxite' },
                { label: { en: 'Boron', de: 'Bor' }, value: 'boron' },
                { label: { en: 'Chromium', de: 'Chrom' }, value: 'chromium' },
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
              name: 'morphology',
              label: { en: 'Morphology', de: 'Morphologie' },
              type: 'select',
              options: [
                { label: { en: 'Lake', de: 'See' }, value: 'lake' },
                { label: { en: 'Dump', de: 'Halde' }, value: 'dump' },
                { label: { en: 'Backfilled', de: 'Verfüllt' }, value: 'backfilled' },
              ],
            },
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
              type: 'row',
              fields: [
                {
                  name: 'followUpUse',
                  label: { en: 'Follow-up use', de: 'Folgenutzung' },
                  type: 'select',
                  options: [
                    { label: { en: 'Recreation', de: 'Erholung' }, value: 'recreation' },
                    { label: { en: 'Production', de: 'Produktion' }, value: 'production' },
                    { label: { en: 'Ecology', de: 'Ökologie' }, value: 'ecology' },
                  ],
                  admin: { width: '50%' },
                },
                {
                  name: 'mainUse',
                  label: { en: 'Main use', de: 'Hauptnutzung' },
                  type: 'text',
                  localized: true,
                  admin: { width: '50%', placeholder: { en: 'e.g. Water sports', de: 'z. B. Wassersport' } },
                },
              ],
            },
            {
              name: 'activityScale',
              label: { en: 'Visitor activity (0–5)', de: 'Besucheraufkommen (0–5)' },
              type: 'number',
              min: 0,
              max: 5,
              admin: {
                step: 1,
                description: {
                  en: '0 = hardly visited, 5 = very busy.',
                  de: '0 = kaum besucht, 5 = sehr stark besucht.',
                },
              },
            },
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
    legacyIdField,
  ],
}
