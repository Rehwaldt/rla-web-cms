import { describe, expect, it } from 'vitest'
import { byLocale, docPlan } from '@/migration/plan/build'
import { cleanProjectCode, createPlanContext } from '@/migration/plan/context'
import { ref } from '@/migration/plan/types'
import { Report } from '@/migration/report'
import { filesRoot, harness, snapshot } from './fixtures'

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

  describe('read-more marker', () => {
    const html = (value: string) => (harness().ctx.richText(value, 'x') as { html: string }).html

    it('splits the paragraph at the marker with a horizontal rule', () => {
      expect(html('<p>a.<!--RM--><br>b</p>')).toBe('<p>a.</p><hr><p>b</p>')
      expect(html('<p>a</p>\n<p><!--RM-->b</p>')).toBe('<p>a</p>\n<hr><p>b</p>')
      expect(html('<p>a.<!--RM--></p>\n<p>b</p>')).toBe('<p>a.</p><hr>\n<p>b</p>')
    })

    it('replaces a paragraph holding only the marker', () => {
      expect(html('<p>a</p><p><!--RM--></p><p>b</p>')).toBe('<p>a</p><hr><p>b</p>')
    })

    it('wraps loose text around the marker in paragraphs', () => {
      expect(html('a<br>b. <!--RM-->c<br>d')).toBe('<p>a<br>b. </p><hr><p>c<br>d</p>')
      expect(html('<p>a</p><!--RM--> <p>b</p>')).toBe('<p>a</p><hr><p>b</p>')
    })

    it('reports each converted marker and leaves other comments alone', () => {
      const { ctx, issues } = harness()
      ctx.richText('<p>a<!--RM-->b</p>', 'project 1')
      expect(issues('Read-more marker (converted to a horizontal rule)')).toEqual(['project 1'])
      expect(ctx.richText('<p>a<!-- note --></p>', 'x')).toEqual({ html: '<p>a<!-- note --></p>' })
    })
  })

  it('flags structured HTML', () => {
    const { ctx, issues } = harness()
    ctx.richText('<p>x</p><table></table>', 'x')
    expect(issues('Structured or styled HTML in rich text (check by hand)')).toEqual(['x'])
  })

  describe('links', () => {
    // A converter that turns `<a>{url}</a>` into one link to that URL.
    const linkTo = (url: string) => {
      const report = new Report()
      const ctx = createPlanContext(snapshot({ projekte: [{ ID: 7, kuerzel: 'CWD' }] }), report, filesRoot(), (html) => ({
        root: {
          type: 'root',
          children: [
            {
              type: 'paragraph',
              children: [{ type: 'link', fields: { linkType: 'custom', newTab: false, url: html.replace(/<\/?a>/g, '') } }],
            },
          ],
        },
      }))
      const result = ctx.richText(`<a>${url}</a>`, 'news 1') as { root: { children: { children: { fields: unknown }[] }[] } }
      return { fields: result.root.children[0].children[0].fields, summary: report.summary() }
    }

    it('turns old project URLs into internal links to the project', () => {
      expect(linkTo('projekt.php?lang=en&proj=cwd').fields).toEqual({
        linkType: 'internal',
        newTab: false,
        doc: { relationTo: 'projects', value: ref('projects', 7) },
      })
    })

    it('rewrites old pages and bare e-mail addresses, and reports it', () => {
      expect(linkTo('aktuell.php?lang=en').fields).toMatchObject({ linkType: 'custom', url: '/news' })
      const { fields, summary } = linkTo('mail@rehwaldt.de')
      expect(fields).toMatchObject({ url: 'mailto:mail@rehwaldt.de' })
      expect(summary).toContain('Legacy link in rich text (rewritten): 1')
    })

    it('reports URLs Lexical would encode, and leaves valid ones alone', () => {
      expect(linkTo('https://example.com/a?b=c').summary).not.toContain('check by hand')
      expect(linkTo('../plan.pdf').summary).toContain('Link URL Lexical would encode on every save (check by hand): 1')
    })
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
