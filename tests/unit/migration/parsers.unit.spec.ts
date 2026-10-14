import { describe, expect, it } from 'vitest'
import {
  flowBlocks,
  flowTextElementIds,
  localesWithFlag,
  localesWithValue,
  parseLinks,
  resolveCountry,
} from '@/migration/plan/parsers'
import { ref } from '@/migration/plan/types'
import { harness } from './fixtures'

const projects = [{ ID: 7, kuerzel: 'PRK' }]

describe('localesWithFlag / localesWithValue', () => {
  it('reads the legacy Czech suffix `cz` as locale cs', () => {
    const row = { anzeige_de: 1, anzeige_en: 0, anzeige_zh: null, anzeige_cz: '1' }
    expect(localesWithFlag(row, 'anzeige')).toEqual(['de', 'cs'])
  })

  it('treats any non-null value as visible', () => {
    const row = { titel_de: 'x', titel_en: null, titel_zh: 0, titel_cz: null }
    expect(localesWithValue(row, 'titel')).toEqual(['de', 'zh'])
  })
})

describe('parseLinks', () => {
  it('maps project and external links', () => {
    const { ctx } = harness({ projekte: projects })
    expect(parseLinks(ctx, 'Park;proj:prk|Site;https://example.com', 'p')).toEqual([
      { kind: 'project', label: 'Park', project: ref('projects', 7) },
      { kind: 'external', label: 'Site', url: 'https://example.com' },
    ])
  })

  it('returns nothing for empty values and skips empty entries', () => {
    const { ctx } = harness()
    expect(parseLinks(ctx, null, 'p')).toEqual([])
    expect(parseLinks(ctx, '|A;mailto:a@b.de|', 'p')).toEqual([
      { kind: 'external', label: 'A', url: 'mailto:a@b.de' },
    ])
  })

  it('drops malformed entries and unknown projects, keeps URLs without protocol', () => {
    const { ctx, issues } = harness({ projekte: projects })
    const links = parseLinks(ctx, 'no separator|A;b;c|Empty;|Gone;proj:XYZ|Bare;www.example.com', 'p')
    expect(links).toEqual([{ kind: 'external', label: 'Bare', url: 'www.example.com' }])
    expect(issues('Malformed link entry (dropped)')).toHaveLength(3)
    expect(issues('Reference to an unknown project code (dropped)')).toEqual(['p link: "XYZ"'])
    expect(issues('Link URL without protocol (kept as is)')).toEqual(['p: "www.example.com"'])
  })

  it('allows an empty label', () => {
    const { ctx } = harness()
    expect(parseLinks(ctx, ';https://example.com', 'p')).toEqual([
      { kind: 'external', label: null, url: 'https://example.com' },
    ])
  })
})

