import { generateNKeysBetween } from 'payload/shared'
import { idOf } from '@/fields/validation'
import type { CategoryId, CategoryNode } from './categoryTree'

// The categories view's editable arrangement of project categories (groups in the four menu
// columns, categories in their groups) and the writes that store a rearranged one. The website
// reads the arrangement from `menuColumn`, `parent` and the collection's `_order`.

export const MENU_COLUMNS = ['1', '2', '3', '4']
/** Column of groups without a valid menu column. Shown, but nothing can be dropped there. */
export const NO_COLUMN = ''
/** Group of categories whose parent isn't a top-level group. Shown, but nothing can be dropped there. */
export const NOT_IN_GROUP = 'not-in-group'

/** Ids as strings: menu column → group ids, group id → category ids, each in display order. */
export type CategoryLayout = {
  columns: Record<string, string[]>
  groups: Record<string, string[]>
}

export type CategoryChange = {
  id: CategoryId
  data: { _order?: string; parent?: CategoryId; menuColumn?: string }
}

/** The arrangement stored in `categories`, which must be in `_order`. */
export function buildLayout(categories: CategoryNode[]): CategoryLayout {
  const columns: Record<string, string[]> = Object.fromEntries([...MENU_COLUMNS, NO_COLUMN].map((c) => [c, []]))
  const groups: Record<string, string[]> = { [NOT_IN_GROUP]: [] }
  for (const category of categories) {
    if (category.parent) continue
    const column = MENU_COLUMNS.includes(category.menuColumn ?? '') ? category.menuColumn! : NO_COLUMN
    columns[column].push(String(category.id))
    groups[String(category.id)] = []
  }
  for (const category of categories) {
    if (!category.parent) continue
    const parentId = idOf(category.parent)
    ;(parentId in groups && parentId !== NOT_IN_GROUP ? groups[parentId] : groups[NOT_IN_GROUP]).push(
      String(category.id),
    )
  }
  return { columns, groups }
}

/** The container in `map` that holds `id`. */
export function containerOf(map: Record<string, string[]>, id: string): string | undefined {
  return Object.keys(map).find((container) => map[container].includes(id))
}

/** `map` with `id` moved to position `index` of container `to`. */
export function moveItem(
  map: Record<string, string[]>,
  id: string,
  to: string,
  index: number,
): Record<string, string[]> {
  const next = Object.fromEntries(Object.entries(map).map(([container, ids]) => [container, ids.filter((i) => i !== id)]))
  const target = next[to] ?? []
  target.splice(Math.max(0, Math.min(index, target.length)), 0, id)
  next[to] = target
  return next
}

/** Indexes of a longest strictly increasing subsequence of `values` (nulls never belong to it). */
function longestIncreasing(values: (string | null)[]): Set<number> {
  const length = values.map(() => 0)
  const previous = values.map(() => -1)
  let end = -1
  values.forEach((value, i) => {
    if (value === null) return
    length[i] = 1
    for (let j = 0; j < i; j++) {
      const before = values[j]
      if (before !== null && before < value && length[j] + 1 > length[i]) {
        length[i] = length[j] + 1
        previous[i] = j
      }
    }
    if (end === -1 || length[i] > length[end]) end = i
  })
  const result = new Set<number>()
  for (let i = end; i !== -1; i = previous[i]) result.add(i)
  return result
}

/**
 * The writes that turn the stored arrangement (`categories`, in `_order`) into `layout`. Entries
 * that keep their place relative to their neighbours keep their `_order` key, so a single move
 * writes a single entry. Groups without a menu column and categories outside a group stay as
 * they are.
 */
export function planChanges(categories: CategoryNode[], layout: CategoryLayout): CategoryChange[] {
  const byId = new Map(categories.map((category) => [String(category.id), category]))
  const changes = new Map<string, CategoryChange['data']>()
  const change = (id: string, data: CategoryChange['data']) => changes.set(id, { ...changes.get(id), ...data })

  // New keys only for entries out of order; each run of them goes between its neighbours' keys.
  const order = (ids: string[]) => {
    const ordered = ids.filter((id) => byId.has(id))
    const keys = ordered.map((id) => byId.get(id)!._order ?? null)
    const stable = longestIncreasing(keys)
    let before: string | null = null
    for (let i = 0; i < ordered.length; ) {
      if (stable.has(i)) {
        before = keys[i]
        i++
        continue
      }
      let end = i
      while (end < ordered.length && !stable.has(end)) end++
      const newKeys = generateNKeysBetween(before, end < ordered.length ? keys[end] : null, end - i)
      newKeys.forEach((key, k) => change(ordered[i + k], { _order: key }))
      before = newKeys[newKeys.length - 1]
      i = end
    }
  }

  for (const column of MENU_COLUMNS) {
    const groupIds = layout.columns[column] ?? []
    for (const id of groupIds) {
      if (byId.has(id) && byId.get(id)!.menuColumn !== column) change(id, { menuColumn: column })
    }
    order(groupIds)
  }
  for (const [groupId, categoryIds] of Object.entries(layout.groups)) {
    if (groupId === NOT_IN_GROUP || !byId.has(groupId)) continue
    for (const id of categoryIds) {
      const parent = byId.get(id)?.parent
      if (byId.has(id) && (!parent || idOf(parent) !== groupId)) change(id, { parent: byId.get(groupId)!.id })
    }
    order(categoryIds)
  }

  return [...changes].map(([id, data]) => ({ id: byId.get(id)!.id, data }))
}
