import { APIError } from 'payload'
import type {
  CollectionBeforeDeleteHook,
  CollectionSlug,
  FilterOptions,
  RelationshipFieldSingleValidation,
  Where,
} from 'payload'
import { idOf } from '@/fields/validation'

// Keeps a nested-docs collection a two-level tree of groups (top level) and their categories, the
// shape the website's project filter menu reads.

type Translate = (key: string) => string

/** Offers only top-level groups as parent, never the document itself. */
export const groupsOnly: FilterOptions = ({ id }) => {
  const topLevel: Where = { parent: { exists: false } }
  return id ? { and: [topLevel, { id: { not_equals: id } }] } : topLevel
}

/** A parent must be a top-level group, and a group that has categories can't get one. */
export const topLevelParent =
  (collection: CollectionSlug): RelationshipFieldSingleValidation =>
  async (value, { id, req }) => {
    if (value === null || value === undefined || !req.payload) return true
    const t = req.t as Translate
    const parentId = idOf(value as Parameters<typeof idOf>[0])
    if (id !== undefined && parentId === String(id)) return t('categories:parentNotGroup')
    const { docs } = await req.payload.find({
      collection,
      where: { id: { equals: parentId } },
      select: { parent: true } as never,
      depth: 0,
      limit: 1,
      req,
    })
    if (!docs[0]) return t('categories:parentNotFound')
    if ((docs[0] as { parent?: unknown }).parent) return t('categories:parentNotGroup')
    if (id === undefined) return true
    const { totalDocs } = await req.payload.count({ collection, where: { parent: { equals: id } }, req })
    return totalDocs === 0 || t('categories:groupHasCategories')
  }

/** A group can only be deleted once it has no categories left; they would turn into groups. */
export const keepGroupsWithCategories: CollectionBeforeDeleteHook = async ({ collection, id, req }) => {
  const { totalDocs } = await req.payload.count({
    collection: collection.slug as CollectionSlug,
    where: { parent: { equals: id } },
    req,
  })
  if (totalDocs > 0) throw new APIError((req.t as Translate)('categories:deleteGroupWithCategories'), 400, null, true)
}
