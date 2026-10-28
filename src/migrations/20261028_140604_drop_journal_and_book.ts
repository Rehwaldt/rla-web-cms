import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'
import { reindexAll } from '@/search/indexer'

// Rebuilds the search index after the drop: publications are now also found by their journal or
// book (publishedIn), and no hook has written that into their existing entries.
export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "publications_locales" DROP COLUMN "journal";
  ALTER TABLE "publications_locales" DROP COLUMN "book_title";
  ALTER TABLE "publications_locales" DROP COLUMN "book_subtitle";
  ALTER TABLE "_publications_v_locales" DROP COLUMN "version_journal";
  ALTER TABLE "_publications_v_locales" DROP COLUMN "version_book_title";
  ALTER TABLE "_publications_v_locales" DROP COLUMN "version_book_subtitle";`)

  await reindexAll(payload, (line) => payload.logger.info(`Search index: ${line}`), { req })
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "publications_locales" ADD COLUMN "journal" varchar;
  ALTER TABLE "publications_locales" ADD COLUMN "book_title" varchar;
  ALTER TABLE "publications_locales" ADD COLUMN "book_subtitle" varchar;
  ALTER TABLE "_publications_v_locales" ADD COLUMN "version_journal" varchar;
  ALTER TABLE "_publications_v_locales" ADD COLUMN "version_book_title" varchar;
  ALTER TABLE "_publications_v_locales" ADD COLUMN "version_book_subtitle" varchar;`)

  // Journal and book can't be told apart any more: the venue title goes back as the journal.
  await db.execute(sql`
   UPDATE "publications_locales" SET
    "journal" = "published_in_title",
    "book_subtitle" = "published_in_subtitle";
  UPDATE "_publications_v_locales" SET
    "version_journal" = "version_published_in_title",
    "version_book_subtitle" = "version_published_in_subtitle";`)
}
