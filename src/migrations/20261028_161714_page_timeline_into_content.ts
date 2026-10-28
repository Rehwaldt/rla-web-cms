import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// Copies each page's timeline (only the founder's CV has one) into its rich-text content, per
// language and in every version, since the timeline is going away (#46): one paragraph per entry,
// the period in bold, then the text with its line breaks. Entries already in the content (copied by
// hand) are skipped. The timeline itself stays until a later migration drops it. No schema change.

type Entry = { period: string; text: string }
type Node = { type: string; text?: string; children?: Node[] } & Record<string, unknown>
type Content = { root: Node } | null
type Db = MigrateUpArgs['db']

const textNode = (text: string, format = 0): Node => ({
  type: 'text',
  text,
  format,
  mode: 'normal',
  style: '',
  detail: 0,
  version: 1,
})

const entryParagraph = ({ period, text }: Entry): Node => ({
  type: 'paragraph',
  format: '',
  indent: 0,
  version: 1,
  direction: null,
  textFormat: 1,
  textStyle: '',
  children: [
    textNode(period, 1),
    ...text.split('\n').flatMap((line) => [{ type: 'linebreak', version: 1 }, textNode(line)]),
  ],
})

const texts = (node: Node): string[] => [
  ...(node.text ? [node.text] : []),
  ...(node.children ?? []).flatMap(texts),
]

// An entry counts as copied if its period and every line of its text appear in the content
const isCopied = (content: Content, { period, text }: Entry) => {
  const present = new Set(content ? texts(content.root) : [])
  return [period, ...text.split('\n')].every((line) => present.has(line))
}

const isEntryParagraph = (node: Node, { period, text }: Entry) =>
  node.type === 'paragraph' && texts(node).join('\n') === `${period}\n${text}`

const TABLES = [
  { timeline: 'pages_timeline', locales: 'pages_locales', content: 'content' },
  {
    timeline: '_pages_v_version_timeline',
    locales: '_pages_v_locales',
    content: 'version_content',
  },
]

/** Rewrites the content of every document (and version) with a timeline, per language. */
async function rewriteContent(db: Db, change: (content: Content, entries: Entry[]) => Content) {
  for (const table of TABLES) {
    const { rows } = await db.execute(sql`
      SELECT t._parent_id AS parent, t._locale::text AS locale, l.${sql.identifier(table.content)} AS content,
        json_agg(json_build_object('period', t.period, 'text', t.text) ORDER BY t._order) AS entries
      FROM ${sql.identifier(table.timeline)} t
      LEFT JOIN ${sql.identifier(table.locales)} l ON l._parent_id = t._parent_id AND l._locale = t._locale
      GROUP BY 1, 2, 3`)
    for (const row of rows as {
      parent: number
      locale: string
      content: Content
      entries: Entry[]
    }[]) {
      const content = change(row.content, row.entries)
      if (JSON.stringify(content) === JSON.stringify(row.content)) continue
      await db.execute(sql`
        INSERT INTO ${sql.identifier(table.locales)} (_locale, _parent_id, ${sql.identifier(table.content)})
        VALUES (${row.locale}, ${row.parent}, ${content === null ? null : JSON.stringify(content)}::jsonb)
        ON CONFLICT (_locale, _parent_id) DO UPDATE SET ${sql.identifier(table.content)} = EXCLUDED.${sql.identifier(table.content)}`)
    }
  }
}

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await rewriteContent(db, (content, entries) => {
    const paragraphs = entries.filter((entry) => !isCopied(content, entry)).map(entryParagraph)
    if (paragraphs.length === 0) return content
    const root = content?.root ?? {
      type: 'root',
      format: '',
      indent: 0,
      version: 1,
      direction: null,
      children: [],
    }
    return { ...content, root: { ...root, children: [...(root.children ?? []), ...paragraphs] } }
  })
}

// Takes the entries' paragraphs out of the content again, also those copied by hand
export async function down({ db }: MigrateDownArgs): Promise<void> {
  await rewriteContent(db, (content, entries) => {
    if (!content) return content
    const children = (content.root.children ?? []).filter(
      (node) => !entries.some((entry) => isEntryParagraph(node, entry)),
    )
    return children.length > 0 ? { ...content, root: { ...content.root, children } } : null
  })
}
