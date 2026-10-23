import type { ArrayFieldValidation, CollectionConfig, TextFieldSingleValidation } from 'payload'
import { publishedOrAuthenticated } from '@/access/publishedOrAuthenticated'
import { linksField } from '@/fields/links'
import { richTextField } from '@/fields/richText'
import { requiredInDefaultLocale } from '@/fields/validation'
import { GROUPS } from '@/i18n/groups'
import { websitePreview } from '@/websitePreview'

type Translate = (key: string, options?: Record<string, unknown>) => string

const validSlug: TextFieldSingleValidation = (value, { req }) =>
  !value || /^[a-z0-9]+(-[a-z0-9]+)*$/.test(value) || (req.t as Translate)('excursions:invalidSlug')

const validTime: TextFieldSingleValidation = (value, { req }) =>
  !value || /^([01]\d|2[0-3]):[0-5]\d$/.test(value) || (req.t as Translate)('excursions:invalidTime')

const uniqueDates: ArrayFieldValidation = (_value, { data, req }) => {
  // In the admin the array's value is only its row count; the rows are in the document data.
  const days = (data as { days?: { date?: string | null }[] } | undefined)?.days ?? []
  const dates = days.flatMap((day) => (day.date ? [day.date.slice(0, 10)] : []))
  const duplicate = dates.find((date, index) => dates.indexOf(date) !== index)
  return !duplicate || (req.t as Translate)('excursions:duplicateDate', { date: duplicate })
}

export const Excursions: CollectionConfig = {
  slug: 'excursions',
  labels: {
    singular: { en: 'Excursion', de: 'Exkursion' },
    plural: { en: 'Excursions', de: 'Exkursionen' },
  },
  admin: {
    preview: websitePreview('excursions'),
    useAsTitle: 'title',
    group: GROUPS.content,
    defaultColumns: ['title', 'slug', '_status'],
  },
  access: { read: publishedOrAuthenticated },
  versions: { drafts: true },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'title',
          label: { en: 'Title', de: 'Titel' },
          type: 'text',
          localized: true,
          validate: requiredInDefaultLocale,
          admin: { width: '70%' },
        },
        {
          name: 'slug',
          label: { en: 'URL name', de: 'URL-Name' },
          type: 'text',
          required: true,
          unique: true,
          index: true,
          validate: validSlug,
          admin: {
            width: '30%',
            placeholder: { en: 'e.g. berlin-2026', de: 'z. B. berlin-2026' },
            description: {
              en: 'Part of the website address. Lower case, digits and hyphens.',
              de: 'Teil der Adresse auf der Website. Kleinbuchstaben, Ziffern und Bindestriche.',
            },
          },
        },
      ],
    },
    {
      name: 'days',
      label: { en: 'Days', de: 'Tage' },
      labels: { singular: { en: 'Day', de: 'Tag' }, plural: { en: 'Days', de: 'Tage' } },
      type: 'array',
      validate: uniqueDates,
      admin: {
        description: {
          en: 'In the order the website shows them. A day without a date is not scheduled yet; the website leaves it out.',
          de: 'In der Reihenfolge, in der die Website sie zeigt. Ein Tag ohne Datum ist noch nicht eingeplant; die Website lässt ihn weg.',
        },
        components: { RowLabel: '@/components/cms/ExcursionRowLabels#DayRowLabel' },
      },
      fields: [
        {
          name: 'date',
          label: { en: 'Date', de: 'Datum' },
          type: 'date',
          admin: { date: { pickerAppearance: 'dayOnly', displayFormat: 'dd.MM.yyyy' } },
        },
        {
          name: 'stops',
          label: { en: 'Stops', de: 'Stationen' },
          labels: { singular: { en: 'Stop', de: 'Station' }, plural: { en: 'Stops', de: 'Stationen' } },
          type: 'array',
          admin: {
            description: {
              en: 'In running order. To move a stop to another day: copy its row, add a row on that day and paste onto it, then delete the original.',
              de: 'In der Reihenfolge des Ablaufs. Station an einen anderen Tag verschieben: Zeile kopieren, am anderen Tag eine Zeile hinzufügen und darauf einfügen, dann das Original löschen.',
            },
            components: { RowLabel: '@/components/cms/ExcursionRowLabels#StopRowLabel' },
          },
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'title',
                  label: { en: 'Title', de: 'Titel' },
                  type: 'text',
                  localized: true,
                  validate: requiredInDefaultLocale,
                  admin: { width: '60%' },
                },
                {
                  name: 'type',
                  label: { en: 'Type', de: 'Art' },
                  type: 'select',
                  required: true,
                  defaultValue: 'default',
                  options: [
                    { label: { en: 'Stop', de: 'Station' }, value: 'default' },
                    { label: { en: 'Optional stop', de: 'Optionale Station' }, value: 'optional' },
                    { label: { en: 'Break', de: 'Pause' }, value: 'break' },
                    { label: { en: 'Meeting point', de: 'Treffpunkt' }, value: 'meetUp' },
                    { label: { en: 'Meal', de: 'Essen' }, value: 'food' },
                  ],
                  admin: {
                    width: '25%',
                    description: {
                      en: 'Only stops are numbered; breaks, meeting points and meals get an icon.',
                      de: 'Nur Stationen werden nummeriert; Pausen, Treffpunkte und Essen bekommen ein Symbol.',
                    },
                  },
                },
                {
                  name: 'time',
                  label: { en: 'Time', de: 'Uhrzeit' },
                  type: 'text',
                  validate: validTime,
                  admin: { width: '15%', placeholder: 'HH:mm' },
                },
              ],
            },
            {
              name: 'location',
              label: { en: 'Location', de: 'Ort' },
              type: 'point',
              admin: {
                description: {
                  en: 'Where the stop sits on the map. Without one it only appears in the timeline.',
                  de: 'Wo die Station auf der Karte liegt. Ohne Ort erscheint sie nur im Ablauf.',
                },
                components: { Field: '@/components/cms/MapFieldLoader' },
              },
            },
            ...richTextField('description', { en: 'Description', de: 'Beschreibung' }),
            {
              type: 'row',
              fields: [
                {
                  // Names only, the same in every language.
                  name: 'guidedBy',
                  label: { en: 'Guided by', de: 'Führung' },
                  type: 'text',
                  admin: { width: '35%', placeholder: { en: 'e.g. Till, Sebastian', de: 'z. B. Till, Sebastian' } },
                },
                {
                  name: 'designedBy',
                  label: { en: 'Designed by', de: 'Planung' },
                  type: 'text',
                  localized: true,
                  admin: { width: '45%', placeholder: { en: 'e.g. RLA', de: 'z. B. RLA' } },
                },
                {
                  name: 'completionYear',
                  label: { en: 'Completion year', de: 'Fertigstellungsjahr' },
                  type: 'number',
                  min: 1800,
                  max: 2200,
                  admin: { width: '20%' },
                },
              ],
            },
            linksField,
            {
              name: 'images',
              label: { en: 'Images', de: 'Bilder' },
              type: 'upload',
              relationTo: 'media',
              hasMany: true,
              admin: {
                description: {
                  en: 'The first image is the main one. Fill in the credit of each image.',
                  de: 'Das erste Bild ist das Hauptbild. Bei jedem Bild das Copyright eintragen.',
                },
              },
            },
          ],
        },
      ],
    },
  ],
}
