import type { CollectionConfig } from 'payload'
import { lexicalEditor, FixedToolbarFeature } from '@payloadcms/richtext-lexical'

export const Employees: CollectionConfig = {
  slug: 'employee',
  admin: {
    useAsTitle: 'fullName',
    defaultColumns: ['fullName', 'birthday', 'office', 'email'],
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        // general
        {
          label: 'General',
          fields: [
            {
              name: 'firstName',
              type: 'text',
              required: true,
            },
            {
              name: 'lastName',
              type: 'text',
              required: true,
            },
            {
              name: 'fullName',
              type: 'text',
              admin: {
                hidden: true,
              },
              hooks: {
                beforeChange: [
                  ({ data, siblingData }) => {
                    const first = siblingData?.firstName || ''
                    const last = siblingData?.lastName || ''

                    return `${first} ${last}`.trim()
                  },
                ],
              },
            },
            {
              name: 'birthday',
              type: 'date',
              admin: {
                date: {
                  pickerAppearance: 'dayOnly',
                  displayFormat: 'dd.MM.yyyy',
                },
              },
            },
            {
              name: 'office',
              type: 'relationship',
              relationTo: 'officeLocation',
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
        // education
        {
          label: 'Education',
          fields: [
            {
              name: 'higherEducation',
              label: 'Highest Education',
              type: 'group',
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'type',
                      type: 'select',
                      options: [
                        { value: 'bachelor', label: 'Bachelor' },
                        { value: 'master', label: 'Master' },
                        { value: 'diplom', label: 'Diplom' },
                        { value: 'doctor', label: 'Doctor' },
                        { value: 'professor', label: 'Professor' },
                        { value: 'vocationalTraining', label: 'Vocational Training' },
                        { value: 'other', label: 'Other' },
                      ],
                      admin: {
                        width: '20%',
                      },
                    },
                    {
                      name: 'subType',
                      type: 'select',
                      options: [
                        { value: 'art', label: 'of Arts' },
                        { value: 'sci', label: 'of Science' },
                        { value: 'eng', label: 'of Engineering' },
                        { value: 'ing', label: 'Ingenieur' },
                      ],
                      admin: {
                        width: '20%',
                        condition: (data, siblingData) =>
                          ['bachelor', 'master', 'diplom'].includes(siblingData?.type),
                      },
                    },
                    {
                      name: 'name',
                      type: 'text',
                    },
                    {
                      name: 'location',
                      type: 'text',
                      admin: {
                        placeholder: 'e.g. TU Dresden',
                      },
                    },
                  ],
                },
              ],
            },
            // TODO add Specialises in (Fachgruppen?)
            // TODO add certificates
            // TODO add chamber membership
          ],
        },
        // contact
        {
          label: 'Contact',
          fields: [
            {
              name: 'email',
              type: 'email',
              label: 'Company Email',
            },
            {
              name: 'phone',
              type: 'text',
              label: 'Company Phone',
              admin: {
                placeholder: '+49 170 1234567',
                description:
                  'Please enter in international format starting with your country code.',
              },
            },
            {
              name: 'mobilePhone',
              type: 'text',
              label: 'Mobile Phone',
              admin: {
                placeholder: '+49 170 1234567',
                description:
                  'Please enter in international format starting with your country code.',
              },
            },
          ],
        },
      ],
    },
  ],
}
