import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "publications_locales" ADD COLUMN "published_in_title" varchar;
  ALTER TABLE "publications_locales" ADD COLUMN "published_in_subtitle" varchar;
  ALTER TABLE "_publications_v_locales" ADD COLUMN "version_published_in_title" varchar;
  ALTER TABLE "_publications_v_locales" ADD COLUMN "version_published_in_subtitle" varchar;`)

  // Journal and book title merge into one venue title (both kept, journal first, should an entry
  // have both); the book subtitle becomes the venue subtitle.
  await db.execute(sql`
   UPDATE "publications_locales" SET
    "published_in_title" = NULLIF(CONCAT_WS(', ', NULLIF("journal", ''), NULLIF("book_title", '')), ''),
    "published_in_subtitle" = NULLIF("book_subtitle", '');
  UPDATE "_publications_v_locales" SET
    "version_published_in_title" = NULLIF(CONCAT_WS(', ', NULLIF("version_journal", ''), NULLIF("version_book_title", '')), ''),
    "version_published_in_subtitle" = NULLIF("version_book_subtitle", '');`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "publications_locales" DROP COLUMN "published_in_title";
  ALTER TABLE "publications_locales" DROP COLUMN "published_in_subtitle";
  ALTER TABLE "_publications_v_locales" DROP COLUMN "version_published_in_title";
  ALTER TABLE "_publications_v_locales" DROP COLUMN "version_published_in_subtitle";`)
}
