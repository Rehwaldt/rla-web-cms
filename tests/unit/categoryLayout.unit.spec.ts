import { describe, expect, it, vi } from 'vitest'
import { groupsOnly, keepGroupsWithCategories, topLevelParent } from '@/collections/projects/categoryRules'
import {
  buildLayout,
  type CategoryLayout,
  moveItem,
  NO_COLUMN,
  NOT_IN_GROUP,
  planChanges,
} from '@/fields/projects/categoryLayout'
import type { CategoryNode } from '@/fields/projects/categoryTree'

// In `_order`, as the categories view loads them.
const CATEGORIES: CategoryNode[] = [
  { id: 1, name: 'Parks and gardens', parent: null, menuColumn: '1', _order: 'a0' },
  { id: 10, name: 'Parks', parent: 1, _order: 'a1' },
  { id: 11, name: 'Garden shows', parent: 1, _order: 'a2' },
  { id: 12, name: 'Cemeteries', parent: 1, _order: 'a3' },
  { id: 2, name: 'Culture and science', parent: null, menuColumn: '1', _order: 'a4' },
  { id: 21, name: 'Museums', parent: { id: 2 }, _order: 'a5' },
  { id: 3, name: 'Empty group', parent: null, menuColumn: '2', _order: 'a6' },
  { id: 4, name: 'Group without a column', parent: null, menuColumn: null, _order: 'a7' },
  { id: 40, name: 'Third level', parent: 21, _order: 'a8' },
]

const layout = () => buildLayout(CATEGORIES)
const withGroups = (groups: CategoryLayout['groups']): CategoryLayout => ({
  ...layout(),
  groups: { ...layout().groups, ...groups },
})

describe('buildLayout', () => {
  it('puts groups in their menu column and categories in their group, in order', () => {
    const { columns, groups } = layout()
    expect(columns).toEqual({ '1': ['1', '2'], '2': ['3'], '3': [], '4': [], [NO_COLUMN]: ['4'] })
    expect(groups['1']).toEqual(['10', '11', '12'])
    expect(groups['2']).toEqual(['21'])
    expect(groups['3']).toEqual([])
  })

  it('collects categories without a top-level parent', () => {
    expect(layout().groups[NOT_IN_GROUP]).toEqual(['40'])
  })
})

describe('moveItem', () => {
  it('moves an entry into another container at a position', () => {
    expect(moveItem({ a: ['1', '2'], b: ['3'] }, '2', 'b', 0)).toEqual({ a: ['1'], b: ['2', '3'] })
  })

  it('moves an entry within its container', () => {
    expect(moveItem({ a: ['1', '2', '3'] }, '1', 'a', 2)).toEqual({ a: ['2', '3', '1'] })
  })
})

describe('planChanges', () => {
  it('writes nothing for the stored arrangement', () => {
    expect(planChanges(CATEGORIES, layout())).toEqual([])
  })

  it('gives a moved category a key between its new neighbours, and only that one', () => {
    const changes = planChanges(CATEGORIES, withGroups({ '1': ['12', '10', '11'] }))
    expect(changes).toHaveLength(1)
    expect(changes[0].id).toBe(12)
    expect(changes[0].data._order! < 'a1').toBe(true)
    expect(changes[0].data.parent).toBeUndefined()
  })

  it('sets the parent of a category moved into another group, keeping a key that already fits', () => {
    const changes = planChanges(CATEGORIES, withGroups({ '1': ['10', '11'], '3': ['12'] }))
    expect(changes).toEqual([{ id: 12, data: { parent: 3 } }])
  })

  it('orders a category moved between categories of another group', () => {
    const [change] = planChanges(CATEGORIES, withGroups({ '1': ['10', '21', '11', '12'], '2': [] }))
    expect(change.id).toBe(21)
    expect(change.data.parent).toBe(1)
    expect(change.data._order! > 'a1' && change.data._order! < 'a2').toBe(true)
  })

  it('moves a group to another column', () => {
    const changes = planChanges(CATEGORIES, { ...layout(), columns: { ...layout().columns, '1': ['1'], '4': ['2'] } })
    expect(changes).toEqual([{ id: 2, data: { menuColumn: '4' } }])
  })

  it('places a category taken out of the stray ones into a group', () => {
    const changes = planChanges(CATEGORIES, withGroups({ '3': ['40'], [NOT_IN_GROUP]: [] }))
    expect(changes).toEqual([{ id: 40, data: { parent: 3 } }])
  })

  it('keeps several moved entries in their new order', () => {
    const changes = planChanges(CATEGORIES, withGroups({ '1': ['12', '11', '10'] }))
    const key = (id: number) => changes.find((change) => change.id === id)?.data._order ?? CATEGORIES.find((c) => c.id === id)!._order!
    expect(changes).toHaveLength(2)
    expect(key(12) < key(11) && key(11) < key(10)).toBe(true)
  })
})

describe('category rules', () => {
  const t = (key: string) => key
  const request = (parentOfParent: unknown, children: number) => {
    const find = vi.fn().mockResolvedValue({ docs: parentOfParent === undefined ? [] : [{ parent: parentOfParent }] })
    const count = vi.fn().mockResolvedValue({ totalDocs: children })
    return { find, count, req: { payload: { find, count }, t } }
  }
  const validate = topLevelParent('project-categories')
  const run = (value: unknown, id: number | undefined, req: unknown) => validate(value as never, { id, req } as never)

  it('accepts no parent without querying', async () => {
    const { find, req } = request(null, 0)
    expect(await run(null, 5, req)).toBe(true)
    expect(find).not.toHaveBeenCalled()
  })

  it('accepts a top-level group as parent', async () => {
    expect(await run(1, 10, request(null, 0).req)).toBe(true)
  })

  it('rejects a category as parent', async () => {
    expect(await run(10, 40, request(1, 0).req)).toBe('categories:parentNotGroup')
  })

  it('rejects the document itself as parent', async () => {
    expect(await run(10, 10, request(null, 0).req)).toBe('categories:parentNotGroup')
  })

  it('rejects a parent for a group that has categories', async () => {
    const { count, req } = request(null, 2)
    expect(await run(1, 2, req)).toBe('categories:groupHasCategories')
    expect(count.mock.calls[0][0].where).toEqual({ parent: { equals: 2 } })
  })

  it('offers only top-level groups other than the document itself', () => {
    expect(groupsOnly({ id: 7 } as never)).toEqual({ and: [{ parent: { exists: false } }, { id: { not_equals: 7 } }] })
    expect(groupsOnly({} as never)).toEqual({ parent: { exists: false } })
  })

  it('blocks deleting a group that still has categories', async () => {
    const args = (children: number) =>
      ({ collection: { slug: 'project-categories' }, id: 1, req: request(null, children).req }) as never
    await expect(keepGroupsWithCategories(args(3))).rejects.toThrow('categories:deleteGroupWithCategories')
    await expect(keepGroupsWithCategories(args(0))).resolves.toBeUndefined()
  })
})
