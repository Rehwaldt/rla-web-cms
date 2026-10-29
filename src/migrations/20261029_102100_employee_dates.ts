import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// Employees get exact entry and exit dates (and a date of birth and a mobile phone). The entry year
// becomes 1 January of that year, at noon UTC as the admin's day picker stores dates, until the HR
// data replaces it.
export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "employees" ADD COLUMN "birth_date" timestamp(3) with time zone;
  ALTER TABLE "employees" ADD COLUMN "entry_date" timestamp(3) with time zone;
  ALTER TABLE "employees" ADD COLUMN "exit_date" timestamp(3) with time zone;
  ALTER TABLE "employees" ADD COLUMN "mobile_phone" varchar;
  ALTER TABLE "_employees_v" ADD COLUMN "version_birth_date" timestamp(3) with time zone;
  ALTER TABLE "_employees_v" ADD COLUMN "version_entry_date" timestamp(3) with time zone;
  ALTER TABLE "_employees_v" ADD COLUMN "version_exit_date" timestamp(3) with time zone;
  ALTER TABLE "_employees_v" ADD COLUMN "version_mobile_phone" varchar;`)

  await db.execute(sql`
   UPDATE "employees" SET "entry_date" = make_timestamptz("joined_year"::int, 1, 1, 12, 0, 0, 'UTC')
    WHERE "joined_year" IS NOT NULL;
  UPDATE "_employees_v" SET "version_entry_date" = make_timestamptz("version_joined_year"::int, 1, 1, 12, 0, 0, 'UTC')
    WHERE "version_joined_year" IS NOT NULL;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "employees" DROP COLUMN "birth_date";
  ALTER TABLE "employees" DROP COLUMN "entry_date";
  ALTER TABLE "employees" DROP COLUMN "exit_date";
  ALTER TABLE "employees" DROP COLUMN "mobile_phone";
  ALTER TABLE "_employees_v" DROP COLUMN "version_birth_date";
  ALTER TABLE "_employees_v" DROP COLUMN "version_entry_date";
  ALTER TABLE "_employees_v" DROP COLUMN "version_exit_date";
  ALTER TABLE "_employees_v" DROP COLUMN "version_mobile_phone";`)
}
