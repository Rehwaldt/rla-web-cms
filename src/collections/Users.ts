import type { CollectionConfig } from 'payload'
import { GROUPS } from '@/i18n/groups'

export const Users: CollectionConfig = {
  slug: 'users',
  labels: {
    singular: { en: 'User', de: 'Benutzerkonto' },
    plural: { en: 'Users', de: 'Benutzerkonten' },
  },
  admin: {
    useAsTitle: 'email',
    group: GROUPS.admin,
  },
  auth: true,
  fields: [
    // Email added by default
    // Add more fields as needed
  ],
}
