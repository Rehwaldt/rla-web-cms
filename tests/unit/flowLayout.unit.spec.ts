import { describe, expect, it } from 'vitest'
import { dropIndex, modifiersFor, rendersOnWebsite, stepSize, toggleModifier } from '@/fields/flowLayout'

describe('stepSize', () => {
  it('steps through the size scale and stops at both ends', () => {
    expect(stepSize('one3', 1)).toBe('one2')
    expect(stepSize('one3', -1)).toBe('one4')
    expect(stepSize('full', 1)).toBe('full')
    expect(stepSize('one6', -1)).toBe('one6')
  })

  it('treats an unknown size as a third', () => {
    expect(stepSize(undefined, 1)).toBe('one2')
    expect(stepSize('bogus', 0)).toBe('one3')
  })
})

describe('toggleModifier', () => {
  it('adds and removes a modifier, keeping the canonical order', () => {
    expect(toggleModifier(['topmargin'], 'clear')).toEqual(['clear', 'topmargin'])
    expect(toggleModifier(['clear', 'topmargin'], 'clear')).toEqual(['topmargin'])
    expect(toggleModifier(null, 'crop')).toEqual(['crop'])
  })
})

describe('modifiersFor', () => {
  it('offers the separator on text blocks only', () => {
    expect(modifiersFor('text')).toContain('separator')
    expect(modifiersFor('image')).not.toContain('separator')
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

describe('rendersOnWebsite', () => {
  it('leaves news references out of the grid', () => {
    expect(rendersOnWebsite('newsReference')).toBe(false)
    expect(rendersOnWebsite('image')).toBe(true)
  })
})
