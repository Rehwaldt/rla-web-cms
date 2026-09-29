import type { CollectionConfig } from 'payload'
import { anyone } from '@/access/publishedOrAuthenticated'
import { countryField } from '@/fields/country'
import { legacyIdField } from '@/fields/legacyId'
import { richTextField } from '@/fields/richText'

// Office locations. Drag-and-drop order in the list view is the order on the website.
export const Offices: CollectionConfig = {
  slug: 'offices',
  orderable: true,
  admin: {
    useAsTitle: 'name',
    group: 'Office',
    defaultColumns: ['name', 'address.city'],
  },
  access: { read: anyone },
  fields: [
    { name: 'name', type: 'text', localized: true, required: true },
    { name: 'image', type: 'upload', relationTo: 'media' },
    richTextField('description'),
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Address',
          fields: [
            {
              name: 'address',
              type: 'group',
              fields: [
                { name: 'company', type: 'text', localized: true, admin: { description: 'Name on the letterbox.' } },
                { name: 'street', type: 'text' },
                {
                  type: 'row',
                  fields: [
                    { name: 'postalCode', type: 'text', admin: { width: '30%' } },
                    { name: 'city', type: 'text', localized: true, admin: { width: '40%' } },
                    countryField({ admin: { width: '30%' } }),
                  ],
                },
                {
                  name: 'coordinates',
                  type: 'point',
                  admin: { components: { Field: '@/components/cms/MapFieldLoader' } },
                },
              ],
            },
          ],
        },
        {
          label: 'Contact',
          fields: [
            {
              name: 'contact',
              type: 'group',
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'phone', type: 'text', admin: { width: '50%', placeholder: '+49 351 1234567' } },
                    { name: 'fax', type: 'text', admin: { width: '50%' } },
                  ],
                },
                { name: 'email', type: 'email' },
              ],
            },
            richTextField('contactNote', {
              admin: { description: 'Extra contact details for one language, e.g. a local contact person.' },
            }),
          ],
        },
      ],
    },
    legacyIdField,
  ],
}
