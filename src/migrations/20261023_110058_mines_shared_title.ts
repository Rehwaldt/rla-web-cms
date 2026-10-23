import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_projects_country" ADD VALUE 'AU' BEFORE 'AT';
  ALTER TYPE "public"."enum_projects_country" ADD VALUE 'BA' BEFORE 'CN';
  ALTER TYPE "public"."enum_projects_country" ADD VALUE 'BG' BEFORE 'CN';
  ALTER TYPE "public"."enum_projects_country" ADD VALUE 'XK' BEFORE 'NO';
  ALTER TYPE "public"."enum_projects_country" ADD VALUE 'ME' BEFORE 'NO';
  ALTER TYPE "public"."enum_projects_country" ADD VALUE 'MK' BEFORE 'NO';
  ALTER TYPE "public"."enum_projects_country" ADD VALUE 'RU' BEFORE 'KR';
  ALTER TYPE "public"."enum_projects_country" ADD VALUE 'RS' BEFORE 'KR';
  ALTER TYPE "public"."enum_projects_country" ADD VALUE 'TR';
  ALTER TYPE "public"."enum__projects_v_version_country" ADD VALUE 'AU' BEFORE 'AT';
  ALTER TYPE "public"."enum__projects_v_version_country" ADD VALUE 'BA' BEFORE 'CN';
  ALTER TYPE "public"."enum__projects_v_version_country" ADD VALUE 'BG' BEFORE 'CN';
  ALTER TYPE "public"."enum__projects_v_version_country" ADD VALUE 'XK' BEFORE 'NO';
  ALTER TYPE "public"."enum__projects_v_version_country" ADD VALUE 'ME' BEFORE 'NO';
  ALTER TYPE "public"."enum__projects_v_version_country" ADD VALUE 'MK' BEFORE 'NO';
  ALTER TYPE "public"."enum__projects_v_version_country" ADD VALUE 'RU' BEFORE 'KR';
  ALTER TYPE "public"."enum__projects_v_version_country" ADD VALUE 'RS' BEFORE 'KR';
  ALTER TYPE "public"."enum__projects_v_version_country" ADD VALUE 'TR';
  ALTER TYPE "public"."enum_offices_address_country" ADD VALUE 'AU' BEFORE 'AT';
  ALTER TYPE "public"."enum_offices_address_country" ADD VALUE 'BA' BEFORE 'CN';
  ALTER TYPE "public"."enum_offices_address_country" ADD VALUE 'BG' BEFORE 'CN';
  ALTER TYPE "public"."enum_offices_address_country" ADD VALUE 'XK' BEFORE 'NO';
  ALTER TYPE "public"."enum_offices_address_country" ADD VALUE 'ME' BEFORE 'NO';
  ALTER TYPE "public"."enum_offices_address_country" ADD VALUE 'MK' BEFORE 'NO';
  ALTER TYPE "public"."enum_offices_address_country" ADD VALUE 'RU' BEFORE 'KR';
  ALTER TYPE "public"."enum_offices_address_country" ADD VALUE 'RS' BEFORE 'KR';
  ALTER TYPE "public"."enum_offices_address_country" ADD VALUE 'TR';
  ALTER TABLE "mine_features_locales" ALTER COLUMN "name" DROP NOT NULL;
  ALTER TABLE "mines" ADD COLUMN "title" varchar NOT NULL;
  ALTER TABLE "mine_features" ADD COLUMN "legacy_id" numeric;
  CREATE UNIQUE INDEX "mine_features_legacy_id_idx" ON "mine_features" USING btree ("legacy_id");
  ALTER TABLE "mines_locales" DROP COLUMN "title";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "projects" ALTER COLUMN "country" SET DATA TYPE text;
  DROP TYPE "public"."enum_projects_country";
  CREATE TYPE "public"."enum_projects_country" AS ENUM('AT', 'CN', 'CZ', 'FI', 'FR', 'DE', 'NO', 'PL', 'KR', 'CH');
  ALTER TABLE "projects" ALTER COLUMN "country" SET DATA TYPE "public"."enum_projects_country" USING "country"::"public"."enum_projects_country";
  ALTER TABLE "_projects_v" ALTER COLUMN "version_country" SET DATA TYPE text;
  DROP TYPE "public"."enum__projects_v_version_country";
  CREATE TYPE "public"."enum__projects_v_version_country" AS ENUM('AT', 'CN', 'CZ', 'FI', 'FR', 'DE', 'NO', 'PL', 'KR', 'CH');
  ALTER TABLE "_projects_v" ALTER COLUMN "version_country" SET DATA TYPE "public"."enum__projects_v_version_country" USING "version_country"::"public"."enum__projects_v_version_country";
  ALTER TABLE "offices" ALTER COLUMN "address_country" SET DATA TYPE text;
  DROP TYPE "public"."enum_offices_address_country";
  CREATE TYPE "public"."enum_offices_address_country" AS ENUM('AT', 'CN', 'CZ', 'FI', 'FR', 'DE', 'NO', 'PL', 'KR', 'CH');
  ALTER TABLE "offices" ALTER COLUMN "address_country" SET DATA TYPE "public"."enum_offices_address_country" USING "address_country"::"public"."enum_offices_address_country";
  DROP INDEX "mine_features_legacy_id_idx";
  ALTER TABLE "mine_features_locales" ALTER COLUMN "name" SET NOT NULL;
  ALTER TABLE "mines_locales" ADD COLUMN "title" varchar NOT NULL;
  ALTER TABLE "mines" DROP COLUMN "title";
  ALTER TABLE "mine_features" DROP COLUMN "legacy_id";`)
}
