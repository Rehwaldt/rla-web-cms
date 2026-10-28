import { describe, expect, it } from 'vitest'
import { entriesFor, selectFor } from '@/search/sources'
import { fold, lexicalToPlainText, textSearchConfig, toPrefixQuery } from '@/search/text'

const richText = (...paragraphs: string[]) => ({
  root: {
    type: 'root',
    children: paragraphs.map((text) => ({ type: 'paragraph', children: [{ type: 'text', text }] })),
  },
})

describe('lexicalToPlainText', () => {
  it('keeps the words of neighbouring paragraphs apart', () => {
    expect(lexicalToPlainText(richText('Ein Park.', 'Am  Fluss'))).toBe('Ein Park. Am Fluss')
  })

  it('reads the text inside links and lists', () => {
    const value = {
      root: {
        children: [
          {
            type: 'list',
            children: [
              { type: 'listitem', children: [{ type: 'link', children: [{ type: 'text', text: 'Bahnhof' }] }] },
              { type: 'listitem', children: [{ type: 'text', text: 'Platz' }] },
            ],
          },
        ],
      },
    }
    expect(lexicalToPlainText(value)).toBe('Bahnhof Platz')
  })

  it('is empty without rich text', () => {
    expect(lexicalToPlainText(null)).toBe('')
  })
})

describe('fold', () => {
  it('drops case and accents', () => {
    expect(fold('Dürrenberg Čeština')).toBe('durrenberg cestina')
  })
})

describe('toPrefixQuery', () => {
  it('asks for every word as a word start', () => {
    expect(toPrefixQuery('Spiel  platz')).toBe('Spiel:* & platz:*')
  })

  it('keeps only letters and digits, so the tsquery is always valid', () => {
    expect(toPrefixQuery("Park & (Garten) | !'x'")).toBe('Park:* & Garten:* & x:*')
    expect(toPrefixQuery('&|!')).toBe('')
  })
})

describe('textSearchConfig', () => {
  it('stems German and English only', () => {
    expect(['de', 'en', 'cs', 'zh'].map(textSearchConfig)).toEqual(['german', 'english', 'simple', 'simple'])
  })
})

describe('entriesFor', () => {
  const project = (language: string, overrides: Record<string, unknown> = {}) => ({
    id: 7,
    _status: 'published',
    visibleIn: ['de', 'en'],
    name: `Park ${language}`,
    place: 'Dresden',
    description: richText('Ein grüner Park.'),
    previewImage: 3,
    code: 'PKD',
    ...overrides,
  })

  it('gives one entry per language the document is listed in', () => {
    const entries = entriesFor('projects', { de: project('de'), en: project('en'), cs: project('cs') })
    expect(entries.map((entry) => entry.language)).toEqual(['de', 'en'])
    expect(entries[0]).toEqual({
      docCollection: 'projects',
      docId: 7,
      language: 'de',
      title: 'Park de',
      secondary: 'Dresden',
      body: 'Ein grüner Park.',
      image: 3,
      code: 'PKD',
      category: null,
      titleFolded: 'park de',
      secondaryFolded: 'dresden',
      bodyFolded: 'ein gruner park.',
    })
  })

  it('gives nothing while the document is unpublished', () => {
    expect(entriesFor('projects', { de: project('de', { _status: 'draft' }) })).toEqual([])
  })

  it('indexes topics, which have no visibleIn, in every language', () => {
    const topic = { id: 1, _status: 'published', name: 'Wasser', description: null, image: null }
    expect(entriesFor('topics', { de: topic, zh: topic }).map((entry) => entry.language)).toEqual(['de', 'zh'])
  })

  it('finds an article by the journal or book it appeared in', () => {
    const article = { id: 2, _status: 'published', visibleIn: ['de'], title: 'Der Artikel', subtitle: 'Teil 1', publishedIn: { title: 'Das Buch', subtitle: null }, authors: 'A. B.', category: { id: 4 } }
    expect(entriesFor('publications', { de: article })[0]).toMatchObject({ title: 'Der Artikel', body: 'Teil 1 Das Buch', secondary: 'A. B.', category: 4 })
  })

  it('pictures news with the preview image, else the hero image, else the first of the gallery', () => {
    const news = (images: Record<string, unknown>) => ({ id: 5, _status: 'published', visibleIn: ['de'], title: 'Neu', content: null, ...images })
    const image = (images: Record<string, unknown>) => entriesFor('news', { de: news(images) })[0].image
    expect(image({ previewImage: 1, heroImage: 2, gallery: [3] })).toBe(1)
    expect(image({ previewImage: null, heroImage: 2, gallery: [3] })).toBe(2)
    expect(image({ previewImage: null, heroImage: null, gallery: [3, 4] })).toBe(3)
    expect(image({ previewImage: null, heroImage: null, gallery: [] })).toBe(null)
  })
})

describe('selectFor', () => {
  it('reads the status, and visibleIn where the collection has it', () => {
    expect(Object.keys(selectFor('awards'))).toEqual(['name', 'issuer', 'description', 'image', '_status', 'visibleIn'])
    expect(Object.keys(selectFor('topics'))).toEqual(['name', 'description', 'image', '_status'])
  })
})
