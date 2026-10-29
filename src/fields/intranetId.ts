import type { Field } from 'payload'

// Id of the matching post or term in the intranet (WordPress). The intranet import matches on it,
// and the intranet can look documents up by its own id.
export const intranetIdField: Field = {
  name: 'intranetId',
  // Developer information, so the label stays the same in both languages.
  label: { en: 'Intranet ID', de: 'Intranet ID' },
  type: 'number',
  unique: true,
  index: true,
  admin: {
    position: 'sidebar',
    readOnly: true,
    description: {
      en: 'ID in the intranet (WordPress). Set by the intranet import.',
      de: 'ID im Intranet (WordPress). Wird vom Intranet-Import gesetzt.',
    },
  },
}
