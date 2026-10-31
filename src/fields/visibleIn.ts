import type { Field } from 'payload'
import { LOCALES, LOCALE_CODES } from '@/locales'

// Which language versions of the website list this entry. Complements the draft/published
// status: an unpublished entry is hidden everywhere, a published one appears in listings of the
// selected languages only (and stays reachable by direct link in all of them).
export const visibleInField: Field = {
  name: 'visibleIn',
  label: { en: 'Listed in', de: 'Aufgeführt in' },
  type: 'select',
  hasMany: true,
  defaultValue: LOCALE_CODES,
  options: LOCALES.map(({ code, label }) => ({ label, value: code })),
  admin: {
    position: 'sidebar',
    // A flagged checkbox per language instead of the dropdown.
    components: { Field: '@/components/cms/LocaleFlags/VisibleInField#VisibleInField' },
    description: {
      en: 'Languages whose website lists this entry. It stays reachable by direct link in all of them.',
      de: 'Sprachen, deren Website diesen Eintrag aufführt. Per direktem Link bleibt er in allen erreichbar.',
    },
  },
}
