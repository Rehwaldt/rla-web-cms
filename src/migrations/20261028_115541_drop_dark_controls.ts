import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "projects" DROP COLUMN "dark_controls";
  ALTER TABLE "_projects_v" DROP COLUMN "version_dark_controls";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "projects" ADD COLUMN "dark_controls" boolean;
  ALTER TABLE "_projects_v" ADD COLUMN "version_dark_controls" boolean;`)
}
