import type { Field } from 'payload'

type LinkSiblingData = { kind?: 'project' | 'external' }

// A per-language list of links, each pointing either at a project or at an external URL.
export const linksField: Field = {
  name: 'links',
  type: 'array',
  localized: true,
  admin: {
    initCollapsed: true,
    description: 'Each language keeps its own list of links.',
  },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'kind',
          type: 'select',
          required: true,
          defaultValue: 'external',
          options: [
            { label: 'Project', value: 'project' },
            { label: 'External URL', value: 'external' },
          ],
          admin: { width: '20%' },
        },
        {
          name: 'label',
          type: 'text',
          admin: {
            width: '30%',
            description: 'Optional for project links — the project name is used instead.',
          },
        },
        {
          name: 'project',
          type: 'relationship',
          relationTo: 'projects',
          validate: (value: unknown, { siblingData }: { siblingData: LinkSiblingData }) =>
            siblingData?.kind !== 'project' || value ? true : 'Select a project.',
          admin: {
            width: '50%',
            condition: (_data, siblingData: LinkSiblingData) => siblingData?.kind === 'project',
          },
        },
        {
          name: 'url',
          type: 'text',
          validate: (value: unknown, { siblingData }: { siblingData: LinkSiblingData }) =>
            siblingData?.kind === 'project' || value ? true : 'Enter a URL.',
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
