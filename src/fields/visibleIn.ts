import type { Field } from 'payload'
import { LOCALES, LOCALE_CODES } from '@/locales'

// Which language versions of the website list this entry. Complements the draft/published
// status: an unpublished entry is hidden everywhere, a published one appears in listings of the
// selected languages only (and stays reachable by direct link in all of them).
export const visibleInField: Field = {
  name: 'visibleIn',
  label: 'Listed in',
  type: 'select',
  hasMany: true,
  defaultValue: LOCALE_CODES,
  options: LOCALES.map(({ code, label }) => ({ label, value: code })),
  admin: {
    position: 'sidebar',
    description: 'Languages whose website lists this entry.',
  },
}
