import type { CollectionConfig } from 'payload'
import { publishedOrAuthenticated } from '@/access/publishedOrAuthenticated'
import { countryField } from '@/fields/country'
import { flowField } from '@/fields/flow'
import { legacyIdField } from '@/fields/legacyId'
import { linksField } from '@/fields/links'
import { richTextField } from '@/fields/richText'
import { childrenOnly } from '@/fields/validation'
import { visibleInField } from '@/fields/visibleIn'
import { GROUPS } from '@/i18n/groups'

export const Projects: CollectionConfig = {
  slug: 'projects',
  labels: {
    singular: { en: 'Project', de: 'Projekt' },
    plural: { en: 'Projects', de: 'Projekte' },
  },
  admin: {
    useAsTitle: 'name',
    group: GROUPS.projects,
    defaultColumns: ['name', 'code', 'type', 'completionYear', '_status'],
    listSearchableFields: ['name', 'code'],
  },
  access: { read: publishedOrAuthenticated },
  versions: { drafts: true },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'name',
          label: { en: 'Name', de: 'Name' },
          type: 'text',
          localized: true,
          admin: { width: '70%' },
        },
        {
          name: 'code',
          label: { en: 'Project code', de: 'Projektkürzel' },
          type: 'text',
          unique: true,
          index: true,
          admin: {
            width: '30%',
            description: {
              en: 'Short code shared across RLA systems and used in website URLs.',
              de: 'Wird von allen RLA-Systemen gemeinsam genutzt und steht in den URLs der Website.',
            },
          },
        },
      ],
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: { en: 'Overview', de: 'Übersicht' },
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'type',
                  label: { en: 'Project type', de: 'Projektart' },
                  type: 'select',
                  options: [
                    { label: { en: 'Competition', de: 'Wettbewerb' }, value: 'competition' },
                    { label: { en: 'Object planning', de: 'Objektplanung' }, value: 'object' },
                    { label: { en: 'Concept', de: 'Konzept' }, value: 'concept' },
                  ],
                  admin: { width: '34%' },
                },
                {
                  name: 'ongoing',
                  label: { en: 'Ongoing', de: 'Laufend' },
                  type: 'checkbox',
                  admin: {
                    width: '33%',
                    description: {
                      en: 'Still in planning or under construction.',
                      de: 'Noch in Planung oder im Bau.',
                    },
                  },
                },
                {
                  name: 'completionYear',
                  label: { en: 'Completion year', de: 'Fertigstellungsjahr' },
                  type: 'number',
                  min: 1950,
                  max: 2200,
                  admin: {
                    width: '33%',
                    description: {
                      en: 'The planned year while the project is ongoing.',
                      de: 'Bei laufenden Projekten das geplante Jahr.',
                    },
                  },
                },
              ],
            },
            { name: 'motto', label: { en: 'Motto', de: 'Motto' }, type: 'text', localized: true },
            {
              name: 'summary',
              label: { en: 'Summary', de: 'Kurzbeschreibung' },
              type: 'text',
              localized: true,
              admin: {
                description: {
                  en: 'Short teaser shown in listings.',
                  de: 'Kurzer Text für Übersichtslisten.',
                },
              },
            },
            richTextField('description', { en: 'Description', de: 'Beschreibung' }),
            {
              name: 'categories',
              label: { en: 'Categories', de: 'Kategorien' },
              type: 'relationship',
              relationTo: 'project-categories',
              hasMany: true,
              validate: childrenOnly('project-categories'),
              admin: { components: { Field: '@/components/cms/CategoryPicker#CategoryPicker' } },
            },
            {
              name: 'similarProjects',
              label: { en: 'Similar projects', de: 'Ähnliche Projekte' },
              type: 'relationship',
              relationTo: 'projects',
              hasMany: true,
              filterOptions: ({ id }) => ({ id: { not_equals: id } }),
              admin: {
                description: {
                  en: 'Similarity is symmetric: projects listing this one appear under "Listed as similar by".',
                  de: 'Ähnlichkeit gilt in beide Richtungen: Projekte, die dieses hier aufführen, erscheinen unter „Als ähnlich verknüpft von“.',
                },
              },
            },
            {
              name: 'listedAsSimilarBy',
              label: { en: 'Listed as similar by', de: 'Als ähnlich verknüpft von' },
              type: 'join',
              collection: 'projects',
              on: 'similarProjects',
            },
          ],
        },
        {
          label: { en: 'Facts', de: 'Projektdaten' },
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'place',
                  label: { en: 'Place', de: 'Ort' },
                  type: 'text',
                  localized: true,
                  admin: {
                    width: '40%',
                    description: {
                      en: 'Display location, usually the city.',
                      de: 'Angezeigter Ort, meist die Stadt.',
                    },
                  },
                },
                {
                  name: 'region',
                  label: { en: 'Region', de: 'Region' },
                  type: 'text',
                  localized: true,
                  admin: {
                    width: '30%',
                    description: {
                      en: 'Optional state or province, shown instead of the country.',
                      de: 'Optionales Bundesland oder optionale Provinz, wird statt des Landes angezeigt.',
                    },
                  },
                },
                countryField({ admin: { width: '30%' } }),
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'client',
                  label: { en: 'Client', de: 'Auftraggeber' },
                  type: 'text',
                  localized: true,
                  admin: { width: '50%' },
                },
                {
                  name: 'architect',
                  label: { en: 'Architect', de: 'Architektur' },
                  type: 'text',
                  localized: true,
                  admin: { width: '50%' },
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'planningPartners',
                  label: { en: 'Planning partners', de: 'Planungspartner' },
                  type: 'text',
                  localized: true,
                  admin: { width: '70%' },
                },
                {
                  name: 'area',
                  label: { en: 'Area', de: 'Fläche' },
                  type: 'number',
                  min: 0,
                  admin: { width: '30%', description: { en: 'In hectares.', de: 'In Hektar.' } },
                },
              ],
            },
            {
              name: 'additionalInfo',
              label: { en: 'Additional info', de: 'Weitere Angaben' },
              type: 'text',
              localized: true,
              admin: {
                description: {
                  en: 'Free-form extra fact, e.g. image credits.',
                  de: 'Freie Zusatzangabe, z. B. das Copyright der Bilder.',
                },
              },
            },
            {
              name: 'competition',
              label: { en: 'Competition', de: 'Wettbewerb' },
              type: 'group',
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'year',
                      label: { en: 'Year', de: 'Jahr' },
                      type: 'number',
                      admin: { width: '34%' },
                    },
                    {
                      name: 'prize',
                      label: { en: 'Prize', de: 'Preis' },
                      type: 'number',
                      min: 1,
                      admin: {
                        width: '33%',
                        description: {
                          en: 'Prize rank, e.g. 1 for first prize.',
                          de: 'Platzierung, z. B. 1 für den 1. Preis.',
                        },
                      },
                    },
                    {
                      name: 'purchased',
                      label: { en: 'Purchased', de: 'Ankauf' },
                      type: 'checkbox',
                      admin: {
                        width: '33%',
                        description: {
                          en: 'The entry was purchased by the jury.',
                          de: 'Die Arbeit wurde von der Jury angekauft.',
                        },
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: { en: 'Media', de: 'Medien' },
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'heroImage',
                  label: { en: 'Hero image', de: 'Titelbild' },
                  type: 'upload',
                  relationTo: 'media',
                  admin: {
                    width: '50%',
                    description: {
                      en: 'Large image at the top of the project page.',
                      de: 'Großes Bild oben auf der Projektseite.',
                    },
                  },
                },
                {
                  name: 'previewImage',
                  label: { en: 'Preview image', de: 'Vorschaubild' },
                  type: 'upload',
                  relationTo: 'media',
                  admin: {
                    width: '50%',
                    description: {
                      en: 'Tile image in listings and galleries.',
                      de: 'Kachelbild in Listen und Galerien.',
                    },
                  },
                },
              ],
            },
            {
              name: 'darkControls',
              label: { en: 'Dark controls', de: 'Dunkle Buttons' },
              type: 'checkbox',
              admin: {
                description: {
                  en: 'Draw the page controls in dark colors, for light hero images.',
                  de: 'Buttons der Seite dunkel darstellen, für helle Titelbilder.',
                },
              },
            },
            flowField({ captions: false }),
          ],
        },
        {
          label: { en: 'Links', de: 'Links' },
          fields: [linksField],
        },
      ],
    },
    visibleInField,
    legacyIdField,
  ],
}
