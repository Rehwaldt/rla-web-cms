// Layout vocabulary of the "flow" grid, shared by the schema (src/fields/flow.ts) and the visual
// editor (src/components/flow). The values double as the CSS class names in flow.css.

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

export const MODIFIER_LABELS: Record<FlowModifier, { en: string; de: string }> = {
  clear: { en: 'Clear (start a new row)', de: 'Neue Zeile' },
  right: { en: 'Right (push to the right edge)', de: 'Rechtsbündig (an den rechten Rand)' },
  center: { en: 'Center', de: 'Zentriert' },
  crop: { en: 'Crop (fixed height, cover)', de: 'Zuschneiden (feste Höhe, füllend)' },
  topmargin: { en: 'Top margin (extra space above)', de: 'Abstand oben (zusätzlicher Abstand darüber)' },
  separator: { en: 'Separator (full-width divider row)', de: 'Trennlinie (Trennzeile über die volle Breite)' },
}

// Only text blocks can open a separator row.
export const modifiersFor = (blockType: string): FlowModifier[] =>
  FLOW_MODIFIERS.filter((modifier) => modifier !== 'separator' || blockType === 'text')

// The website's flow renderer (1_php/models/flow.php) skips news references, so they take no
// place in the grid. The editor lists them apart instead of previewing a layout nobody sees.
export const rendersOnWebsite = (blockType: string) => blockType !== 'newsReference'

export const isFlowSize = (value: unknown): value is FlowSize =>
  typeof value === 'string' && (FLOW_SIZES as readonly string[]).includes(value)

/** The next larger (`step` > 0) or smaller size, clamped to the ends of the scale. */
export const stepSize = (size: unknown, step: number): FlowSize => {
  const index = isFlowSize(size) ? FLOW_SIZES.indexOf(size) : FLOW_SIZES.indexOf('one3')
  const next = Math.min(FLOW_SIZES.length - 1, Math.max(0, index + step))
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
