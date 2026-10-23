import fs from 'fs'
import path from 'path'
import mysql from 'mysql2/promise'
import type { Section } from './plan/types'

// Reads the legacy website database, and the Minescapes tables from their snapshot, into memory.
// Values are cleaned once here so the planners never see the legacy storage quirks: strings are
// trimmed, and '' / the literal 'NULL' become null.

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

export const MINE_TABLES = ['mines', 'features', 'mine_features'] as const

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

const cleanRow = (row: Row): Row =>
  Object.fromEntries(Object.entries(row).map(([key, value]) => [key, cleanValue(value)]))

// Sources that go away before the cutover are frozen as JSON (`pnpm migrate:snapshot`), one dated
// folder per snapshot, and imported from there: the mine database and the WordPress site
// wien.rehwaldt.de.
export type SnapshotSource = 'mine_data' | 'wien_wp'

const snapshotsRoot = () => process.env.LEGACY_SNAPSHOTS_ROOT || 'Z:/website/website_rla/strato_backups'

/** The folder for a new snapshot of a source, named after today's date. */
export const newSnapshotFolder = (source: SnapshotSource): string =>
  path.join(snapshotsRoot(), source, new Date().toISOString().slice(0, 10))

/** The newest snapshot folder of a source. */
export function latestSnapshotFolder(source: SnapshotSource): string {
  const dir = path.join(snapshotsRoot(), source)
  const dates = fs.existsSync(dir) ? fs.readdirSync(dir).filter((name) => /^\d{4}-\d{2}-\d{2}$/.test(name)).sort() : []
  if (dates.length === 0) throw new Error(`No snapshot of ${source} in ${dir} (pnpm migrate:snapshot)`)
  return path.join(dir, dates.at(-1)!)
}

/** A connection to the legacy MySQL server (the website and the mine database share it). */
export const connectLegacyDb = () =>
  mysql.createConnection({
    host: requireEnv('LEGACY_WEB_DB_HOST'),
    user: requireEnv('LEGACY_WEB_DB_USER'),
    password: requireEnv('LEGACY_WEB_DB_PASSWORD'),
    database: requireEnv('LEGACY_WEB_DB_NAME'),
    dateStrings: true,
    charset: 'utf8mb4',
  })

/** Raw rows of the mine tables, as `pnpm migrate:snapshot mines` freezes them. */
export async function readMineTables(): Promise<Record<(typeof MINE_TABLES)[number], Row[]>> {
  const mineDb = requireEnv('LEGACY_MINE_DB_NAME')
  const connection = await connectLegacyDb()
  try {
    const tables = {} as Record<(typeof MINE_TABLES)[number], Row[]>
    for (const table of MINE_TABLES) {
      const [rows] = await connection.query(`SELECT * FROM \`${mineDb}\`.\`${table}\``)
      tables[table] = rows as Row[]
    }
    return tables
  } finally {
    await connection.end()
  }
}

/**
 * Reads what the given import sections need: the website database (also for excursions, which
 * link to projects) live, the mine tables from their newest snapshot. Tables of a section that
 * isn't imported stay empty.
 */
export async function readLegacySnapshot(sections: ReadonlySet<Section>): Promise<LegacySnapshot> {
  const snapshot = Object.fromEntries(LEGACY_TABLES.map((table) => [table, []])) as unknown as LegacySnapshot
  if (sections.has('website') || sections.has('excursions')) {
    const connection = await connectLegacyDb()
    try {
      for (const table of WEB_TABLES) {
        const [rows] = await connection.query(`SELECT * FROM \`${table}\``)
        snapshot[table] = (rows as Row[]).map(cleanRow)
      }
    } finally {
      await connection.end()
    }
  }
  if (sections.has('mines')) {
    const folder = latestSnapshotFolder('mine_data')
    for (const table of MINE_TABLES) {
      const rows = JSON.parse(fs.readFileSync(path.join(folder, `${table}.json`), 'utf8')) as Row[]
      snapshot[table] = rows.map(cleanRow)
    }
  }
  return snapshot
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
