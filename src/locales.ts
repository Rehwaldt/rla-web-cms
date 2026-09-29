// The website's languages. Missing translations fall back to English, then German, matching the
// legacy site's behavior.
export const LOCALES = [
  { code: 'de', label: 'German' },
  { code: 'en', label: 'English', fallbackLocale: 'de' },
  { code: 'zh', label: 'Chinese', fallbackLocale: ['en', 'de'] },
  { code: 'cs', label: 'Czech', fallbackLocale: ['en', 'de'] },
]

export const DEFAULT_LOCALE = 'de'

export const LOCALE_CODES = LOCALES.map((locale) => locale.code)
