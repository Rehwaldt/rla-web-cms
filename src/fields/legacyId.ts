import type { Field } from 'payload'

// Id of the record this document was imported from. The importer matches on it, so re-running
// an import updates documents instead of duplicating them.
export const legacyIdField: Field = {
  name: 'legacyId',
  type: 'number',
  unique: true,
  index: true,
  admin: {
    position: 'sidebar',
    readOnly: true,
    description: 'Id in the legacy website database. Set by the importer.',
  },
}
