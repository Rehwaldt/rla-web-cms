import path from 'path'
import { describe, expect, it } from 'vitest'
import { planExcursions } from '@/migration/plan/excursions'
import { ref } from '@/migration/plan/types'
import type { WordPressSnapshot, WpMedia, WpPost } from '@/migration/wordpress'
import { filesRoot, harness, projectRow } from './fixtures'

const post = (overrides: Partial<WpPost> & { id: number }): WpPost => ({
  date: '2025-08-15T10:00:00',
  slug: `post-${overrides.id}`,
  title: { rendered: `Post ${overrides.id}` },
  content: { rendered: '' },
  featured_media: 0,
  ...overrides,
})

const media = (id: number, file: string, caption = ''): WpMedia => ({
  id,
  source_url: `https://wien.rehwaldt.de/wp-content/uploads/2026/09/${file}`,
  alt_text: '',
  caption: { rendered: caption },
})

/** A WordPress snapshot whose image files exist (in a temporary folder). */
function wordpress(data: Partial<Omit<WordPressSnapshot, 'filePath'>>): WordPressSnapshot {
  const images = data.media ?? []
  const folder = filesRoot(images.map((item) => `files/${item.source_url.split('/').pop()}`))
  return {
    stations: [],
    posts: [],
    categories: [],
    media: images,
    ...data,
    filePath: (item) => path.join(folder, 'files', item.source_url.split('/').pop()!),
  }
}

const excursion = (docs: ReturnType<typeof planExcursions>, slug: string) =>
  docs.find((doc) => doc.collection === 'excursions' && doc.data.slug === slug)!

type Day = { date?: string; stops: Record<string, unknown>[] }

describe('planExcursions: Berlin (stations)', () => {
  // The site serves stations last stop first.
  const stations = [
    post({
      id: 3,
      title: { rendered: 'Ausklang &#8211; Tempelhofer Feld' },
      acf: { date: '20260912', type: 'default', links: [{ link: '' }] },
    }),
    post({
      id: 2,
      title: { rendered: 'Olivaer Platz' },
      content: { rendered: '<p>Kurz vorgestellt</p>' },
      featured_media: 454,
      acf: {
        date: '20260911',
        time: '17:30:00',
        type: 'default',
        coords: { lat: 52.4996909, lng: 13.3138584 },
        guide: 'Kerstin, Till',
        planer: 'RLA',
        completion: 2022,
        images: [456, 454],
        links: [
          { link: { title: 'RLA', url: 'https://www.rehwaldt.de/projekt.php?proj=OLI', target: '_blank' } },
          { link: { title: 'https://example.org/a', url: 'https://example.org/a', target: '' } },
          { link: { title: 'https://www.lebalto-leblog.eu/', url: 'http://Atelier Le Balto', target: '' } },
          { link: { title: 'Jäger und Lustig', url: 'https://jaegerundlustig.de/', target: '' } },
        ],
      },
    }),
    post({ id: 1, title: { rendered: 'Treffpunkt: Hotellobby' }, acf: { date: '20260911', time: '08:30:00', type: 'meet_up', images: '' } }),
  ]
  const plan = () => {
    const { ctx, issues } = harness({ projekte: [projectRow({ ID: 827, kuerzel: 'OLI' })] })
    const docs = planExcursions(
      ctx,
      wordpress({
        stations,
        media: [media(454, 'OLI_1.jpg', '<p>Foto: Kai Abresch</p>'), media(456, 'OLI_2.jpg', '<p>Ein Platz. Fotograf: A. B.</p>')],
      }),
    )
    return { docs, issues, berlin: excursion(docs, 'berlin-2026') }
  }

  it('turns the stations into days in calendar order, stops in running order', () => {
    const { berlin } = plan()
    expect(berlin).toMatchObject({ key: 'slug:berlin-2026', match: { field: 'slug', value: 'berlin-2026' }, status: 'published' })
    expect(berlin.data.title).toBe('RLA Berlin')
    const days = berlin.data.days as Day[]
    expect(days.map((day) => day.date)).toEqual(['2026-09-11T12:00:00.000Z', '2026-09-12T12:00:00.000Z'])
    expect(days[0].stops.map((stop) => stop.title)).toEqual(['Treffpunkt: Hotellobby', 'Olivaer Platz'])
    expect(days[1].stops[0]).toMatchObject({ title: 'Ausklang – Tempelhofer Feld', links: [], images: [], description: null })
  })

  it('maps the ACF fields of a stop', () => {
    const [meetUp, stop] = ((plan().berlin.data.days as Day[])[0]).stops
    expect(meetUp).toMatchObject({ type: 'meetUp', time: '08:30', location: null })
    expect(stop).toMatchObject({
      type: 'default',
      time: '17:30',
      location: [13.3138584, 52.4996909],
      description: { html: '<p>Kurz vorgestellt</p>' },
      guidedBy: 'Kerstin, Till',
      designedBy: 'RLA',
      completionYear: 2022,
      images: [ref('media', 'filename:OLI_1.jpg'), ref('media', 'filename:OLI_2.jpg')],
    })
  })

  it('turns links to project pages into project links and fixes a swapped one', () => {
    const { berlin, issues } = plan()
    const stop = (berlin.data.days as Day[])[0].stops[1]
    expect((stop.links as Record<string, unknown>[]).map(({ id: _id, ...link }) => link)).toEqual([
      { kind: 'project', project: ref('projects', 827) },
      { kind: 'external', url: 'https://example.org/a', label: null },
      { kind: 'external', url: 'https://www.lebalto-leblog.eu/', label: null },
      { kind: 'external', url: 'https://jaegerundlustig.de/', label: 'Jäger und Lustig' },
    ])
    expect(issues('Excursion link with title and URL swapped (fixed)')).toEqual(['station 2: http://Atelier Le Balto'])
  })

  it('plans each image once, named after its first stop, with the credit from its caption', () => {
    const { docs, issues } = plan()
    expect(docs.filter((doc) => doc.collection === 'media')).toMatchObject([
      { key: 'filename:OLI_1.jpg', match: { field: 'filename', value: 'OLI_1.jpg' }, data: { alt: 'Olivaer Platz', credit: 'Kai Abresch' } },
      { key: 'filename:OLI_2.jpg', data: { alt: 'Olivaer Platz', credit: 'A. B.' } },
    ])
    expect(issues('WordPress image caption (dropped, media have no caption yet)')).toEqual(['image 456: Ein Platz.'])
  })

  it('uses an image the website import brings in under the same file name', () => {
    const { ctx, issues } = harness({ bilder: [{ index: 7, pfad: 'projekte/OLI/OLI_1.jpg' }, { index: 8, pfad: 'projekte/OLI/OLI_1.jpg' }] }, ['projekte/OLI/OLI_1.jpg'])
    const docs = planExcursions(ctx, wordpress({ stations: [stations[1]], media: [media(454, 'OLI_1.jpg'), media(456, 'OLI_2.jpg')] }))
    const stop = (excursion(docs, 'berlin-2026').data.days as Day[])[0].stops[0]
    expect(stop.images).toEqual([ref('media', 7), ref('media', 'filename:OLI_2.jpg')])
    expect(docs.filter((doc) => doc.collection === 'media').map((doc) => doc.key)).toEqual(['filename:OLI_2.jpg'])
    expect(issues('WordPress image already imported from the website (that media item used)')).toEqual(['station 2: OLI_1.jpg'])
    expect(ctx.usedImageIds()).toEqual([7])
  })
})

