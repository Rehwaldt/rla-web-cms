import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// Names stop being localized: first and last name keep their German (default-locale) values, and
// the Chinese ones, stored in reading order (surname as first name), join into the Chinese name.
export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "employees" ADD COLUMN "first_name" varchar;
  ALTER TABLE "employees" ADD COLUMN "last_name" varchar;
  ALTER TABLE "employees" ADD COLUMN "chinese_name" varchar;
  ALTER TABLE "employees" ADD COLUMN "full_name" varchar;
  ALTER TABLE "_employees_v" ADD COLUMN "version_first_name" varchar;
  ALTER TABLE "_employees_v" ADD COLUMN "version_last_name" varchar;
  ALTER TABLE "_employees_v" ADD COLUMN "version_chinese_name" varchar;
  ALTER TABLE "_employees_v" ADD COLUMN "version_full_name" varchar;`)

  await db.execute(sql`
   UPDATE "employees" e SET "first_name" = l."first_name", "last_name" = l."last_name", "full_name" = l."full_name"
    FROM "employees_locales" l WHERE l."_parent_id" = e."id" AND l."_locale" = 'de';
  UPDATE "employees" e SET "chinese_name" = NULLIF(CONCAT(l."first_name", l."last_name"), '')
    FROM "employees_locales" l WHERE l."_parent_id" = e."id" AND l."_locale" = 'zh';
  UPDATE "_employees_v" v SET
    "version_first_name" = l."version_first_name",
    "version_last_name" = l."version_last_name",
    "version_full_name" = l."version_full_name"
    FROM "_employees_v_locales" l WHERE l."_parent_id" = v."id" AND l."_locale" = 'de';
  UPDATE "_employees_v" v SET "version_chinese_name" = NULLIF(CONCAT(l."version_first_name", l."version_last_name"), '')
    FROM "_employees_v_locales" l WHERE l."_parent_id" = v."id" AND l."_locale" = 'zh';`)

  await db.execute(sql`
   ALTER TABLE "employees_locales" DROP COLUMN "first_name";
  ALTER TABLE "employees_locales" DROP COLUMN "last_name";
  ALTER TABLE "employees_locales" DROP COLUMN "full_name";
  ALTER TABLE "_employees_v_locales" DROP COLUMN "version_first_name";
  ALTER TABLE "_employees_v_locales" DROP COLUMN "version_last_name";
  ALTER TABLE "_employees_v_locales" DROP COLUMN "version_full_name";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "employees_locales" ADD COLUMN "first_name" varchar;
  ALTER TABLE "employees_locales" ADD COLUMN "last_name" varchar;
  ALTER TABLE "employees_locales" ADD COLUMN "full_name" varchar;
  ALTER TABLE "_employees_v_locales" ADD COLUMN "version_first_name" varchar;
  ALTER TABLE "_employees_v_locales" ADD COLUMN "version_last_name" varchar;
  ALTER TABLE "_employees_v_locales" ADD COLUMN "version_full_name" varchar;`)

  // The Chinese name splits back after its first character, the surname in all of today's names.
  await db.execute(sql`
   UPDATE "employees_locales" l SET "first_name" = e."first_name", "last_name" = e."last_name", "full_name" = e."full_name"
    FROM "employees" e WHERE l."_parent_id" = e."id" AND l."_locale" = 'de';
  UPDATE "employees_locales" l SET
    "first_name" = LEFT(e."chinese_name", 1),
    "last_name" = NULLIF(SUBSTRING(e."chinese_name" FROM 2), ''),
    "full_name" = CONCAT_WS(' ', LEFT(e."chinese_name", 1), NULLIF(SUBSTRING(e."chinese_name" FROM 2), ''))
    FROM "employees" e WHERE l."_parent_id" = e."id" AND l."_locale" = 'zh' AND e."chinese_name" IS NOT NULL;
  UPDATE "_employees_v_locales" l SET
    "version_first_name" = v."version_first_name",
    "version_last_name" = v."version_last_name",
    "version_full_name" = v."version_full_name"
    FROM "_employees_v" v WHERE l."_parent_id" = v."id" AND l."_locale" = 'de';
  UPDATE "_employees_v_locales" l SET
    "version_first_name" = LEFT(v."version_chinese_name", 1),
    "version_last_name" = NULLIF(SUBSTRING(v."version_chinese_name" FROM 2), ''),
    "version_full_name" = CONCAT_WS(' ', LEFT(v."version_chinese_name", 1), NULLIF(SUBSTRING(v."version_chinese_name" FROM 2), ''))
    FROM "_employees_v" v WHERE l."_parent_id" = v."id" AND l."_locale" = 'zh' AND v."version_chinese_name" IS NOT NULL;`)

  await db.execute(sql`
   ALTER TABLE "employees" DROP COLUMN "first_name";
  ALTER TABLE "employees" DROP COLUMN "last_name";
  ALTER TABLE "employees" DROP COLUMN "chinese_name";
  ALTER TABLE "employees" DROP COLUMN "full_name";
  ALTER TABLE "_employees_v" DROP COLUMN "version_first_name";
  ALTER TABLE "_employees_v" DROP COLUMN "version_last_name";
  ALTER TABLE "_employees_v" DROP COLUMN "version_chinese_name";
  ALTER TABLE "_employees_v" DROP COLUMN "version_full_name";`)
}