describe('flowBlocks', () => {
  const tables = {
    bilder: [
      { index: 3, pfad: 'prk/a.jpg' },
      { index: 5, pfad: 'prk/a.jpg' },
      { index: 9, pfad: 'prk/missing.jpg' },
    ],
    textelemente: [{ index: 1, titel_de: 'Titel', titel_en: 'Title', text_de: 'Text', text_en: null }],
    aktuell: [{ index: 4 }],
    themen: [{ index: 2 }],
  }
  const plan = (value: string, locale: 'de' | 'en' | 'zh' = 'de', fallback = false) => {
    const h = harness(tables, ['prk/a.jpg'])
    return { ...h, blocks: flowBlocks(h.ctx, value, 'p', locale, { fallback, rowIdPrefix: 'p/flow' }) }
  }

  it('maps every item kind with its size and modifiers', () => {
    const { blocks } = plan('one2 clear:3|full center:a4|f2|textelement separator one4:t1')
    expect(blocks.map(({ id: _id, ...block }) => block)).toEqual([
      { blockType: 'image', size: 'one2', modifiers: ['clear'], image: ref('media', 3) },
      { blockType: 'newsReference', size: 'full', modifiers: ['center'], news: ref('news', 4) },
      { blockType: 'topicReference', size: 'one3', modifiers: [], topic: ref('topics', 2) },
      { blockType: 'text', size: 'one4', modifiers: ['separator'], title: 'Titel', body: { html: '<p>Text</p>' } },
    ])
  })

  it('gives every row a stable id that is the same across locales', () => {
    const de = plan('3|t1', 'de').blocks
    const en = plan('3|t1', 'en').blocks
    expect(de.map((block) => block.id)).toEqual(en.map((block) => block.id))
    expect(new Set(de.map((block) => block.id)).size).toBe(2)
  })

  it('points duplicate image rows at the lowest id with the same file', () => {
    expect(plan('5').blocks[0].image).toEqual(ref('media', 3))
  })

  it('drops unknown references, missing files and bad tokens, and reports them', () => {
    const { blocks, issues } = plan('9|8|a99|f99|t99|one3:x1|huge separator:3')
    expect(blocks).toHaveLength(1)
    expect(blocks[0].modifiers).toEqual([])
    expect(issues('Image file missing on disk (dropped)')).toHaveLength(1)
    expect(issues('Reference to an unknown image id (dropped)')).toHaveLength(1)
    expect(issues('Flow references an unknown news item (dropped)')).toHaveLength(1)
    expect(issues('Flow references an unknown topic (dropped)')).toHaveLength(1)
    expect(issues('Flow references an unknown text element (dropped)')).toHaveLength(1)
    expect(issues('Flow item without a valid reference (dropped)')).toHaveLength(1)
    expect(issues('Unknown flow layout token (dropped)')).toEqual(['p: "huge" in "huge separator:3"'])
    expect(issues('Flow modifier not allowed on this block type (dropped)')).toEqual([
      'p: "separator" in "huge separator:3"',
    ])
  })

  it('keeps only the modifiers a block type allows, in the canonical order', () => {
    const { blocks, issues } = plan('topmargin crop clear:3|topmargin crop clear separator:t1')
    expect(blocks.map((block) => block.modifiers)).toEqual([
      ['clear', 'crop', 'topmargin'],
      ['clear', 'topmargin', 'separator'],
    ])
    expect(issues('Flow modifier not allowed on this block type (dropped)')).toEqual([
      'p: "crop" in "topmargin crop clear separator:t1"',
    ])
  })

  it("sizes an item without a size as its block type's default", () => {
    expect(plan('3|t1|a4').blocks.map((block) => block.size)).toEqual(['one3', 'one2', 'one3'])
  })

  it('uses only the requested locale unless fallback is on', () => {
    expect(plan('t1', 'en').blocks[0]).toMatchObject({ title: 'Title', body: null })
    expect(plan('t1', 'zh').blocks[0]).toMatchObject({ title: null, body: null })
    expect(plan('t1', 'zh', true).blocks[0]).toMatchObject({ title: 'Title', body: { html: '<p>Text</p>' } })
  })
})

describe('flowTextElementIds', () => {
  it('finds text element ids with or without layout tokens', () => {
    expect(flowTextElementIds('t1|one2:t22|3|a4| t5 ')).toEqual([1, 22, 5])
    expect(flowTextElementIds(null)).toEqual([])
  })
})

describe('resolveCountry', () => {
  it('maps country names in every language', () => {
    const { ctx } = harness()
    const row = { land_de: 'Deutschland', land_en: 'Germany', land_zh: '德国', land_cz: 'Německo' }
    expect(resolveCountry(ctx, row, 'p')).toEqual({
      country: 'DE',
      region: { de: null, en: null, zh: null, cs: null },
    })
  })

  it('keeps regions as region text and derives the country', () => {
    const { ctx } = harness()
    expect(resolveCountry(ctx, { land_de: 'Sachsen', land_en: 'Germany' }, 'p')).toEqual({
      country: 'DE',
      region: { de: 'Sachsen', en: null, zh: null, cs: null },
    })
  })

  it('keeps the first country on conflicts and reports unknown values', () => {
    const { ctx, issues } = harness()
    const row = { land_de: 'China', land_en: 'Poland', land_cz: 'Atlantis' }
    expect(resolveCountry(ctx, row, 'p').country).toBe('CN')
    expect(issues('Conflicting countries across languages (first one kept)')).toEqual(['p: de=CN, en=PL'])
    expect(issues('Unknown country value (dropped)')).toEqual(['p [cs]: "Atlantis"'])
  })
})
