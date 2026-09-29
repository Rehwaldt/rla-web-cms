import type { TextFieldSingleValidation } from 'payload'
import { DEFAULT_LOCALE } from '@/locales'

// For localized fields that must exist in the default locale but may be empty in the others
// (where the fallback applies). `required: true` on a localized field demands every locale.
export const requiredInDefaultLocale: TextFieldSingleValidation = (value, { req }) =>
  req.locale !== DEFAULT_LOCALE || Boolean(value) || 'This field is required.'
