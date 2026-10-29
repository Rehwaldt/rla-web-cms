import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "employees" ADD COLUMN "code" varchar;
  ALTER TABLE "_employees_v" ADD COLUMN "version_code" varchar;
  CREATE UNIQUE INDEX "employees_code_idx" ON "employees" USING btree ("code");
  CREATE INDEX "_employees_v_version_version_code_idx" ON "_employees_v" USING btree ("version_code");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP INDEX "employees_code_idx";
  DROP INDEX "_employees_v_version_version_code_idx";
  ALTER TABLE "employees" DROP COLUMN "code";
  ALTER TABLE "_employees_v" DROP COLUMN "version_code";`)
}
