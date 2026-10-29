import type { CollectionSlug, RelationshipFieldManyValidation, TextFieldSingleValidation } from 'payload'
import { DEFAULT_LOCALE } from '@/locales'

// The id of a relationship value, populated or not.
export const idOf = (ref: number | string | { id: number | string }) =>
  String(typeof ref === 'object' ? ref.id : ref)

// For localized fields that must exist in the default locale but may be empty in the others
// (where the fallback applies). `required: true` on a localized field demands every locale.
export const requiredInDefaultLocale: TextFieldSingleValidation = (value, { req }) =>
  req.locale !== DEFAULT_LOCALE || Boolean(value) || req.t('validation:required')

// For a relationship to a nested-docs tree whose top-level documents only group the others: the
// groups themselves can't be selected.
export const childrenOnly =
  (collection: CollectionSlug): RelationshipFieldManyValidation =>
  async (value, { req }) => {
    const ids = (value ?? []).map((ref) => idOf(ref as Parameters<typeof idOf>[0]))
    if (ids.length === 0 || !req.payload) return true
    const { totalDocs } = await req.payload.count({
      collection,
      where: { and: [{ id: { in: ids } }, { parent: { exists: false } }] },
      req,
    })
    return totalDocs === 0 || (req.t as (key: string) => string)('categories:childrenOnly')
  }
