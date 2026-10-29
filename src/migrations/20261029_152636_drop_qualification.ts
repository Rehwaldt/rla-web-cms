import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// The single qualification text went into the list (20261029_151659_expertise_and_qualifications);
// the website reads the list since rla-website#51. Down refills the text from the list, entries
// joined with " / " (status notes the list left out stay lost).
export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "employees_locales" DROP COLUMN "qualification";
  ALTER TABLE "_employees_v_locales" DROP COLUMN "version_qualification";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "employees_locales" ADD COLUMN "qualification" varchar;
  ALTER TABLE "_employees_v_locales" ADD COLUMN "version_qualification" varchar;`)

  await db.execute(sql`
   UPDATE "employees_locales" l SET "qualification" = q.text
    FROM (SELECT "_parent_id", "_locale", string_agg("name", ' / ' ORDER BY "_order") AS text
      FROM "employees_qualifications" GROUP BY "_parent_id", "_locale") q
    WHERE q."_parent_id" = l."_parent_id" AND q."_locale" = l."_locale";
  UPDATE "_employees_v_locales" l SET "version_qualification" = q.text
    FROM (SELECT "_parent_id", "_locale", string_agg("name", ' / ' ORDER BY "_order") AS text
      FROM "_employees_v_version_qualifications" GROUP BY "_parent_id", "_locale") q
    WHERE q."_parent_id" = l."_parent_id" AND q."_locale" = l."_locale";`)
}
