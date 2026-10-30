import type { CollectionConfig } from 'payload'
import { publishedOrAuthenticated } from '@/access/publishedOrAuthenticated'
import { authenticated } from '@/access/authenticated'
import { currentEmployees } from '@/collections/employeeListFilter'
import { countryField } from '@/fields/country'
import { legacyIdField } from '@/fields/legacyId'
import { richTextField } from '@/fields/richText'
import { requiredInDefaultLocale } from '@/fields/validation'
import { GROUPS } from '@/i18n/groups'

// Office locations. Drag-and-drop order in the list view is the order on the website.
export const Offices: CollectionConfig = {
  slug: 'offices',
  labels: {
    singular: { en: 'Office', de: 'Büro' },
    plural: { en: 'Offices', de: 'Büros' },
  },
  orderable: true,
  admin: {
    useAsTitle: 'name',
    group: GROUPS.office,
    defaultColumns: ['name', 'address.city', '_status'],
  },
  access: { read: publishedOrAuthenticated },
  versions: { drafts: true },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: { en: 'General', de: 'Allgemein' },
          fields: [
            {
              name: 'name',
              label: { en: 'Name', de: 'Name' },
              type: 'text',
              localized: true,
              validate: requiredInDefaultLocale,
            },
            {
              name: 'leader',
              label: { en: 'Office lead', de: 'Büroleitung' },
              type: 'relationship',
              relationTo: 'employees',
              filterOptions: currentEmployees,
            },
            {
              name: 'image',
              label: { en: 'Image', de: 'Bild' },
              type: 'upload',
              relationTo: 'media',
            },
            ...richTextField('description', { en: 'Description', de: 'Beschreibung' }),
          ],
        },
        {
          label: { en: 'Address', de: 'Adresse' },
          fields: [
            {
              name: 'address',
              label: { en: 'Address', de: 'Adresse' },
              type: 'group',
              fields: [
                {
                  name: 'company',
                  label: { en: 'Company', de: 'Firma' },
                  type: 'text',
                  admin: {
                    description: { en: 'Name on the letterbox.', de: 'Name auf dem Briefkasten.' },
                  },
                },
                { name: 'street', label: { en: 'Street', de: 'Straße' }, type: 'text' },
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'postalCode',
                      label: { en: 'Postal code', de: 'PLZ' },
                      type: 'text',
                      admin: { width: '30%' },
                    },
                    {
                      name: 'city',
                      label: { en: 'City', de: 'Ort' },
                      type: 'text',
                      localized: true,
                      admin: { width: '40%' },
                    },
                    countryField({ admin: { width: '30%' } }),
                  ],
                },
                {
                  name: 'coordinates',
                  label: { en: 'Coordinates', de: 'Koordinaten' },
                  type: 'point',
                  admin: { components: { Field: '@/components/cms/MapFieldLoader' } },
                },
              ],
            },
          ],
        },
        {
          label: { en: 'Contact', de: 'Kontakt' },
          fields: [
            {
              name: 'contact',
              label: { en: 'Contact', de: 'Kontakt' },
              type: 'group',
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'phone',
                      label: { en: 'Phone', de: 'Telefon' },
                      type: 'text',
                      admin: { width: '50%', placeholder: '+49 351 1234567' },
                    },
                    {
                      name: 'fax',
                      label: { en: 'Fax', de: 'Fax' },
                      type: 'text',
                      admin: { width: '50%' },
                    },
                  ],
                },
                {
                  type: 'row',
                  fields: [
                    { name: 'email', label: { en: 'Email', de: 'E-Mail' }, type: 'email' },
                    {
                      name: 'teamEmail',
                      label: { en: 'Team email', de: 'Team-E-Mail' },
                      type: 'email',
                      access: { read: authenticated },
                      admin: { description: { en: 'Not public.', de: 'Nicht öffentlich.' } },
                    },
                  ],
                },
              ],
            },
            ...richTextField(
              'contactNote',
              { en: 'Contact note', de: 'Kontakthinweis' },
              {
                admin: {
                  description: {
                    en: 'Extra contact details for one language, e.g. a local contact person.',
                    de: 'Zusätzliche Kontaktangaben für eine Sprache, z. B. eine Ansprechperson vor Ort.',
                  },
                },
              },
            ),
          ],
        },
      ],
    },
    legacyIdField,
  ],
}
