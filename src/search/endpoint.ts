import type { Endpoint } from 'payload'
import { type PostgresAdapter, sql } from '@payloadcms/db-postgres'
import { DEFAULT_LOCALE, LOCALE_CODES } from '@/locales'
import { fold, textSearchConfig, toPrefixQuery } from './text'

// GET /api/search?q=…&locale=de: the site search over the search index (SearchIndex.ts). An entry
// matches when its texts contain every word of the query, also as a word's start and, in German and
// English, in another form (Postgres full-text search), or when one of its texts contains the whole
// query as written (substring, ignoring case and accents: "platz" finds "Spielplatz", and it's the
// only way to match Chinese, which has no spaces between words). Hits are ranked by the texts they
// match in (title 100, secondary text 50, text 10), then by full-text relevance.
//
// Answers { docs: [{ collection, id, title, snippet, image, code, category, score }] }, at most
// MAX_HITS. `snippet` is plain text from the hit's text, its matches wrapped in <mark></mark>.

const MAX_HITS = 200

const HEADLINE_OPTIONS = 'MaxFragments=1, MaxWords=35, MinWords=20, ShortWord=2, StartSel=<mark>, StopSel=</mark>'

export const searchEndpoint: Endpoint = {
  path: '/search',
  method: 'get',
  handler: async (req) => {
    const query = (req.searchParams.get('q') ?? '').trim()
    const requested = req.searchParams.get('locale') ?? ''
    const language = LOCALE_CODES.includes(requested) ? requested : DEFAULT_LOCALE
    if (!query) return Response.json({ docs: [] })

    const config = textSearchConfig(language)
    const tsquery = toPrefixQuery(query)
    const needle = fold(query)

    // An empty tsquery (a query without letters or digits) only matches by substring
    const ftsQuery = tsquery ? sql`to_tsquery(${config}::regconfig, ${tsquery})` : sql`''::tsquery`
    const matches = (column: string) =>
      sql`(to_tsvector(${config}::regconfig, coalesce(${sql.identifier(column)}, '')) @@ q.query
        or strpos(coalesce(${sql.identifier(`${column}_folded`)}, ''), ${needle}) > 0)`

    const { drizzle } = req.payload.db as unknown as PostgresAdapter
    const result = await drizzle.execute(sql`
      with q as (select ${ftsQuery} as query),
      entries as (
        select e.*,
          (case when ${matches('title')} then 100 else 0 end)
          + (case when ${matches('secondary')} then 50 else 0 end)
          + (case when ${matches('body')} then 10 else 0 end) as score,
          setweight(to_tsvector(${config}::regconfig, coalesce(e.title, '')), 'A')
          || setweight(to_tsvector(${config}::regconfig, coalesce(e.secondary, '')), 'B')
          || setweight(to_tsvector(${config}::regconfig, coalesce(e.body, '')), 'D') as vector
        from search_index e, q
        where e.language = ${language}
      )
      select e.doc_collection, e.doc_id, e.title, e.image, e.code, e.category, e.score,
        ts_headline(${config}::regconfig, coalesce(e.body, ''), q.query, ${HEADLINE_OPTIONS}) as snippet
      from entries e, q
      where e.score > 0 or e.vector @@ q.query
      order by e.score desc, ts_rank(e.vector, q.query) desc, e.doc_id desc
      limit ${MAX_HITS}
    `)

    const docs = (result.rows as Record<string, unknown>[]).map((row) => ({
      collection: row.doc_collection,
      id: Number(row.doc_id),
      title: row.title ?? '',
      snippet: row.snippet ?? '',
      image: row.image === null ? null : Number(row.image),
      code: row.code,
      category: row.category === null ? null : Number(row.category),
      score: Number(row.score),
    }))
    return Response.json({ docs })
  },
}
