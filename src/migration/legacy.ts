import mysql from 'mysql2/promise'

// Reads the legacy website database, and the Minescapes tables from the mine database on the same
// server, into memory. Values are cleaned once here so the planners never see the legacy storage
// quirks: strings are trimmed, and '' / the literal 'NULL' become null.

const WEB_TABLES = [
  'projekte',
  'aehnliche_projekte',
  'projektkategorien',
  'themen',
  'aktuell',
  'auszeichnungen',
  'publikationen',
  'publikationskategorien',
  'jobs',
  'buero',
  'mitarbeiter',
  'standorte',
  'bilder',
  'textelemente',
] as const

const MINE_TABLES = ['mines', 'features', 'mine_features'] as const

export const LEGACY_TABLES = [...WEB_TABLES, ...MINE_TABLES] as const

export type LegacyTable = (typeof LEGACY_TABLES)[number]
export type Row = Record<string, unknown>
export type LegacySnapshot = Record<LegacyTable, Row[]>

function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`Missing environment variable ${name}`)
  return value
}

function cleanValue(value: unknown): unknown {
  if (typeof value !== 'string') return value
  const trimmed = value.trim()
  return trimmed === '' || trimmed === 'NULL' ? null : trimmed
}

export async function readLegacySnapshot(): Promise<LegacySnapshot> {
  const webDb = requireEnv('LEGACY_WEB_DB_NAME')
  const mineDb = requireEnv('LEGACY_MINE_DB_NAME')
  const connection = await mysql.createConnection({
    host: requireEnv('LEGACY_WEB_DB_HOST'),
    user: requireEnv('LEGACY_WEB_DB_USER'),
    password: requireEnv('LEGACY_WEB_DB_PASSWORD'),
    database: webDb,
    dateStrings: true,
    charset: 'utf8mb4',
  })
  try {
    const snapshot = {} as LegacySnapshot
    const sources = [...WEB_TABLES.map((table) => [webDb, table]), ...MINE_TABLES.map((table) => [mineDb, table])]
    for (const [database, table] of sources) {
      const [rows] = await connection.query(`SELECT * FROM \`${database}\`.\`${table}\``)
      snapshot[table as LegacyTable] = (rows as Row[]).map((row) =>
        Object.fromEntries(Object.entries(row).map(([key, value]) => [key, cleanValue(value)])),
      )
    }
    return snapshot
  } finally {
    await connection.end()
  }
}

// Typed accessors for cleaned rows.

export const str = (row: Row, column: string): string | null => {
  const value = row[column]
  return value === null || value === undefined ? null : String(value)
}

export const num = (row: Row, column: string): number | null => {
  const value = row[column]
  if (value === null || value === undefined) return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

export const bool = (row: Row, column: string): boolean => Number(row[column] ?? 0) === 1

export const pipeList = (row: Row, column: string): string[] =>
  (str(row, column) ?? '')
    .split('|')
    .map((part) => part.trim())
    .filter(Boolean)
