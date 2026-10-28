import type { CollectionConfig } from 'payload'
import { publishedOrAuthenticated } from '@/access/publishedOrAuthenticated'
import { legacyIdField } from '@/fields/legacyId'
import { GROUPS } from '@/i18n/groups'
import { websitePreview } from '@/websitePreview'

// Public team profile.
export const Employees: CollectionConfig = {
  slug: 'employees',
  labels: {
    singular: { en: 'Employee', de: 'Mitarbeitende' },
    plural: { en: 'Employees', de: 'Mitarbeitende' },
  },
  defaultSort: 'lastName',
  admin: {
    preview: websitePreview('employees'),
    useAsTitle: 'fullName',
    group: GROUPS.office,
    defaultColumns: ['fullName', 'office', 'email', '_status'],
  },
  access: { read: publishedOrAuthenticated },
  versions: { drafts: true },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'firstName',
          label: { en: 'First name', de: 'Vorname' },
          type: 'text',
          required: true,
          admin: { width: '40%' },
        },
        {
          name: 'lastName',
          label: { en: 'Last name', de: 'Nachname' },
          type: 'text',
          required: true,
          admin: { width: '40%' },
        },
        {
          name: 'chineseName',
          label: { en: 'Chinese name', de: 'Chinesischer Name' },
          type: 'text',
          admin: {
            width: '20%',
            placeholder: '吴婧',
            description: {
              en: 'Written in full, surname first. The Chinese website shows it instead of first and last name.',
              de: 'Vollständig, Familienname zuerst. Die chinesische Website zeigt ihn statt Vor- und Nachname.',
            },
          },
        },
      ],
    },
    {
      name: 'portrait',
      label: { en: 'Portrait', de: 'Porträt' },
      type: 'upload',
      relationTo: 'media',
    },
    {
      type: 'row',
      fields: [
        {
          name: 'academicTitle',
          label: { en: 'Academic title', de: 'Akademischer Titel' },
          type: 'text',
          admin: { width: '50%', placeholder: 'Dipl.-Ing.' },
        },
        {
          name: 'university',
          label: { en: 'University', de: 'Hochschule' },
          type: 'text',
          localized: true,
          admin: { width: '50%' },
        },
      ],
    },
    {
      name: 'fullName',
      label: { en: 'Name', de: 'Name' },
      type: 'text',
      admin: { hidden: true },
      hooks: {
        beforeChange: [
          ({ siblingData }) =>
            `${siblingData?.firstName ?? ''} ${siblingData?.lastName ?? ''}`.trim(),
        ],
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'office',
          label: { en: 'Office', de: 'Büro' },
          type: 'relationship',
          relationTo: 'offices',
          admin: { width: '50%' },
        },
        {
          name: 'joinedYear',
          label: { en: 'Year joined', de: 'Eintrittsjahr' },
          type: 'number',
          admin: {
            width: '50%',
            description: {
              en: 'Year the person joined the office.',
              de: 'Jahr, in dem die Person ins Büro kam.',
            },
          },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'email',
          label: { en: 'Email', de: 'E-Mail' },
          type: 'email',
          admin: { width: '50%' },
        },
        {
          name: 'phone',
          label: { en: 'Phone', de: 'Telefon' },
          type: 'text',
          admin: { width: '50%', placeholder: '+49 351 1234567' },
        },
      ],
    },
    {
      name: 'profession',
      label: { en: 'Profession', de: 'Beruf' },
      type: 'text',
      localized: true,
      admin: {
        description: {
          en: 'Degree and field, e.g. "M.Sc. Landscape Architecture".',
          de: 'Abschluss und Fachrichtung, z. B. „M.Sc. Landschaftsarchitektur“.',
        },
      },
    },
    {
      name: 'chamberMembership',
      label: { en: 'Chamber membership', de: 'Kammermitgliedschaft' },
      type: 'text',
      localized: true,
      admin: {
        description: {
          en: 'Membership in a chamber of architects.',
          de: 'Mitgliedschaft in einer Architektenkammer.',
        },
      },
    },
    {
      name: 'qualification',
      label: { en: 'Qualification', de: 'Qualifikation' },
      type: 'text',
      localized: true,
    },
    legacyIdField,
  ],
}
