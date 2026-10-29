// Reads the intranet (WordPress, WP_BASE_URL: its REST API base, `…/wp-json/wp/v2`): its employee
// posts (`mitarbeiter`) and their specialist groups (taxonomy `fachgruppen`). Public, no login.
// Keeps only what the import needs.

export type IntranetGroup = {
  intranetId: number
  name: string
  parent: number // intranet id, 0 at the top
}

export type IntranetPerson = {
  intranetId: number
  firstName: string
  lastName: string
  email: string | null
  mobilePhone: string | null
  groups: number[] // intranet ids of specialist groups
  certificates: string[]
  degree: string | null // degree and university in one text
  retired: boolean | null
  hasPortrait: boolean
}

type WpTerm = { id: number; name: string; parent: number }
type WpPost = {
  id: number
  fachgruppen?: number[]
  acf?: {
    vorname?: string | null
    name?: string | null
    email?: string | null
    'mobil-telefon'?: string | null
    'uni-abschluss'?: string | null
    qualifikationen?: { zertifikat_qualifikation?: string | null }[] | null
    retired?: boolean | null
    bild?: number | null
  } | null
}

const text = (value: string | null | undefined) => value?.replace(/\s+/g, ' ').trim() || null
// WordPress returns names with HTML entities ("Brunnen&#047;Wasserspiel").
const decode = (value: string) =>
  value
    .replace(/&#0*(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&amp;/g, '&')

export function toIntranetPerson(post: WpPost): IntranetPerson {
  const acf = post.acf ?? {}
  return {
    intranetId: post.id,
    firstName: text(acf.vorname) ?? '',
    lastName: text(acf.name) ?? '',
    email: text(acf.email),
    mobilePhone: text(acf['mobil-telefon']),
    groups: post.fachgruppen ?? [],
    certificates: (acf.qualifikationen ?? []).flatMap((entry) => text(entry.zertifikat_qualifikation) ?? []),
    degree: text(acf['uni-abschluss']),
    retired: typeof acf.retired === 'boolean' ? acf.retired : null,
    hasPortrait: Boolean(acf.bild),
  }
}

export const toIntranetGroup = (term: WpTerm): IntranetGroup => ({
  intranetId: term.id,
  name: decode(term.name).trim(),
  parent: term.parent,
})

async function readAll<T>(base: string, type: string): Promise<T[]> {
  const records: T[] = []
  for (let page = 1; ; page++) {
    const response = await fetch(`${base}/${type}?per_page=100&page=${page}`)
    // WordPress answers 400 for the page after the last one.
    if (response.status === 400 && page > 1) break
    if (!response.ok) throw new Error(`Intranet ${type}: ${response.status} ${response.statusText}`)
    const batch = (await response.json()) as T[]
    if (batch.length === 0) break
    records.push(...batch)
  }
  return records
}

export async function readIntranet(baseUrl: string) {
  const base = baseUrl.replace(/\/$/, '')
  const [posts, terms] = await Promise.all([readAll<WpPost>(base, 'mitarbeiter'), readAll<WpTerm>(base, 'fachgruppen')])
  return { people: posts.map(toIntranetPerson), groups: terms.map(toIntranetGroup) }
}
