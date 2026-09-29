import type { BasePayload, CollectionSlug } from 'payload'
import type { Report } from './report'
import { type Data, type DocPlan, isRef, type Plan, SECONDARY_LOCALES } from './plan/types'

type Id = number | string
const MISSING = Symbol('missing reference')

const containsRef = (value: unknown): boolean =>
  isRef(value) ||
  (Array.isArray(value) && value.some(containsRef)) ||
  (typeof value === 'object' && value !== null && Object.values(value).some(containsRef))

/** Splits a document's values into those without references and those that need ids first. */
function splitByRefs(data: Data): [Data, Data] {
  const plain: Data = {}
  const withRefs: Data = {}
  for (const [key, value] of Object.entries(data)) (containsRef(value) ? withRefs : plain)[key] = value
  return [plain, withRefs]
}

const isVersioned = (payload: BasePayload, collection: CollectionSlug) =>
  Boolean(payload.collections[collection].config.versions?.drafts)

const errorMessage = (error: unknown): string => {
  const data = (error as { data?: { errors?: { path: string; message: string }[] } }).data
  const details = data?.errors?.map((e) => `${e.path}: ${e.message}`).join('; ')
  return details || (error instanceof Error ? error.message : String(error))
}

/**
 * Writes a plan to Payload. Documents are matched by legacy id (or file name for PDFs), so
 * running it again updates instead of duplicating. Everything is first written as published —
 * that validates required fields — and documents that were hidden in the legacy database are
 * switched to draft at the end.
 */
export async function applyPlan(
  payload: BasePayload,
  plan: Plan,
  report: Report,
  { updateMedia = false }: { updateMedia?: boolean } = {},
): Promise<void> {
  const ids = new Map<CollectionSlug, Map<string, Id>>()
  const idsFor = (collection: CollectionSlug) => {
    if (!ids.has(collection)) ids.set(collection, new Map())
    return ids.get(collection)!
  }

  // Resolve refs to ids. A missing ref removes the array row or object that holds it; a missing
  // top-level value becomes null.
  const resolve = (value: unknown, where: string): unknown => {
    if (isRef(value)) {
      const id = idsFor(value.$ref.collection).get(value.$ref.key)
      if (id === undefined) {
        report.add('Unresolved reference (dropped)', `${where}: ${value.$ref.collection}/${value.$ref.key}`)
        return MISSING
      }
      return id
    }
    if (Array.isArray(value)) return value.map((item) => resolve(item, where)).filter((item) => item !== MISSING)
    if (typeof value === 'object' && value !== null) {
      const entries = Object.entries(value).map(([key, item]) => [key, resolve(item, where)] as const)
      return entries.some(([, item]) => item === MISSING) ? MISSING : Object.fromEntries(entries)
    }
    return value
  }
  const resolveData = (data: Data, where: string): Data =>
    Object.fromEntries(
      Object.entries(data).map(([key, value]) => {
        const resolved = resolve(value, `${where} ${key}`)
        return [key, resolved === MISSING ? null : resolved]
      }),
    )

  // Existing documents, so a re-run updates them.
  for (const collection of new Set(plan.docs.map((doc) => doc.collection))) {
    const existing = await payload.find({ collection, pagination: false, depth: 0, overrideAccess: true })
    for (const doc of existing.docs as { id: Id; legacyId?: number | null; filename?: string | null }[]) {
      if (doc.legacyId !== null && doc.legacyId !== undefined) idsFor(collection).set(String(doc.legacyId), doc.id)
      else if (doc.filename) idsFor(collection).set(`pdf:${doc.filename}`, doc.id)
    }
  }

  const write = async (doc: DocPlan, locale: string, data: Data, phase: string): Promise<boolean> => {
    const where = `${doc.collection}/${doc.key} [${locale}] ${phase}`
    const versioned = isVersioned(payload, doc.collection)
    const payloadData = (versioned ? { ...data, _status: 'published' } : data) as never
    try {
      const id = idsFor(doc.collection).get(doc.key)
      if (id !== undefined) {
        await payload.update({ collection: doc.collection, id, data: payloadData, locale: locale as never, depth: 0, overrideAccess: true })
      } else {
        const created = await payload.create({
          collection: doc.collection,
          data: payloadData,
          locale: locale as never,
          depth: 0,
          overrideAccess: true,
          ...(doc.filePath && { filePath: doc.filePath }),
        })
        idsFor(doc.collection).set(doc.key, created.id)
        report.count(`created ${doc.collection}`)
      }
      return true
    } catch (error) {
      report.add('Write failed', `${where}: ${errorMessage(error)}`)
      return false
    }
  }

  const progress = (phase: string, index: number, total: number) => {
    if (index % 100 === 0 || index === total) console.log(`  ${phase}: ${index}/${total}`)
  }

  const skipped = new Set<DocPlan>()
  console.log('Phase 1: documents')
  for (const [index, doc] of plan.docs.entries()) {
    const [plainData] = splitByRefs(doc.data)
    const isNew = !idsFor(doc.collection).has(doc.key)
    // Already-imported uploads are left alone unless asked; their files never change.
    if (!isNew && doc.filePath && !updateMedia) {
      skipped.add(doc)
      continue
    }
    if (!(await write(doc, 'de', plainData, 'phase 1'))) continue
    for (const locale of SECONDARY_LOCALES) {
      const [plainLocalized] = splitByRefs(doc.localized[locale] ?? {})
      if (Object.keys(plainLocalized).length > 0) await write(doc, locale, plainLocalized, 'phase 1')
    }
    progress('phase 1', index + 1, plan.docs.length)
  }

  console.log('Phase 2: references')
  for (const [index, doc] of plan.docs.entries()) {
    if (!idsFor(doc.collection).has(doc.key) || skipped.has(doc)) continue
    const [, withRefs] = splitByRefs(doc.data)
    if (Object.keys(withRefs).length > 0) {
      await write(doc, 'de', resolveData(withRefs, `${doc.collection}/${doc.key}`), 'phase 2')
    }
    for (const locale of SECONDARY_LOCALES) {
      const [, localizedRefs] = splitByRefs(doc.localized[locale] ?? {})
      if (Object.keys(localizedRefs).length > 0) {
        await write(doc, locale, resolveData(localizedRefs, `${doc.collection}/${doc.key} [${locale}]`), 'phase 2')
      }
    }
    progress('phase 2', index + 1, plan.docs.length)
  }

  console.log('Phase 3: globals and draft status')
  for (const global of plan.globals) {
    for (const [locale, data] of Object.entries(global.localized)) {
      try {
        await payload.updateGlobal({
          slug: global.slug,
          locale: locale as never,
          data: resolveData(data, `${global.slug} [${locale}]`) as never,
          depth: 0,
          overrideAccess: true,
        })
      } catch (error) {
        report.add('Write failed', `${global.slug} [${locale}]: ${errorMessage(error)}`)
      }
    }
  }
  for (const doc of plan.docs) {
    const id = idsFor(doc.collection).get(doc.key)
    if (doc.status !== 'draft' || id === undefined) continue
    try {
      await payload.update({ collection: doc.collection, id, data: { _status: 'draft' } as never, depth: 0, overrideAccess: true })
      report.count(`drafts ${doc.collection}`)
    } catch (error) {
      report.add('Write failed', `${doc.collection}/${doc.key} unpublish: ${errorMessage(error)}`)
    }
  }
}