describe('planExcursions: Vienna (posts)', () => {
  const categories = [
    { id: 9, slug: 'donnerstag', name: 'Donnerstag' },
    { id: 10, slug: 'freitag', name: 'Freitag' },
    { id: 8, slug: 'speis', name: 'Speisen und Schlafen' },
    { id: 1, slug: 'uncategorized', name: 'Uncategorized' },
  ]
  const posts = [
    post({
      id: 116,
      date: '2025-08-15T12:00:00',
      title: { rendered: 'Seestadt Aspern' },
      categories: [10, 1],
      content: {
        rendered:
          '<p><a href="https://www.aspern-seestadt.at/">https://www.aspern-seestadt.at/</a></p>' +
          '<p><a href="https://example.org/handbuch.pdf">Planungshandbuch</a></p><p>&nbsp;</p>',
      },
    }),
    post({ id: 254, date: '2025-09-11T09:00:00', title: { rendered: 'Restaurant Jussi' }, categories: [10, 8], content: { rendered: '<p>Kleiner Imbiß</p>' } }),
    post({ id: 209, date: '2025-09-05T09:00:00', title: { rendered: 'Arte-Hotel Wien' }, categories: [9, 8], content: { rendered: '<p>https://www.arte-hotels.at/</p>' } }),
    post({ id: 113, date: '2025-08-15T11:00:00', title: { rendered: 'Kapellenhof' }, categories: [1] }),
  ]
  const plan = () => {
    const { ctx, issues } = harness()
    const docs = planExcursions(ctx, wordpress({ posts, categories }))
    return { vienna: excursion(docs, 'wien-2025'), issues }
  }

  it('is a draft with a day per day category and an unscheduled day for the rest', () => {
    const { vienna, issues } = plan()
    expect(vienna).toMatchObject({ status: 'draft', data: { title: 'RLA Wien' } })
    const days = vienna.data.days as Day[]
    expect(days.map((day) => [day.date, day.stops.map((stop) => stop.title)])).toEqual([
      ['2025-09-11T12:00:00.000Z', ['Arte-Hotel Wien']],
      ['2025-09-12T12:00:00.000Z', ['Seestadt Aspern', 'Restaurant Jussi']],
      [undefined, ['Kapellenhof']],
    ])
    expect(issues('Excursion stop without a date (put on an unscheduled day)')).toEqual(['post 113: Kapellenhof'])
  })

  it('takes links from link-only paragraphs and the rest as description; food and lodging become meals and a meeting point', () => {
    const days = plan().vienna.data.days as Day[]
    const [hotel] = days[0].stops
    const [aspern, jussi] = days[1].stops
    const links = (stop: Record<string, unknown>) => (stop.links as Record<string, unknown>[]).map(({ id: _id, ...link }) => link)
    expect(hotel).toMatchObject({ type: 'meetUp', description: null })
    expect(links(hotel)).toEqual([{ kind: 'external', url: 'https://www.arte-hotels.at/', label: null }])
    expect(aspern).toMatchObject({ type: 'default', description: null })
    expect(links(aspern)).toEqual([
      { kind: 'external', url: 'https://www.aspern-seestadt.at/', label: null },
      { kind: 'external', url: 'https://example.org/handbuch.pdf', label: 'Planungshandbuch' },
    ])
    expect(jussi).toMatchObject({ type: 'food', links: [], description: { html: '<p>Kleiner Imbiß</p>' } })
  })
})
