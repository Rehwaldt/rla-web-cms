import type { Field, FieldHook } from 'payload'
import { LOCALES } from '@/locales'

// "BAF · Bundesgartenschau Erfurt": a project's code and name in one stored field. Payload's
// relationship dropdowns search and label options by the collection's `useAsTitle` alone, and only
// a stored field can be searched, so this is what makes projects findable by code there.

type Names = Partial<Record<string, string | null>>

const SEPARATOR = ' · '

/** The name in `locale`, else the first one in that locale's fallback chain. */
const nameIn = (locale: (typeof LOCALES)[number], names: Names) =>
  [locale.code, ...[locale.fallbackLocale].flat()].map((code) => names[code]?.trim()).find(Boolean)

/** The value of every locale: code and name, or whichever of them exists. */
export function buildCodeAndName(code: string | null | undefined, names: Names): Record<string, string | null> {
  return Object.fromEntries(
    LOCALES.map((locale) => {
      const parts = [code?.trim(), nameIn(locale, names)].filter(Boolean)
      return [locale.code, parts.length ? parts.join(SEPARATOR) : null]
    }),
  )
}

// A save carries one locale's data, but a changed code or name affects every locale's value. The
// stored values of the other locales are rewritten through `siblingDocWithLocales`, which Payload
// merges with the saved locale's value.
const fillAllLocales: FieldHook = ({ req, siblingData, siblingDocWithLocales }) => {
  const stored = siblingDocWithLocales ?? {}
  const names: Names = { ...(stored.name as Names | undefined) }
  if (typeof siblingData.name === 'object' && siblingData.name !== null) Object.assign(names, siblingData.name)
  else if ('name' in siblingData && req.locale) names[req.locale] = siblingData.name
  const code = 'code' in siblingData ? siblingData.code : stored.code
  const values = buildCodeAndName(code as string | null | undefined, names)
  if (siblingDocWithLocales) siblingDocWithLocales.codeAndName = values
  return req.locale && req.locale in values ? values[req.locale] : undefined
}

export const codeAndNameField: Field = {
  name: 'codeAndName',
  label: { en: 'Code and name', de: 'Kürzel und Name' },
  type: 'text',
  localized: true,
  // Only the admin needs it; the website reads `code` and `name`.
  access: { read: ({ req }) => Boolean(req.user) },
  admin: { hidden: true },
  hooks: { beforeChange: [fillAllLocales] },
}
