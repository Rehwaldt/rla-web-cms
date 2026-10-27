import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'
import { reindexAll } from '@/search/indexer'

// Fills the site search's index, which 20261026_183223_search_index created empty: production's
// data predates the index, so no hook ever wrote its entries. No schema change.
export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  await reindexAll(payload, (line) => payload.logger.info(`Search index: ${line}`), { req })
}

export async function down(_args: MigrateDownArgs): Promise<void> {
  // Nothing to undo: the entries go with the table when its migration is rolled back
}
