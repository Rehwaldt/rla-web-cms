import type { Field, PayloadRequest } from 'payload'

type LinkSiblingData = { kind?: 'project' | 'external' }
type LinkValidateOptions = { req: PayloadRequest; siblingData: LinkSiblingData }

// A per-language list of links, each pointing either at a project or at an external URL.
export const linksField: Field = {
  name: 'links',
  label: { en: 'Links', de: 'Links' },
  labels: { singular: { en: 'Link', de: 'Link' }, plural: { en: 'Links', de: 'Links' } },
  type: 'array',
  localized: true,
  admin: {
    initCollapsed: true,
    description: {
      en: 'Each language keeps its own list of links.',
      de: 'Jede Sprache hat ihre eigene Liste von Links.',
    },
  },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'kind',
          label: { en: 'Type', de: 'Art' },
          type: 'select',
          required: true,
          defaultValue: 'external',
          options: [
            { label: { en: 'Project', de: 'Projekt' }, value: 'project' },
            { label: { en: 'External URL', de: 'Externe URL' }, value: 'external' },
          ],
          admin: { width: '20%' },
        },
        {
          name: 'label',
          label: { en: 'Label', de: 'Bezeichnung' },
          type: 'text',
          admin: {
            width: '30%',
            description: {
              en: 'Optional for project links — the project name is used instead.',
              de: 'Bei Projektlinks optional – sonst wird der Projektname verwendet.',
            },
          },
        },
        {
          name: 'project',
          label: { en: 'Project', de: 'Projekt' },
          type: 'relationship',
          relationTo: 'projects',
          validate: (value: unknown, { req, siblingData }: LinkValidateOptions) =>
            siblingData?.kind !== 'project' || value ? true : req.t('validation:required'),
          admin: {
            width: '50%',
            condition: (_data, siblingData: LinkSiblingData) => siblingData?.kind === 'project',
          },
        },
        {
          name: 'url',
          label: { en: 'URL', de: 'URL' },
          type: 'text',
          validate: (value: unknown, { req, siblingData }: LinkValidateOptions) =>
            siblingData?.kind === 'project' || value ? true : req.t('validation:required'),
          admin: {
            width: '50%',
            placeholder: 'https://…',
            condition: (_data, siblingData: LinkSiblingData) => siblingData?.kind !== 'project',
          },
        },
      ],
    },
  ],
}
