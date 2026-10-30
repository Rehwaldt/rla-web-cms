import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "offices_locales" DROP COLUMN "contact_note";
  ALTER TABLE "_offices_v_locales" DROP COLUMN "version_contact_note";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "offices_locales" ADD COLUMN "contact_note" jsonb;
  ALTER TABLE "_offices_v_locales" ADD COLUMN "version_contact_note" jsonb;`)
}
