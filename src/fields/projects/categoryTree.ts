import { idOf } from '@/fields/validation'

// Arranges project categories like the website's project filter menu: top-level groups in their
// menu column, each with its child categories. Used by the category picker on projects and the
// overview above the categories list.

export type CategoryId = number | string

export type CategoryNode = {
  id: CategoryId
  name?: string | null
  parent?: CategoryId | { id: CategoryId } | null
  menuColumn?: string | null
}

export type CategoryGroup = { id: CategoryId; name: string; children: { id: CategoryId; name: string }[] }

const MENU_COLUMNS = ['1', '2', '3', '4']


/**
 * Columns of groups, in menu column order. `categories` must already be in display order (the
 * collection's drag-and-drop order). Groups without a valid menu column come last in an extra
 * column. Groups without children are left out (nothing in them can be selected) unless
 * `includeEmptyGroups` is set.
 */
export function buildCategoryColumns(
  categories: CategoryNode[],
  { includeEmptyGroups = false }: { includeEmptyGroups?: boolean } = {},
): CategoryGroup[][] {
  const children = new Map<string, { id: CategoryId; name: string }[]>()
  for (const category of categories) {
    if (!category.parent) continue
    const parentId = idOf(category.parent)
    if (!children.has(parentId)) children.set(parentId, [])
    children.get(parentId)!.push({ id: category.id, name: category.name ?? '' })
  }

  const columns = new Map<string, CategoryGroup[]>([...MENU_COLUMNS, ''].map((column) => [column, []]))
  for (const category of categories) {
    if (category.parent) continue
    const groupChildren = children.get(String(category.id)) ?? []
    if (!groupChildren.length && !includeEmptyGroups) continue
    const column = MENU_COLUMNS.includes(category.menuColumn ?? '') ? category.menuColumn! : ''
    columns.get(column)!.push({ id: category.id, name: category.name ?? '', children: groupChildren })
  }
  return [...columns.values()].filter((column) => column.length > 0)
}

/**
 * The selection after toggling `id`, in tree order. Ids that aren't selectable (groups, deleted
 * categories) are dropped, so saving cleans them out.
 */
export function toggleCategory(columns: CategoryGroup[][], selected: CategoryId[], id: CategoryId): CategoryId[] {
  const next = new Set(selected.map(idOf))
  if (next.has(String(id))) next.delete(String(id))
  else next.add(String(id))
  return columns.flatMap((groups) =>
    groups.flatMap((group) => group.children.filter((child) => next.has(String(child.id))).map((child) => child.id)),
  )
}
