import type { CollectionConfig } from 'payload'
import { authenticated } from '@/access/authenticated'
import { publishedOrAuthenticated } from '@/access/publishedOrAuthenticated'
import { employeeListFilter } from '@/collections/employeeListFilter'
import { intranetIdField } from '@/fields/intranetId'
import { legacyIdField } from '@/fields/legacyId'
import { GROUPS } from '@/i18n/groups'
import { websitePreview } from '@/websitePreview'

// A person who works or worked at the office. Published employees who still work here make up the
// website's team page.
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
    defaultColumns: ['fullName', 'office', 'email', 'active', '_status'],
    baseFilter: employeeListFilter,
    components: {
      beforeListTable: ['@/components/cms/FormerEmployeesToggle#FormerEmployeesToggle'],
    },
  },
  access: { read: publishedOrAuthenticated },
  versions: { drafts: true },
  // The beforeRead hook needs the dates even when a request selects other fields.
  forceSelect: { entryDate: true, exitDate: true },
  hooks: {
    // Runs before field access strips the dates from anonymous reads, so the website still gets
    // what it needs from them. The day pickers store noon UTC, so the UTC date is the picked day.
    beforeRead: [
      ({ doc }) => {
        const today = new Date().toISOString().slice(0, 10)
        doc.entryYear = doc.entryDate ? new Date(doc.entryDate).getUTCFullYear() : null
        doc.active = !doc.exitDate || new Date(doc.exitDate).toISOString().slice(0, 10) >= today
        return doc
      },
    ],
  },
  fields: [
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
                  },
                },
                {
                  // derived field
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
              ],
            },
            {
              name: 'birthDate',
              label: { en: 'Date of birth', de: 'Geburtsdatum' },
              type: 'date',
              access: { read: authenticated },
              admin: {
                width: '40%',
                date: { pickerAppearance: 'dayOnly', displayFormat: 'dd.MM.yyyy' },
                description: { en: 'Not public.', de: 'Nicht öffentlich.' },
              },
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
                  name: 'office',
                  label: { en: 'Office', de: 'Büro' },
                  type: 'relationship',
                  relationTo: 'offices',
                  admin: { width: '40%' },
                },
                {
                  name: 'entryDate',
                  label: { en: 'Entry date', de: 'Eintrittsdatum' },
                  type: 'date',
                  access: { read: authenticated },
                  admin: {
                    width: '30%',
                    date: { pickerAppearance: 'dayOnly', displayFormat: 'dd.MM.yyyy' },
                    description: {
                      en: 'Not public; the website shows the year only.',
                      de: 'Nicht öffentlich; die Website zeigt nur das Jahr.',
                    },
                  },
                },
                {
                  name: 'exitDate',
                  label: { en: 'Exit date', de: 'Austrittsdatum' },
                  type: 'date',
                  access: { read: authenticated },
                  admin: {
                    width: '30%',
                    date: { pickerAppearance: 'dayOnly', displayFormat: 'dd.MM.yyyy' },
                    description: {
                      en: 'Not public. Empty while the person works here.',
                      de: 'Nicht öffentlich. Leer, solange die Person hier arbeitet.',
                    },
                  },
                },
              ],
            },
            {
              name: 'expertise',
              label: { en: 'Specialist groups', de: 'Fachgruppen' },
              type: 'relationship',
              relationTo: 'expertise',
              hasMany: true,
              access: { read: authenticated },
              admin: {
                description: {
                  en: 'What the person takes care of in the office. Not public.',
                  de: 'Wofür die Person im Büro zuständig ist. Nicht öffentlich.',
                },
              },
            },
            // Public stand-in for the entry date, set by the beforeRead hook above.
            {
              name: 'entryYear',
              label: { en: 'Year joined', de: 'Eintrittsjahr' },
              type: 'number',
              virtual: true,
              admin: { hidden: true },
            },
          ],
        },
        {
          label: { en: 'Education', de: 'Bildung' },
          fields: [
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
              // Localized as a whole: each language lists the qualifications it shows.
              name: 'qualifications',
              label: { en: 'Qualifications', de: 'Qualifikationen' },
              labels: {
                singular: { en: 'Qualification', de: 'Qualifikation' },
                plural: { en: 'Qualifications', de: 'Qualifikationen' },
              },
              type: 'array',
              localized: true,
              admin: {
                description: {
                  en: 'Certificates and further qualifications, one per entry.',
                  de: 'Zertifikate und Zusatzqualifikationen, eine pro Eintrag.',
                },
              },
              fields: [
                {
                  name: 'name',
                  label: { en: 'Name', de: 'Bezeichnung' },
                  type: 'text',
                  required: true,
                },
              ],
            },
          ],
        },
        {
          label: { en: 'Contact', de: 'Kontakt' },
          fields: [
            {
              name: 'email',
              label: { en: 'Email', de: 'E-Mail' },
              type: 'email',
            },
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
                  name: 'mobilePhone',
                  label: { en: 'Mobile phone', de: 'Mobiltelefon' },
                  type: 'text',
                  access: { read: authenticated },
                  admin: {
                    width: '50%',
                    placeholder: '+49 351 1234567',
                    description: { en: 'Not public.', de: 'Nicht öffentlich.' },
                  },
                },
              ],
            },
          ],
        },
      ],
    },
    {
      name: 'code',
      label: { en: 'Code', de: 'Kürzel' },
      type: 'text',
      unique: true,
      admin: {
        position: 'sidebar',
        description: {
          en: 'Short code from WerkX, e.g. "TmHn". Unique across all offices.',
          de: 'Kürzel aus WerkX, z. B. „TmHn“. Eindeutig über alle Büros.',
        },
      },
    },
    legacyIdField,
    intranetIdField,
    {
      name: 'active',
      label: { en: 'Works here', de: 'Arbeitet hier' },
      type: 'checkbox',
      virtual: true,
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: {
          en: 'Until the exit date.',
          de: 'Bis zum Austrittsdatum.',
        },
      },
    },
  ],
}
