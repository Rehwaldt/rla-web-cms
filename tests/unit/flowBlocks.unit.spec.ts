import { describe, expect, it } from 'vitest'
import {
  FLOW_BLOCKS,
  FLOW_BLOCK_TYPES,
  FLOW_MODIFIERS,
  dropIndex,
  flowBlock,
  sizeOf,
  stepSize,
  toggleModifier,
} from '@/fields/flowBlocks'

describe('block types', () => {
  it('offers crop only where there is an image, and the separator only on text', () => {
    expect(FLOW_BLOCKS.text.modifiers).toContain('separator')
    expect(FLOW_BLOCKS.text.modifiers).not.toContain('crop')
    for (const blockType of ['image', 'topicReference'] as const) {
      expect(FLOW_BLOCKS[blockType].modifiers).toContain('crop')
      expect(FLOW_BLOCKS[blockType].modifiers).not.toContain('separator')
    }
  })

  it('lists the modifiers of every block type in the canonical order', () => {
    for (const blockType of FLOW_BLOCK_TYPES) {
      const { modifiers } = FLOW_BLOCKS[blockType]
      expect(modifiers).toEqual(FLOW_MODIFIERS.filter((modifier) => modifiers.includes(modifier as never)))
    }
  })

  it('knows nothing about a value that is not a block type', () => {
    expect(flowBlock('image')).toBe(FLOW_BLOCKS.image)
    expect(flowBlock('toString')).toBeUndefined()
    expect(flowBlock(undefined)).toBeUndefined()
  })
})

describe('sizeOf', () => {
  it('treats an unknown size as full width', () => {
    expect(sizeOf('one4')).toBe('one4')
    expect(sizeOf('bogus')).toBe('full')
    expect(sizeOf(undefined)).toBe('full')
  })
})

describe('stepSize', () => {
  it('steps through the size scale and stops at both ends', () => {
    expect(stepSize('one3', 1)).toBe('one2')
    expect(stepSize('one3', -1)).toBe('one4')
    expect(stepSize('full', 1)).toBe('full')
    expect(stepSize('one6', -1)).toBe('one6')
  })

  it('steps an unknown size from full width, as it is drawn', () => {
    expect(stepSize(undefined, 1)).toBe('full')
    expect(stepSize('bogus', -1)).toBe('two3')
  })
})

describe('toggleModifier', () => {
  it('adds and removes a modifier, keeping the canonical order', () => {
    expect(toggleModifier(['topmargin'], 'clear')).toEqual(['clear', 'topmargin'])
    expect(toggleModifier(['clear', 'topmargin'], 'clear')).toEqual(['topmargin'])
    expect(toggleModifier(null, 'crop')).toEqual(['crop'])
  })
})

describe('dropIndex', () => {
  it('moves a row before or after the target', () => {
    expect(dropIndex(4, 0, false)).toBe(0)
    expect(dropIndex(0, 3, true)).toBe(3)
    expect(dropIndex(0, 3, false)).toBe(2)
  })

  it('returns null when the drop keeps the order', () => {
    expect(dropIndex(2, 2, false)).toBeNull()
    expect(dropIndex(2, 1, true)).toBeNull()
    expect(dropIndex(2, 3, false)).toBeNull()
  })
})
