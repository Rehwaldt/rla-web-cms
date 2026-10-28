import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "projects" DROP COLUMN "ongoing";
  ALTER TABLE "_projects_v" DROP COLUMN "version_ongoing";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "projects" ADD COLUMN "ongoing" boolean;
  ALTER TABLE "_projects_v" ADD COLUMN "version_ongoing" boolean;`)

  await db.execute(sql`
   UPDATE "projects" SET "ongoing" = "status" = 'ongoing';
  UPDATE "_projects_v" SET "version_ongoing" = "version_status" = 'ongoing';`)
}
