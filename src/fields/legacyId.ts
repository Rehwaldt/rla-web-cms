import type { Field } from 'payload'

// Id of the record this document was imported from. The importer matches on it, so re-running
// an import updates documents instead of duplicating them.
export const legacyIdField: Field = {
  name: 'legacyId',
  // Developer information, so the label stays the same in both languages.
  label: { en: 'Legacy ID', de: 'Legacy ID' },
  type: 'number',
  unique: true,
  index: true,
  admin: {
    position: 'sidebar',
    readOnly: true,
    description: {
      en: 'ID in the legacy website database. Set by the importer.',
      de: 'ID in der Datenbank der alten Website. Wird vom Import gesetzt.',
    },
  },
}
