import type { CollectionConfig } from 'payload'
import { publishedOrAuthenticated } from '@/access/publishedOrAuthenticated'
import { legacyIdField } from '@/fields/legacyId'

// Public team profile. Names are localized because some people have a Chinese spelling of
// their name; other languages fall back to the German entry.
export const Employees: CollectionConfig = {
  slug: 'employees',
  defaultSort: 'lastName',
  admin: {
    useAsTitle: 'fullName',
    group: 'Office',
    defaultColumns: ['fullName', 'office', 'email', '_status'],
  },
  access: { read: publishedOrAuthenticated },
  versions: { drafts: true },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'academicTitle',
          type: 'text',
          admin: { width: '20%', placeholder: 'Dipl.-Ing.' },
        },
        { name: 'firstName', type: 'text', localized: true, required: true, admin: { width: '40%' } },
        { name: 'lastName', type: 'text', localized: true, required: true, admin: { width: '40%' } },
      ],
    },
    {
      name: 'fullName',
      type: 'text',
      localized: true,
      admin: { hidden: true },
      hooks: {
        beforeChange: [
          ({ siblingData }) => `${siblingData?.firstName ?? ''} ${siblingData?.lastName ?? ''}`.trim(),
        ],
      },
    },
    {
      type: 'row',
      fields: [
        { name: 'office', type: 'relationship', relationTo: 'offices', admin: { width: '50%' } },
        {
          name: 'joinedYear',
          type: 'number',
          admin: { width: '50%', description: 'Year the person joined the office.' },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'email', type: 'email', admin: { width: '50%' } },
        {
          name: 'phone',
          type: 'text',
          admin: { width: '50%', placeholder: '+49 351 1234567' },
        },
      ],
    },
    { name: 'portrait', type: 'upload', relationTo: 'media' },
    {
      name: 'profession',
      type: 'text',
      localized: true,
      admin: { description: 'Degree and field, e.g. "M.Sc. Landscape Architecture".' },
    },
    { name: 'university', type: 'text', localized: true },
    {
      name: 'chamberMembership',
      type: 'text',
      localized: true,
      admin: { description: 'Membership in a chamber of architects.' },
    },
    { name: 'qualification', type: 'text', localized: true },
    legacyIdField,
  ],
}
