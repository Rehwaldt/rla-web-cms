import 'dotenv/config'
import { getPayload } from 'payload'
import configPromise from '../payload.config'
import { reindexAll } from './indexer'

// Rebuilds the site search's index from scratch: pnpm search:reindex
// Needed once after the search index ships, and whenever its hooks may have missed something.
async function main() {
  const payload = await getPayload({ config: await configPromise })
  console.log('Rebuilding the search index…')
  await reindexAll(payload, (line) => console.log(`  ${line}`))
  process.exit(0)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
