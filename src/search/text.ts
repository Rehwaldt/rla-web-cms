// Text helpers of the site search: what goes into the index and how a query is matched against it.

type LexicalNode = { type?: string; text?: string; children?: LexicalNode[] }

// Nodes that end a line of text, so the words of neighbouring paragraphs don't run together
const BLOCK_NODES = new Set(['paragraph', 'heading', 'quote', 'list', 'listitem', 'linebreak', 'horizontalrule'])

/** The visible text of a Lexical rich-text value, whitespace collapsed. */
export function lexicalToPlainText(value: unknown): string {
  const parts: string[] = []
  const walk = (node: LexicalNode | undefined) => {
    if (!node) return
    if (typeof node.text === 'string') parts.push(node.text)
    node.children?.forEach(walk)
    if (node.type && BLOCK_NODES.has(node.type)) parts.push(' ')
  }
  walk((value as { root?: LexicalNode } | null | undefined)?.root)
  return collapse(parts.join(''))
}

/** Whitespace runs as single spaces, trimmed. */
export function collapse(text: string | null | undefined): string {
  return (text ?? '').replace(/\s+/g, ' ').trim()
}

/** Lower case without accents ("Dürrenberg" → "durrenberg"), for substring matching. */
export function fold(text: string): string {
  return text.normalize('NFD').replace(/\p{Mn}+/gu, '').toLowerCase()
}

/**
 * A Postgres tsquery that matches documents containing every word of the query as a word or a
 * word's start ("spiel platz" → "spiel:* & platz:*"), or '' when the query has no words. Only
 * letters and digits are kept, so the result is always valid tsquery syntax.
 */
export function toPrefixQuery(query: string): string {
  const words = query.split(/[^\p{L}\p{N}]+/u).filter(Boolean)
  return words.map((word) => `${word}:*`).join(' & ')
}

// The Postgres text search configuration per language: German and English get stemming
// ("Spielplätze" finds "Spielplatz"); Czech and Chinese have none built in.
const TEXT_SEARCH_CONFIGS: Record<string, string> = { de: 'german', en: 'english' }

export function textSearchConfig(language: string): string {
  return TEXT_SEARCH_CONFIGS[language] ?? 'simple'
}
