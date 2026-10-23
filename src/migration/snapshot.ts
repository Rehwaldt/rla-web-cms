import 'dotenv/config'
import fs from 'fs'
import path from 'path'
import { MINE_TABLES, newSnapshotFolder, readMineTables } from './legacy'
import { snapshotWordPress } from './wordpress'

// Freezes a source that goes away before the cutover into a dated folder under
// LEGACY_SNAPSHOTS_ROOT, which the importer then reads instead of the source:
//   pnpm migrate:snapshot mines        the Minescapes tables of the mine database
//   pnpm migrate:snapshot excursions   the WordPress site wien.rehwaldt.de: excursion posts and
//                                      their images; needs LEGACY_WP_PASSWORD (its site password)
const SOURCES = {
  async mines() {
    const folder = newSnapshotFolder('mine_data')
    const tables = await readMineTables()
    fs.mkdirSync(folder, { recursive: true })
    for (const table of MINE_TABLES) {
      fs.writeFileSync(path.join(folder, `${table}.json`), `${JSON.stringify(tables[table], null, 2)}\n`)
    }
    return { folder, counts: Object.fromEntries(MINE_TABLES.map((table) => [table, tables[table].length])) }
  },
  async excursions() {
    const folder = newSnapshotFolder('wien_wp')
    const password = process.env.LEGACY_WP_PASSWORD
    if (!password) throw new Error('Missing environment variable LEGACY_WP_PASSWORD')
    const site = process.env.LEGACY_WP_URL || 'https://wien.rehwaldt.de'
    return { folder, counts: await snapshotWordPress(site, password, folder) }
  },
}

async function main() {
  const names = process.argv.slice(2)
  const unknown = names.filter((name) => !(name in SOURCES))
  if (names.length === 0 || unknown.length > 0) {
    throw new Error(`Name the sources to freeze: ${Object.keys(SOURCES).join(', ')}`)
  }
  for (const name of names as (keyof typeof SOURCES)[]) {
    const { folder, counts } = await SOURCES[name]()
    console.log(`${name} → ${folder}`)
    for (const [what, count] of Object.entries(counts)) console.log(`  ${what}: ${count}`)
  }
  process.exit(0)
}

main().catch((error) => {
  console.error('Snapshot failed:', error)
  process.exit(1)
})
