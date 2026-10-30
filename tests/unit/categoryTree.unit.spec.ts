import { describe, expect, it, vi } from 'vitest'
import { buildCategoryColumns, type CategoryNode, toggleCategory } from '@/fields/projects/categoryTree'
import { childrenOnly } from '@/fields/validation'

// In display order, as the collection's drag-and-drop order returns them.
const CATEGORIES: CategoryNode[] = [
  { id: 1, name: 'Parks and gardens', parent: null, menuColumn: '1' },
  { id: 9, name: 'Focus', parent: null, menuColumn: '4' },
  { id: 2, name: 'Culture and science', parent: null, menuColumn: '1' },
  { id: 3, name: 'Empty group', parent: null, menuColumn: '2' },
  { id: 4, name: 'Group without a column', parent: null, menuColumn: null },
  { id: 10, name: 'Parks', parent: 1 },
  { id: 90, name: 'Participation', parent: { id: 9 } },
  { id: 11, name: 'Garden shows', parent: 1 },
  { id: 21, name: 'Museums', parent: 2 },
  { id: 40, name: 'Studies', parent: 4 },
]

describe('buildCategoryColumns', () => {
  const columns = buildCategoryColumns(CATEGORIES)

  it('puts groups in their menu column and children under their group, in display order', () => {
    expect(columns.map((groups) => groups.map((group) => group.id))).toEqual([[1, 2], [9], [4]])
    expect(columns[0][0].children.map((child) => child.id)).toEqual([10, 11])
    expect(columns[1][0].children.map((child) => child.id)).toEqual([90])
  })

  it('leaves out groups without children', () => {
    expect(columns.flat().map((group) => group.id)).not.toContain(3)
  })

  it('keeps groups without children when asked', () => {
    const all = buildCategoryColumns(CATEGORIES, { includeEmptyGroups: true })
    expect(all.map((groups) => groups.map((group) => group.id))).toEqual([[1, 2], [3], [9], [4]])
  })
})

describe('toggleCategory', () => {
  const columns = buildCategoryColumns(CATEGORIES)

  it('adds and removes a category, keeping tree order', () => {
    expect(toggleCategory(columns, [90], 10)).toEqual([10, 90])
    expect(toggleCategory(columns, [10, 90], 10)).toEqual([90])
  })

  it('drops ids that are not selectable', () => {
    expect(toggleCategory(columns, [1, 999, 21], 11)).toEqual([11, 21])
  })
})

describe('childrenOnly', () => {
  const validate = childrenOnly('project-categories')
  const run = (value: (number | string)[] | null, groupsFound: number) => {
    const count = vi.fn().mockResolvedValue({ totalDocs: groupsFound })
    const req = { payload: { count }, t: (key: string) => key }
    return { count, result: validate(value as never, { req } as never) }
  }

  it('accepts an empty selection without querying', async () => {
    const { count, result } = run(null, 0)
    expect(await result).toBe(true)
    expect(count).not.toHaveBeenCalled()
  })

  it('accepts categories within a group', async () => {
    expect(await run([10, 90], 0).result).toBe(true)
  })

  it('rejects a group', async () => {
    const { count, result } = run([1, 10], 1)
    expect(await result).toBe('categories:childrenOnly')
    expect(count.mock.calls[0][0].where).toEqual({
      and: [{ id: { in: ['1', '10'] } }, { parent: { exists: false } }],
    })
  })
})
