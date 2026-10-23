import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_mines_country" AS ENUM('AU', 'AT', 'BA', 'BG', 'CN', 'CZ', 'FI', 'FR', 'DE', 'XK', 'ME', 'MK', 'NO', 'PL', 'RU', 'RS', 'KR', 'CH', 'TR');
  CREATE TYPE "public"."enum_mines_operating_status" AS ENUM('in_use', 'in_revitalization', 'revitalized');
  CREATE TYPE "public"."enum_mines_morphology" AS ENUM('lake', 'dump', 'backfilled');
  CREATE TYPE "public"."enum_mines_follow_up_use" AS ENUM('recreation', 'production', 'ecology');
  CREATE TYPE "public"."enum_mines_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__mines_v_version_site_type" AS ENUM('open_cast', 'external_dump', 'underground', 'quarry', 'mountaintop_removal');
  CREATE TYPE "public"."enum__mines_v_version_extracted_materials" AS ENUM('lignite', 'coal', 'iron', 'bauxite', 'boron', 'chromium', 'copper', 'gold', 'lithium', 'nickel', 'phosphorite', 'silver', 'zinc');
  CREATE TYPE "public"."enum__mines_v_version_country" AS ENUM('AU', 'AT', 'BA', 'BG', 'CN', 'CZ', 'FI', 'FR', 'DE', 'XK', 'ME', 'MK', 'NO', 'PL', 'RU', 'RS', 'KR', 'CH', 'TR');
  CREATE TYPE "public"."enum__mines_v_version_operating_status" AS ENUM('in_use', 'in_revitalization', 'revitalized');
  CREATE TYPE "public"."enum__mines_v_version_morphology" AS ENUM('lake', 'dump', 'backfilled');
  CREATE TYPE "public"."enum__mines_v_version_follow_up_use" AS ENUM('recreation', 'production', 'ecology');
  CREATE TYPE "public"."enum__mines_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__mines_v_published_locale" AS ENUM('de', 'en', 'zh', 'cs');
  ALTER TYPE "public"."enum_mines_extracted_materials" ADD VALUE 'lignite' BEFORE 'coal';
  ALTER TYPE "public"."enum_mines_extracted_materials" ADD VALUE 'boron' BEFORE 'copper';
  ALTER TYPE "public"."enum_mines_extracted_materials" ADD VALUE 'chromium' BEFORE 'copper';
  CREATE TABLE "_mines_v_version_site_type" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__mines_v_version_site_type",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_mines_v_version_extracted_materials" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__mines_v_version_extracted_materials",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_mines_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_code" varchar,
  	"version_parent_mine_id" integer,
  	"version_location" geometry(Point),
  	"version_country" "enum__mines_v_version_country",
  	"version_nearest_city_population" numeric,
  	"version_nearest_city_distance_km" numeric,
  	"version_website" varchar,
  	"version_operating_status" "enum__mines_v_version_operating_status",
  	"version_closure_year" numeric,
  	"version_morphology" "enum__mines_v_version_morphology",
  	"version_surface_total" numeric,
  	"version_surface_lake" numeric,
  	"version_surface_forest" numeric,
  	"version_surface_agriculture" numeric,
  	"version_surface_settlement" numeric,
  	"version_follow_up_use" "enum__mines_v_version_follow_up_use",
  	"version_activity_scale" numeric,
  	"version_legacy_id" numeric,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__mines_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__mines_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_mines_v_locales" (
  	"version_region" varchar,
  	"version_district" varchar,
  	"version_nearest_city_name" varchar,
  	"version_content" jsonb,
  	"version_main_use" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_mines_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"mine_features_id" integer
  );
  
  ALTER TABLE "mines" ALTER COLUMN "title" DROP NOT NULL;
  ALTER TABLE "mines" ADD COLUMN "code" varchar;
  ALTER TABLE "mines" ADD COLUMN "parent_mine_id" integer;
  ALTER TABLE "mines" ADD COLUMN "country" "enum_mines_country";
  ALTER TABLE "mines" ADD COLUMN "nearest_city_population" numeric;
  ALTER TABLE "mines" ADD COLUMN "nearest_city_distance_km" numeric;
  ALTER TABLE "mines" ADD COLUMN "website" varchar;
  ALTER TABLE "mines" ADD COLUMN "operating_status" "enum_mines_operating_status";
  ALTER TABLE "mines" ADD COLUMN "morphology" "enum_mines_morphology";
  ALTER TABLE "mines" ADD COLUMN "follow_up_use" "enum_mines_follow_up_use";
  ALTER TABLE "mines" ADD COLUMN "activity_scale" numeric;
  ALTER TABLE "mines" ADD COLUMN "legacy_id" numeric;
  ALTER TABLE "mines" ADD COLUMN "_status" "enum_mines_status" DEFAULT 'draft';
  ALTER TABLE "mines_locales" ADD COLUMN "region" varchar;
  ALTER TABLE "mines_locales" ADD COLUMN "district" varchar;
  ALTER TABLE "mines_locales" ADD COLUMN "nearest_city_name" varchar;
  ALTER TABLE "mines_locales" ADD COLUMN "main_use" varchar;
  ALTER TABLE "_mines_v_version_site_type" ADD CONSTRAINT "_mines_v_version_site_type_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_mines_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_mines_v_version_extracted_materials" ADD CONSTRAINT "_mines_v_version_extracted_materials_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_mines_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_mines_v" ADD CONSTRAINT "_mines_v_parent_id_mines_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."mines"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_mines_v" ADD CONSTRAINT "_mines_v_version_parent_mine_id_mines_id_fk" FOREIGN KEY ("version_parent_mine_id") REFERENCES "public"."mines"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_mines_v_locales" ADD CONSTRAINT "_mines_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_mines_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_mines_v_rels" ADD CONSTRAINT "_mines_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_mines_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_mines_v_rels" ADD CONSTRAINT "_mines_v_rels_mine_features_fk" FOREIGN KEY ("mine_features_id") REFERENCES "public"."mine_features"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "_mines_v_version_site_type_order_idx" ON "_mines_v_version_site_type" USING btree ("order");
  CREATE INDEX "_mines_v_version_site_type_parent_idx" ON "_mines_v_version_site_type" USING btree ("parent_id");
  CREATE INDEX "_mines_v_version_extracted_materials_order_idx" ON "_mines_v_version_extracted_materials" USING btree ("order");
  CREATE INDEX "_mines_v_version_extracted_materials_parent_idx" ON "_mines_v_version_extracted_materials" USING btree ("parent_id");
  CREATE INDEX "_mines_v_parent_idx" ON "_mines_v" USING btree ("parent_id");
  CREATE INDEX "_mines_v_version_version_code_idx" ON "_mines_v" USING btree ("version_code");
  CREATE INDEX "_mines_v_version_version_parent_mine_idx" ON "_mines_v" USING btree ("version_parent_mine_id");
  CREATE INDEX "_mines_v_version_version_legacy_id_idx" ON "_mines_v" USING btree ("version_legacy_id");
  CREATE INDEX "_mines_v_version_version_updated_at_idx" ON "_mines_v" USING btree ("version_updated_at");
  CREATE INDEX "_mines_v_version_version_created_at_idx" ON "_mines_v" USING btree ("version_created_at");
  CREATE INDEX "_mines_v_version_version__status_idx" ON "_mines_v" USING btree ("version__status");
  CREATE INDEX "_mines_v_created_at_idx" ON "_mines_v" USING btree ("created_at");
  CREATE INDEX "_mines_v_updated_at_idx" ON "_mines_v" USING btree ("updated_at");
  CREATE INDEX "_mines_v_snapshot_idx" ON "_mines_v" USING btree ("snapshot");
  CREATE INDEX "_mines_v_published_locale_idx" ON "_mines_v" USING btree ("published_locale");
  CREATE INDEX "_mines_v_latest_idx" ON "_mines_v" USING btree ("latest");
  CREATE UNIQUE INDEX "_mines_v_locales_locale_parent_id_unique" ON "_mines_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_mines_v_rels_order_idx" ON "_mines_v_rels" USING btree ("order");
  CREATE INDEX "_mines_v_rels_parent_idx" ON "_mines_v_rels" USING btree ("parent_id");
  CREATE INDEX "_mines_v_rels_path_idx" ON "_mines_v_rels" USING btree ("path");
  CREATE INDEX "_mines_v_rels_mine_features_id_idx" ON "_mines_v_rels" USING btree ("mine_features_id");
  ALTER TABLE "mines" ADD CONSTRAINT "mines_parent_mine_id_mines_id_fk" FOREIGN KEY ("parent_mine_id") REFERENCES "public"."mines"("id") ON DELETE set null ON UPDATE no action;
  CREATE UNIQUE INDEX "mines_code_idx" ON "mines" USING btree ("code");
  CREATE INDEX "mines_parent_mine_idx" ON "mines" USING btree ("parent_mine_id");
  CREATE UNIQUE INDEX "mines_legacy_id_idx" ON "mines" USING btree ("legacy_id");
  CREATE INDEX "mines__status_idx" ON "mines" USING btree ("_status");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "_mines_v_version_site_type" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_mines_v_version_extracted_materials" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_mines_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_mines_v_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_mines_v_rels" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "_mines_v_version_site_type" CASCADE;
  DROP TABLE "_mines_v_version_extracted_materials" CASCADE;
  DROP TABLE "_mines_v" CASCADE;
  DROP TABLE "_mines_v_locales" CASCADE;
  DROP TABLE "_mines_v_rels" CASCADE;
  ALTER TABLE "mines" DROP CONSTRAINT "mines_parent_mine_id_mines_id_fk";
  
  ALTER TABLE "mines_extracted_materials" ALTER COLUMN "value" SET DATA TYPE text;
  DROP TYPE "public"."enum_mines_extracted_materials";
  CREATE TYPE "public"."enum_mines_extracted_materials" AS ENUM('coal', 'iron', 'bauxite', 'copper', 'gold', 'lithium', 'nickel', 'phosphorite', 'silver', 'zinc');
  ALTER TABLE "mines_extracted_materials" ALTER COLUMN "value" SET DATA TYPE "public"."enum_mines_extracted_materials" USING "value"::"public"."enum_mines_extracted_materials";
  DROP INDEX "mines_code_idx";
  DROP INDEX "mines_parent_mine_idx";
  DROP INDEX "mines_legacy_id_idx";
  DROP INDEX "mines__status_idx";
  ALTER TABLE "mines" ALTER COLUMN "title" SET NOT NULL;
  ALTER TABLE "mines" DROP COLUMN "code";
  ALTER TABLE "mines" DROP COLUMN "parent_mine_id";
  ALTER TABLE "mines" DROP COLUMN "country";
  ALTER TABLE "mines" DROP COLUMN "nearest_city_population";
  ALTER TABLE "mines" DROP COLUMN "nearest_city_distance_km";
  ALTER TABLE "mines" DROP COLUMN "website";
  ALTER TABLE "mines" DROP COLUMN "operating_status";
  ALTER TABLE "mines" DROP COLUMN "morphology";
  ALTER TABLE "mines" DROP COLUMN "follow_up_use";
  ALTER TABLE "mines" DROP COLUMN "activity_scale";
  ALTER TABLE "mines" DROP COLUMN "legacy_id";
  ALTER TABLE "mines" DROP COLUMN "_status";
  ALTER TABLE "mines_locales" DROP COLUMN "region";
  ALTER TABLE "mines_locales" DROP COLUMN "district";
  ALTER TABLE "mines_locales" DROP COLUMN "nearest_city_name";
  ALTER TABLE "mines_locales" DROP COLUMN "main_use";
  DROP TYPE "public"."enum_mines_country";
  DROP TYPE "public"."enum_mines_operating_status";
  DROP TYPE "public"."enum_mines_morphology";
  DROP TYPE "public"."enum_mines_follow_up_use";
  DROP TYPE "public"."enum_mines_status";
  DROP TYPE "public"."enum__mines_v_version_site_type";
  DROP TYPE "public"."enum__mines_v_version_extracted_materials";
  DROP TYPE "public"."enum__mines_v_version_country";
  DROP TYPE "public"."enum__mines_v_version_operating_status";
  DROP TYPE "public"."enum__mines_v_version_morphology";
  DROP TYPE "public"."enum__mines_v_version_follow_up_use";
  DROP TYPE "public"."enum__mines_v_version_status";
  DROP TYPE "public"."enum__mines_v_published_locale";`)
}
