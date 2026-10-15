// The website's languages. Missing translations fall back to English, then German, matching the
// legacy site's behavior — German included: a German page shows the English text where the German
// one is missing. Each language is named in itself, which reads the same in the English and the
// German admin.
const endonym = (name: string) => ({ en: name, de: name })

export const LOCALES = [
  { code: 'de', label: endonym('Deutsch'), fallbackLocale: 'en' },
  { code: 'en', label: endonym('English'), fallbackLocale: 'de' },
  { code: 'zh', label: endonym('中文'), fallbackLocale: ['en', 'de'] },
  { code: 'cs', label: endonym('Čeština'), fallbackLocale: ['en', 'de'] },
]

export const DEFAULT_LOCALE = 'de'

export const LOCALE_CODES = LOCALES.map((locale) => locale.code)
