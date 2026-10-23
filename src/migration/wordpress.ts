import fs from 'fs'
import path from 'path'
import { latestSnapshotFolder } from './legacy'

// The WordPress site wien.rehwaldt.de, where the excursions were planned: the Vienna 2025
// excursion as posts with one category per day, the Berlin 2026 excursion as `station` posts
// with ACF fields. Read once over its REST API into a snapshot (JSON plus the image files), since
// the site is switched off after the import.

export interface WpPost {
  id: number
  date: string
  slug: string
  title: { rendered: string }
  content: { rendered: string }
  featured_media: number
  categories?: number[]
  acf?: Record<string, unknown>
}

export interface WpCategory {
  id: number
  slug: string
  name: string
}

export interface WpMedia {
  id: number
  source_url: string
  alt_text: string
  caption: { rendered: string }
  media_details?: { original_image?: string }
}

export interface WordPressSnapshot {
  /** Stations as the site serves them: in running order, last stop first. */
  stations: WpPost[]
  posts: WpPost[]
  categories: WpCategory[]
  /** The images stations and posts use. */
  media: WpMedia[]
  /** Where the snapshot keeps an image's file. */
  filePath: (media: WpMedia) => string
}

const SNAPSHOT_FILES = ['stations', 'posts', 'categories', 'media'] as const

// WordPress serves images above 2560 px as a scaled-down copy and keeps the original next to it.
const originalUrl = (media: WpMedia): string => {
  const original = media.media_details?.original_image
  return original ? `${media.source_url.slice(0, media.source_url.lastIndexOf('/') + 1)}${original}` : media.source_url
}

const fileName = (media: WpMedia): string => decodeURIComponent(originalUrl(media).split('/').pop()!)

const filePathIn = (folder: string) => (media: WpMedia) => path.join(folder, 'files', fileName(media))

/** The newest snapshot of the WordPress site. */
export function readWordPressSnapshot(): WordPressSnapshot {
  const folder = latestSnapshotFolder('wien_wp')
  const read = (name: (typeof SNAPSHOT_FILES)[number]) =>
    JSON.parse(fs.readFileSync(path.join(folder, `${name}.json`), 'utf8'))
  return {
    stations: read('stations'),
    posts: read('posts'),
    categories: read('categories'),
    media: read('media'),
    filePath: filePathIn(folder),
  }
}

/**
 * Logs in to the site (it sits behind the "Password Protected" plugin, REST API included) and
 * writes its excursion data and images into `folder`.
 */
export async function snapshotWordPress(site: string, password: string, folder: string): Promise<Record<string, number>> {
  const login = await fetch(`${site}/`, {
    method: 'POST',
    body: new URLSearchParams({ password_protected_pwd: password }),
    redirect: 'manual',
  })
  const cookie = login.headers
    .getSetCookie()
    .map((header) => header.split(';')[0])
    .find((pair) => /password_protected_auth=/.test(pair))
  if (!cookie) throw new Error(`Login to ${site} failed (wrong password?)`)

  const get = async (url: string): Promise<Response> => {
    const response = await fetch(url, { headers: { cookie } })
    if (!response.ok) throw new Error(`${url}: ${response.status} ${response.statusText}`)
    return response
  }
  const getAll = async <T>(route: string): Promise<T[]> => {
    const items: T[] = []
    for (let page = 1, pages = 1; page <= pages; page++) {
      const response = await get(`${site}/wp-json/wp/v2/${route}${route.includes('?') ? '&' : '?'}per_page=100&page=${page}`)
      pages = Number(response.headers.get('x-wp-totalpages') ?? 1)
      items.push(...((await response.json()) as T[]))
    }
    return items
  }

  // No orderby: the site pins the stations' running order itself.
  const stations = await getAll<WpPost>('station')
  const posts = await getAll<WpPost>('posts')
  const categories = await getAll<WpCategory>('categories')
  const imageIds = new Set(
    [...stations, ...posts].flatMap((post) => [
      post.featured_media,
      ...(Array.isArray(post.acf?.images) ? (post.acf.images as number[]) : []),
    ]),
  )
  imageIds.delete(0)
  const media = imageIds.size > 0 ? await getAll<WpMedia>(`media?include=${[...imageIds].join(',')}`) : []

  const names = new Map<string, number>()
  for (const item of media) {
    const clash = names.get(fileName(item))
    if (clash !== undefined) throw new Error(`Images ${clash} and ${item.id} share the file name ${fileName(item)}`)
    names.set(fileName(item), item.id)
  }

  fs.mkdirSync(path.join(folder, 'files'), { recursive: true })
  const data = { stations, posts, categories, media }
  for (const name of SNAPSHOT_FILES) {
    fs.writeFileSync(path.join(folder, `${name}.json`), `${JSON.stringify(data[name], null, 2)}\n`)
  }
  const filePath = filePathIn(folder)
  for (const item of media) {
    const response = await get(originalUrl(item))
    fs.writeFileSync(filePath(item), Buffer.from(await response.arrayBuffer()))
  }
  return { stations: stations.length, posts: posts.length, categories: categories.length, images: media.length }
}
