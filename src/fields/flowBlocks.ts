// Vocabulary of the "flow" grid: its sizes, its modifiers and its block types. The schema
// (src/fields/flow.ts), the visual editor (src/components/cms/FlowField) and the importer
// (src/migration/plan/parsers.ts) all read it from here. Plain data, so the client can import it.
// Size and modifier values double as the CSS class names in flow.css.

export const FLOW_SIZES = ['one6', 'one4', 'one3', 'one2', 'two3', 'full'] as const
export type FlowSize = (typeof FLOW_SIZES)[number]

// Fractions read the same in every language; "full" is translated where it's shown.
export const SIZE_LABELS: Record<Exclude<FlowSize, 'full'>, string> = {
  one6: '1/6',
  one4: '1/4',
  one3: '1/3',
  one2: '1/2',
  two3: '2/3',
}

export const SIZE_COLUMNS: Record<FlowSize, number> = {
  one6: 2,
  one4: 3,
  one3: 4,
  one2: 6,
  two3: 8,
  full: 12,
}

export const FLOW_MODIFIERS = ['clear', 'right', 'center', 'crop', 'topmargin', 'separator'] as const
export type FlowModifier = (typeof FLOW_MODIFIERS)[number]

type FlowBlock = {
  /** The field holding the document the block points at, and that document's collection. */
  reference: { field: string; collection: 'media' | 'topics' } | null
  defaultSize: FlowSize
  /** In the order of FLOW_MODIFIERS. */
  modifiers: readonly FlowModifier[]
}

// Crop needs an image to cut; a separator opens a new section, which only a text does.
const IMAGE_MODIFIERS = ['clear', 'right', 'center', 'crop', 'topmargin'] as const
const TEXT_MODIFIERS = ['clear', 'right', 'center', 'topmargin', 'separator'] as const

export const FLOW_BLOCKS = {
  image: {
    reference: { field: 'image', collection: 'media' },
    defaultSize: 'one3',
    modifiers: IMAGE_MODIFIERS,
  },
  text: {
    reference: null,
    defaultSize: 'one2',
    modifiers: TEXT_MODIFIERS,
  },
  topicReference: {
    reference: { field: 'topic', collection: 'topics' },
    defaultSize: 'one3',
    modifiers: IMAGE_MODIFIERS,
  },
} as const satisfies Record<string, FlowBlock>

export type FlowBlockType = keyof typeof FLOW_BLOCKS
export const FLOW_BLOCK_TYPES = Object.keys(FLOW_BLOCKS) as FlowBlockType[]

/** The block types that point at another document. */
export type ReferencingBlockType = {
  [Type in FlowBlockType]: (typeof FLOW_BLOCKS)[Type]['reference'] extends null ? never : Type
}[FlowBlockType]

/** The collections a flow block can point at. */
export type FlowCollection = (typeof FLOW_BLOCKS)[ReferencingBlockType]['reference']['collection']

export const isFlowBlockType = (value: unknown): value is FlowBlockType =>
  typeof value === 'string' && Object.hasOwn(FLOW_BLOCKS, value)

/** What's known about a block type; undefined for a value that isn't one. */
export const flowBlock = (blockType: unknown): FlowBlock | undefined =>
  isFlowBlockType(blockType) ? FLOW_BLOCKS[blockType] : undefined

export const isFlowSize = (value: unknown): value is FlowSize =>
  typeof value === 'string' && (FLOW_SIZES as readonly string[]).includes(value)

export const isFlowModifier = (value: unknown): value is FlowModifier =>
  typeof value === 'string' && (FLOW_MODIFIERS as readonly string[]).includes(value)

// A block without a valid size spans the row, as the website sizes one without a grid class.
export const sizeOf = (value: unknown): FlowSize => (isFlowSize(value) ? value : 'full')

/** The next larger (`step` > 0) or smaller size, clamped to the ends of the scale. */
export const stepSize = (size: unknown, step: number): FlowSize => {
  const next = Math.min(FLOW_SIZES.length - 1, Math.max(0, FLOW_SIZES.indexOf(sizeOf(size)) + step))
  return FLOW_SIZES[next]
}

/** Adds the modifier if missing, removes it if present. Keeps the canonical order. */
export const toggleModifier = (modifiers: readonly string[] | null | undefined, modifier: FlowModifier) => {
  const current = new Set(modifiers ?? [])
  if (current.has(modifier)) current.delete(modifier)
  else current.add(modifier)
  return FLOW_MODIFIERS.filter((m) => current.has(m))
}

/**
 * Where a dragged row lands. `targetIndex` is the row it was dropped on, `after` whether it was
 * dropped on that row's trailing half. Returns the index to pass to a "move row" operation, or
 * null when the drop leaves the order unchanged.
 */
export const dropIndex = (fromIndex: number, targetIndex: number, after: boolean): number | null => {
  let to = after ? targetIndex + 1 : targetIndex
  if (to > fromIndex) to -= 1
  return to === fromIndex ? null : to
}
