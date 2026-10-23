import fs from 'fs'
import { JSDOM } from 'jsdom'
import { num, str } from '../legacy'
import { fileName, type WordPressSnapshot, type WpMedia } from '../wordpress'
import { docPlan } from './build'
import type { PlanContext } from './context'
import { legacyHref } from './parsers'
import { type Data, type DocPlan, type Ref, ref } from './types'

// The two excursions on the WordPress site, unified into one shape. Berlin 2026 is the site's
// `station` posts (ACF fields: date, time, type, coords, guide, planer, completion, links,
// images). Vienna 2025 predates them: ordinary posts with one category per day, the links in the
// content, no coordinates and no times.
const BERLIN = { slug: 'berlin-2026', title: 'RLA Berlin' }
const VIENNA = { slug: 'wien-2025', title: 'RLA Wien' }

// Vienna's day categories and their dates (Thursday to Saturday).
const VIENNA_DAYS: Record<string, string> = {
  donnerstag: '2025-09-11',
  freitag: '2025-09-12',
  samstag: '2025-09-13',
}
// "Speisen und Schlafen": restaurants become meals, the hotel the morning meeting point.
const VIENNA_FOOD_CATEGORY = 'speis'

const STOP_TYPES: Record<string, string> = {
  default: 'default',
  optional: 'optional',
  break: 'break',
  meet_up: 'meetUp',
  food: 'food',
}

const UNSCHEDULED = 'unscheduled'

type Stop = Data & { wpId: number }
type Link = { kind: 'project'; project: Ref } | { kind: 'external'; url: string; label: string | null }

const isUrlLike = (text: string) => /^(https?:\/\/|www\.)/i.test(text.trim())

let dom: JSDOM | undefined
const parseHtml = (html: string) => {
  dom ??= new JSDOM('')
  const container = dom.window.document.createElement('div')
  container.innerHTML = html
  return container
}

