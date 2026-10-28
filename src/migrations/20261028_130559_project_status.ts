import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_projects_project_status" AS ENUM('completed', 'ongoing');
  ALTER TABLE "projects" ADD COLUMN "status" "enum_projects_project_status" DEFAULT 'completed';
  ALTER TABLE "_projects_v" ADD COLUMN "version_status" "enum_projects_project_status" DEFAULT 'completed';`)

  // The new columns start as 'completed'; ongoing projects (and their versions) carry over.
  await db.execute(sql`
   UPDATE "projects" SET "status" = 'ongoing' WHERE "ongoing";
  UPDATE "_projects_v" SET "version_status" = 'ongoing' WHERE "version_ongoing";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "projects" DROP COLUMN "status";
  ALTER TABLE "_projects_v" DROP COLUMN "version_status";
  DROP TYPE "public"."enum_projects_project_status";`)
}
