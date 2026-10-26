import type { CollectionAfterChangeHook, CollectionAfterDeleteHook, CollectionConfig, Payload, PayloadRequest } from 'payload'
import { LOCALE_CODES } from '@/locales'
import { entriesFor, type SearchableCollection, SEARCHABLE_COLLECTIONS, type SearchEntry, selectFor } from './sources'

// Keeps the search index (SearchIndex.ts) in step with the searchable collections. The entries are
// built from each document's main table, which holds its published version: a draft save leaves
// it, and so the index, as it was.

const INDEX = 'search-index'

// Writes inside a request share its transaction, so the index changes with the document or not at all
type Options = { req?: PayloadRequest }

async function removeEntries(payload: Payload, collection: SearchableCollection, id: number | null, { req }: Options) {
  await payload.delete({
    collection: INDEX as never,
    where: { and: [{ docCollection: { equals: collection } }, ...(id === null ? [] : [{ docId: { equals: id } }])] },
    overrideAccess: true,
    req,
  })
}

async function addEntries(payload: Payload, entries: SearchEntry[], { req }: Options) {
  // in batches: one at a time takes minutes for a whole collection on a remote database
  for (let i = 0; i < entries.length; i += 25) {
    await Promise.all(
      entries.slice(i, i + 25).map((data) =>
        payload.create({ collection: INDEX as never, data: data as never, depth: 0, overrideAccess: true, req }),
      ),
    )
  }
}

// Every document of a collection (or just one) in each language, as the main table holds it
async function readByLanguage(payload: Payload, collection: SearchableCollection, id: number | null, { req }: Options) {
  const byLanguage = new Map<number, Record<string, Record<string, unknown> & { id: number }>>()
  for (const language of LOCALE_CODES) {
    const { docs } = await payload.find({
      collection,
      ...(id !== null && { where: { id: { equals: id } } }),
      locale: language as never,
      draft: false,
      depth: 0,
      select: selectFor(collection) as never,
      pagination: false,
      overrideAccess: true,
      req,
    })
    for (const doc of docs as unknown as (Record<string, unknown> & { id: number })[]) {
      byLanguage.set(doc.id, { ...byLanguage.get(doc.id), [language]: doc })
    }
  }
  return byLanguage
}

/** Rebuilds the index entries of one document. */
export async function indexDocument(payload: Payload, collection: SearchableCollection, id: number, options: Options = {}) {
  const byLanguage = await readByLanguage(payload, collection, id, options)
  await removeEntries(payload, collection, id, options)
  await addEntries(payload, entriesFor(collection, byLanguage.get(id) ?? {}), options)
}

/** Rebuilds the whole index. */
export async function reindexAll(payload: Payload, log: (line: string) => void = () => {}) {
  for (const collection of SEARCHABLE_COLLECTIONS) {
    const byLanguage = await readByLanguage(payload, collection, null, {})
    const entries = [...byLanguage.values()].flatMap((docs) => entriesFor(collection, docs))
    await removeEntries(payload, collection, null, {})
    await addEntries(payload, entries, {})
    log(`${collection}: ${byLanguage.size} documents, ${entries.length} entries`)
  }
}

// The importer passes this in its writes' context and rebuilds the whole index once at the end
export const SKIP_SEARCH_INDEX = 'skipSearchIndex'

// A failed index update is logged and doesn't fail the editor's save; `pnpm search:reindex` repairs it
const afterChange =
  (collection: SearchableCollection): CollectionAfterChangeHook =>
  async ({ doc, req, context }) => {
    if (context[SKIP_SEARCH_INDEX]) return doc
    try {
      await indexDocument(req.payload, collection, doc.id, { req })
    } catch (error) {
      req.payload.logger.error({ err: error, msg: `Search index: updating ${collection}/${doc.id} failed` })
    }
    return doc
  }

const afterDelete =
  (collection: SearchableCollection): CollectionAfterDeleteHook =>
  async ({ id, req, context }) => {
    if (context[SKIP_SEARCH_INDEX]) return
    try {
      await removeEntries(req.payload, collection, Number(id), { req })
    } catch (error) {
      req.payload.logger.error({ err: error, msg: `Search index: removing ${collection}/${id} failed` })
    }
  }

/** The collections with the hooks that keep their index entries current. */
export function withSearchIndexHooks(collections: CollectionConfig[]): CollectionConfig[] {
  return collections.map((config) => {
    if (!(SEARCHABLE_COLLECTIONS as string[]).includes(config.slug)) return config
    const collection = config.slug as SearchableCollection
    return {
      ...config,
      hooks: {
        ...config.hooks,
        afterChange: [...(config.hooks?.afterChange ?? []), afterChange(collection)],
        afterDelete: [...(config.hooks?.afterDelete ?? []), afterDelete(collection)],
      },
    }
  })
}