export function planExcursions(ctx: PlanContext, wordpress: WordPressSnapshot): DocPlan[] {
  const mediaById = new Map(wordpress.media.map((media) => [media.id, media]))
  const usedMedia = new Map<number, { media: WpMedia; alt: string | null }>()

  // Some stops show project photos the website import brings in anyway, under the same file
  // name: those stops use that media item (with its alt text, credit and project) instead of a
  // copy. Only names of a single legacy image file count (several rows may share one file).
  const legacyImageByName = new Map<string, { path: string; id: number } | null>()
  for (const row of ctx.snapshot.bilder) {
    const path = str(row, 'pfad')
    const name = path?.split('/').pop()
    if (!path || !name) continue
    const known = legacyImageByName.get(name)
    legacyImageByName.set(name, known === undefined ? { path, id: num(row, 'index')! } : known?.path === path ? known : null)
  }

  const imageRefs = (ids: number[], alt: string | null, where: string): Ref[] =>
    [...new Set(ids.filter(Boolean))].flatMap((id) => {
      const media = mediaById.get(id)
      if (!media || !fs.existsSync(wordpress.filePath(media))) {
        ctx.report.add('WordPress image missing from the snapshot (dropped)', `${where}: ${id}`)
        return []
      }
      const legacyImage = legacyImageByName.get(fileName(media))
      const legacyRef = legacyImage ? ctx.imageRef(legacyImage.id, where) : null
      if (legacyRef) {
        ctx.report.add('WordPress image already imported from the website (that media item used)', `${where}: ${fileName(media)}`)
        return [legacyRef]
      }
      if (!usedMedia.has(id)) usedMedia.set(id, { media, alt })
      return [ref('media', `filename:${fileName(media)}`)]
    })

  // Links to the old website's project pages become project links.
  const link = (url: string, label: string | null, where: string): Link | null => {
    const legacyPath = url.replace(/^https?:\/\/(www\.)?rehwaldt\.de\//i, '')
    const target = legacyPath !== url ? legacyHref(legacyPath) : null
    if (target && 'project' in target) {
      const project = ctx.projectRef(target.project, where)
      if (project) return { kind: 'project', project }
    }
    return { kind: 'external', url, label: label && !isUrlLike(label) ? label : null }
  }

  const dayRows = (slug: string, days: Map<string, Stop[]>) =>
    [...days].filter(([, stops]) => stops.length > 0).map(([date, stops]) => ({
      id: ctx.rowId('excursions', slug, 'day', date),
      ...(date !== UNSCHEDULED && { date }),
      stops: stops.map(({ wpId, links, ...stop }) => ({
        id: ctx.rowId('excursions', slug, 'stop', wpId),
        ...stop,
        links: (links as Link[]).map((item, index) => ({ id: ctx.rowId('excursions', slug, 'stop', wpId, 'link', index), ...item })),
      })),
    }))

  // Berlin: the site serves the stations last stop first; days in calendar order.
  const berlinDays = new Map<string, Stop[]>()
  const stations = [...wordpress.stations].reverse()
  for (const station of stations) {
    const acf = station.acf ?? {}
    const where = `station ${station.id}`
    const title = ctx.plain(station.title.rendered, where)
    const rawDate = String(acf.date ?? '')
    const date = /^\d{8}$/.test(rawDate) ? `${rawDate.slice(0, 4)}-${rawDate.slice(4, 6)}-${rawDate.slice(6)}` : UNSCHEDULED
    if (date === UNSCHEDULED) ctx.report.add('Excursion stop without a date (put on an unscheduled day)', `${where}: ${title}`)

    const rawType = String(acf.type ?? 'default')
    if (!(rawType in STOP_TYPES)) ctx.report.add('Unknown excursion stop type (imported as a plain stop)', `${where}: ${rawType}`)
    const time = /^(\d{2}:\d{2})/.exec(String(acf.time ?? ''))?.[1] ?? null
    const coords = acf.coords as { lat?: number | string | null; lng?: number | string | null } | null | undefined
    const coordinate = (value: number | string | null | undefined) =>
      value === null || value === undefined || value === '' ? NaN : Number(value)
    const lat = coordinate(coords?.lat)
    const lng = coordinate(coords?.lng)

    const links = (Array.isArray(acf.links) ? (acf.links as { link?: { url?: string; title?: string } | '' }[]) : [])
      .flatMap(({ link: item }) => {
        if (!item || !item.url) return []
        let url = item.url.trim()
        // Someone swapped the fields once: the title holds the URL, the URL a name.
        if (/\s/.test(url) && item.title && isUrlLike(item.title)) {
          ctx.report.add('Excursion link with title and URL swapped (fixed)', `${where}: ${url}`)
          url = item.title.trim()
        }
        const result = link(url, item.title?.trim() || null, `${where} link`)
        return result ? [result] : []
      })

    const images = Array.isArray(acf.images) ? (acf.images as number[]) : []
    const stop: Stop = {
      wpId: station.id,
      title,
      type: STOP_TYPES[rawType] ?? 'default',
      time,
      location: Number.isFinite(lat) && Number.isFinite(lng) ? [lng, lat] : null,
      description: parseHtml(station.content.rendered).textContent?.trim() ? ctx.richText(station.content.rendered, where) : null,
      guidedBy: ctx.plain(String(acf.guide ?? ''), where),
      designedBy: ctx.plain(String(acf.planer ?? ''), where),
      completionYear: Number(acf.completion) || null,
      links,
      images: imageRefs([station.featured_media, ...images], title, where),
    }
    berlinDays.set(date, [...(berlinDays.get(date) ?? []), stop])
  }
  const sortedBerlinDays = new Map([...berlinDays].sort(([a], [b]) => (a === UNSCHEDULED ? 1 : b === UNSCHEDULED ? -1 : a.localeCompare(b))))

  // Vienna: in the order the posts were written, days by category.
  const categorySlugs = new Map(wordpress.categories.map((category) => [category.id, category.slug]))
  const viennaDays = new Map<string, Stop[]>([...Object.values(VIENNA_DAYS), UNSCHEDULED].map((date) => [date, []]))
  for (const post of [...wordpress.posts].sort((a, b) => a.date.localeCompare(b.date) || a.id - b.id)) {
    const where = `post ${post.id}`
    const title = ctx.plain(post.title.rendered, where)
    const slugs = (post.categories ?? []).map((id) => categorySlugs.get(id))
    const date = slugs.map((slug) => slug && VIENNA_DAYS[slug]).find(Boolean) ?? UNSCHEDULED
    if (date === UNSCHEDULED) ctx.report.add('Excursion stop without a date (put on an unscheduled day)', `${where}: ${title}`)
    const isFood = slugs.includes(VIENNA_FOOD_CATEGORY)
    const type = isFood ? (/hotel/i.test(title ?? '') ? 'meetUp' : 'food') : 'default'

    // Paragraphs that are only a link (or a bare URL) are the stop's links; the rest describes it.
    const links: Link[] = []
    const description: string[] = []
    for (const paragraph of parseHtml(post.content.rendered).querySelectorAll('p')) {
      const text = (paragraph.textContent ?? '').replace(/ /g, ' ').trim()
      if (!text) continue
      const anchors = paragraph.querySelectorAll('a')
      if (anchors.length === 1 && anchors[0].textContent?.trim() === text) {
        const result = link(anchors[0].getAttribute('href') ?? '', text, `${where} link`)
        if (result) links.push(result)
      } else if (anchors.length === 0 && isUrlLike(text) && !/\s/.test(text)) {
        const result = link(text.startsWith('www.') ? `https://${text}` : text, null, `${where} link`)
        if (result) links.push(result)
      } else {
        description.push(paragraph.outerHTML)
      }
    }

    viennaDays.get(date)!.push({
      wpId: post.id,
      title,
      type,
      description: description.length > 0 ? ctx.richText(description.join(''), where) : null,
      links,
      images: imageRefs([post.featured_media], title, where),
    })
  }

  const excursions = [
    { ...BERLIN, status: 'published' as const, days: dayRows(BERLIN.slug, sortedBerlinDays) },
    { ...VIENNA, status: 'draft' as const, days: dayRows(VIENNA.slug, viennaDays) },
  ].map(({ slug, title, status, days }) =>
    docPlan({
      collection: 'excursions',
      key: `slug:${slug}`,
      match: { field: 'slug', value: slug },
      status,
      shared: { slug, days },
      perLocale: { de: { title } },
    }),
  )

  // The images: WordPress has no alt texts, so an image gets the name of the first stop showing
  // it. The photographer named in a caption ("Foto: …", "Fotograf: …") becomes the credit; the
  // rest of a caption is dropped.
  const images = [...usedMedia.values()].map(({ media, alt }) => {
    const caption = parseHtml(media.caption?.rendered ?? '').textContent?.replace(/\s+/g, ' ').trim() ?? ''
    const [, rest, credit = null] = /^(.*?)\s*\bFoto(?:graf(?:in)?)?:\s*(.+)$/i.exec(caption) ?? [null, caption]
    if (rest) ctx.report.add('WordPress image caption (dropped, media have no caption yet)', `image ${media.id}: ${rest}`)
    const name = fileName(media)
    return docPlan({
      collection: 'media',
      key: `filename:${name}`,
      match: { field: 'filename', value: name },
      filePath: wordpress.filePath(media),
      shared: { credit },
      perLocale: { de: { alt: media.alt_text?.trim() || alt } },
    })
  })

  return [...images, ...excursions]
}
