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
  auth: {
    // COOKIE_DOMAIN (the parent domain) shares the login cookie with the website, which then
    // shows editors a link to the CMS (#31). Every host under that domain receives the token,
    // so the shared cookie only travels over HTTPS. Unset: a host-only cookie, as in dev.
    cookies: {
      domain: process.env.COOKIE_DOMAIN || undefined,
      secure: Boolean(process.env.COOKIE_DOMAIN),
    },
  },
  fields: [
    // Email added by default
    // Add more fields as needed
  ],
}
