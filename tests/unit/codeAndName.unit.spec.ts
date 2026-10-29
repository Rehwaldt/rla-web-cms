import type { FieldHook } from 'payload'
import { describe, expect, it } from 'vitest'
import { buildCodeAndName, codeAndNameField } from '@/fields/projects/codeAndName'

describe('buildCodeAndName', () => {
  it('joins code and name in every locale', () => {
    expect(buildCodeAndName('BAF', { de: 'Buga Erfurt', en: 'Buga Erfurt (en)', zh: '埃尔福特', cs: 'Erfurt' })).toEqual({
      de: 'BAF · Buga Erfurt',
      en: 'BAF · Buga Erfurt (en)',
      zh: 'BAF · 埃尔福特',
      cs: 'BAF · Erfurt',
    })
  })

  it("falls back like the website where a locale's name is missing", () => {
    expect(buildCodeAndName('BAF', { de: 'Nur Deutsch', en: '' })).toEqual({
      de: 'BAF · Nur Deutsch',
      en: 'BAF · Nur Deutsch',
      zh: 'BAF · Nur Deutsch',
      cs: 'BAF · Nur Deutsch',
    })
    expect(buildCodeAndName('BAF', { de: null, en: 'Only English' })).toMatchObject({ de: 'BAF · Only English' })
    expect(buildCodeAndName('BAF', { de: 'Deutsch', en: 'English' })).toMatchObject({ cs: 'BAF · English' })
  })

  it('uses the name alone without a code and the code alone without a name', () => {
    expect(buildCodeAndName(null, { de: 'Ohne Kürzel' })).toMatchObject({ de: 'Ohne Kürzel', en: 'Ohne Kürzel' })
    expect(buildCodeAndName('BAF', {})).toMatchObject({ de: 'BAF', zh: 'BAF' })
    expect(buildCodeAndName('  ', { de: ' ' })).toMatchObject({ de: null, en: null })
  })
})

describe('codeAndName hook', () => {
  const hook = (codeAndNameField as { hooks: { beforeChange: FieldHook[] } }).hooks.beforeChange[0]
  const run = (locale: string, siblingData: Record<string, unknown>, stored?: Record<string, unknown>) => {
    const siblingDocWithLocales = stored ?? {}
    const value = hook({ req: { locale }, siblingData, siblingDocWithLocales } as never)
    return { value, all: siblingDocWithLocales.codeAndName }
  }

  it("rebuilds every locale from the saved locale's data and the stored names", () => {
    const { value, all } = run('en', { code: 'BAF', name: 'Garden show' }, { code: 'BAF', name: { de: 'Gartenschau' } })
    expect(value).toBe('BAF · Garden show')
    expect(all).toMatchObject({ de: 'BAF · Gartenschau', en: 'BAF · Garden show', zh: 'BAF · Garden show' })
  })

  it('updates every locale when only the code changes', () => {
    const { all } = run('de', { code: 'BAX' }, { code: 'BAF', name: { de: 'Gartenschau', en: 'Garden show' } })
    expect(all).toMatchObject({ de: 'BAX · Gartenschau', en: 'BAX · Garden show' })
  })

  it('fills the other locales on create', () => {
    const { value, all } = run('de', { code: 'BAF', name: 'Gartenschau' })
    expect(value).toBe('BAF · Gartenschau')
    expect(all).toMatchObject({ en: 'BAF · Gartenschau', cs: 'BAF · Gartenschau' })
  })
})
