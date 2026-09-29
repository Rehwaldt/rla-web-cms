import { describe, expect, it } from 'vitest'
import { byLocale, docPlan } from '@/migration/plan/build'
import { cleanProjectCode } from '@/migration/plan/context'
import { ref } from '@/migration/plan/types'
import { harness } from './fixtures'

describe('plain', () => {
  it('passes plain text through and joins lines unless multiline', () => {
    const { ctx } = harness()
    expect(ctx.plain('a\n  b', 'x')).toBe('a b')
    expect(ctx.plain('a\nb', 'x', { multiline: true })).toBe('a\nb')
    expect(ctx.plain(null, 'x')).toBeNull()
  })

  it('strips HTML, keeping breaks as separators, and reports it', () => {
    const { ctx, issues } = harness()
    expect(ctx.plain('<p>a &amp; b</p><p>c<br>d</p>', 'x')).toBe('a & b / c / d')
    expect(ctx.plain('<p>a</p><p>b</p>', 'x', { multiline: true })).toBe('a\nb')
    // The legacy data also uses the invalid closing form.
    expect(ctx.plain('a</br>b<br />c', 'x')).toBe('a / b / c')
    expect(issues('HTML in a plain-text field (converted)')).toHaveLength(3)
  })

  it('decodes entities without reporting HTML', () => {
    const { ctx, issues } = harness()
    expect(ctx.plain('M&uuml;ller', 'x')).toBe('Müller')
    expect(issues('HTML in a plain-text field (converted)')).toEqual([])
  })
})

describe('richText', () => {
  it('wraps plain text in an escaped paragraph', () => {
    const { ctx } = harness()
    expect(ctx.richText('a < b\nc', 'x')).toEqual({ html: '<p>a &lt; b<br>c</p>' })
  })

  it('flags old *.php links and structured HTML', () => {
    const { ctx, issues } = harness()
    ctx.richText('<p><a href="projekt.php?id=1">x</a></p><table></table>', 'x')
    expect(issues('Link to an old *.php URL in rich text')).toEqual(['x: href="projekt.php?id=1"'])
    expect(issues('Structured or styled HTML in rich text (check by hand)')).toEqual(['x'])
  })
})

describe('project codes', () => {
  it('treats the placeholder code zz as no code', () => {
    expect(cleanProjectCode('ZZ')).toBeNull()
    expect(cleanProjectCode(null)).toBeNull()
    expect(cleanProjectCode('ABC')).toBe('ABC')
  })

  it('resolves codes case-insensitively and ignores placeholder codes', () => {
    const { ctx } = harness({ projekte: [{ ID: 1, kuerzel: 'Abc' }, { ID: 2, kuerzel: 'zz' }] })
    expect(ctx.projectRef(' aBC ', 'x')).toEqual(ref('projects', 1))
    expect(ctx.projectKeyByCode('zz')).toBeNull()
  })
})

describe('usedImageIds', () => {
  it('lists each referenced file once, by its canonical id', () => {
    const { ctx } = harness(
      {
        bilder: [
          { index: 8, pfad: 'b.jpg' },
          { index: 2, pfad: 'a.jpg' },
          { index: 4, pfad: 'a.jpg' },
        ],
      },
      ['a.jpg', 'b.jpg'],
    )
    ctx.imageRef(8, 'x')
    ctx.imageRef(4, 'x')
    ctx.imageRef(2, 'x')
    expect(ctx.usedImageIds()).toEqual([2, 8])
  })
})

describe('docPlan', () => {
  it('splits German into data and leaves empty locale values out', () => {
    const plan = docPlan({
      collection: 'news',
      legacyId: 3,
      status: 'draft',
      shared: { code: null },
      perLocale: byLocale({ title: { de: 'Titel', en: 'Title', zh: null }, tags: { de: [], en: ['a'] } }),
    })
    expect(plan).toEqual({
      collection: 'news',
      key: '3',
      match: { field: 'legacyId', value: 3 },
      status: 'draft',
      data: { legacyId: 3, code: null, title: 'Titel' },
      localized: { en: { title: 'Title', tags: ['a'] } },
      filePath: undefined,
    })
  })
})
