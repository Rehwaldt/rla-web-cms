import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// The entry year left with the entry date (20261029_102100_employee_dates); the website reads the
// derived entryYear since rla-website#50. Down refills it from the entry date.
export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "employees" DROP COLUMN "joined_year";
  ALTER TABLE "_employees_v" DROP COLUMN "version_joined_year";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "employees" ADD COLUMN "joined_year" numeric;
  ALTER TABLE "_employees_v" ADD COLUMN "version_joined_year" numeric;`)

  await db.execute(sql`
   UPDATE "employees" SET "joined_year" = EXTRACT(YEAR FROM "entry_date" AT TIME ZONE 'UTC');
  UPDATE "_employees_v" SET "version_joined_year" = EXTRACT(YEAR FROM "version_entry_date" AT TIME ZONE 'UTC');`)
}
