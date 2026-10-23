import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_excursions_days_stops_links_kind" AS ENUM('project', 'external');
  CREATE TYPE "public"."enum_excursions_days_stops_type" AS ENUM('default', 'optional', 'break', 'meetUp', 'food');
  CREATE TYPE "public"."enum_excursions_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__excursions_v_version_days_stops_links_kind" AS ENUM('project', 'external');
  CREATE TYPE "public"."enum__excursions_v_version_days_stops_type" AS ENUM('default', 'optional', 'break', 'meetUp', 'food');
  CREATE TYPE "public"."enum__excursions_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__excursions_v_published_locale" AS ENUM('de', 'en', 'zh', 'cs');
  CREATE TABLE "excursions_days_stops_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"kind" "enum_excursions_days_stops_links_kind" DEFAULT 'external',
  	"label" varchar,
  	"project_id" integer,
  	"url" varchar
  );
  
  CREATE TABLE "excursions_days_stops" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"type" "enum_excursions_days_stops_type" DEFAULT 'default',
  	"time" varchar,
  	"location" geometry(Point),
  	"guided_by" varchar,
  	"completion_year" numeric
  );
  
  CREATE TABLE "excursions_days_stops_locales" (
  	"title" varchar,
  	"description" jsonb,
  	"designed_by" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "excursions_days" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"date" timestamp(3) with time zone
  );
  
  CREATE TABLE "excursions" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_excursions_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "excursions_locales" (
  	"title" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "excursions_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer
  );
  
  CREATE TABLE "_excursions_v_version_days_stops_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"kind" "enum__excursions_v_version_days_stops_links_kind" DEFAULT 'external',
  	"label" varchar,
  	"project_id" integer,
  	"url" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_excursions_v_version_days_stops" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"type" "enum__excursions_v_version_days_stops_type" DEFAULT 'default',
  	"time" varchar,
  	"location" geometry(Point),
  	"guided_by" varchar,
  	"completion_year" numeric,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_excursions_v_version_days_stops_locales" (
  	"title" varchar,
  	"description" jsonb,
  	"designed_by" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_excursions_v_version_days" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"date" timestamp(3) with time zone,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_excursions_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_slug" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__excursions_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__excursions_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_excursions_v_locales" (
  	"version_title" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_excursions_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "excursions_id" integer;
  ALTER TABLE "excursions_days_stops_links" ADD CONSTRAINT "excursions_days_stops_links_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "excursions_days_stops_links" ADD CONSTRAINT "excursions_days_stops_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."excursions_days_stops"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "excursions_days_stops" ADD CONSTRAINT "excursions_days_stops_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."excursions_days"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "excursions_days_stops_locales" ADD CONSTRAINT "excursions_days_stops_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."excursions_days_stops"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "excursions_days" ADD CONSTRAINT "excursions_days_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."excursions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "excursions_locales" ADD CONSTRAINT "excursions_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."excursions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "excursions_rels" ADD CONSTRAINT "excursions_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."excursions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "excursions_rels" ADD CONSTRAINT "excursions_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_excursions_v_version_days_stops_links" ADD CONSTRAINT "_excursions_v_version_days_stops_links_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_excursions_v_version_days_stops_links" ADD CONSTRAINT "_excursions_v_version_days_stops_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_excursions_v_version_days_stops"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_excursions_v_version_days_stops" ADD CONSTRAINT "_excursions_v_version_days_stops_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_excursions_v_version_days"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_excursions_v_version_days_stops_locales" ADD CONSTRAINT "_excursions_v_version_days_stops_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_excursions_v_version_days_stops"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_excursions_v_version_days" ADD CONSTRAINT "_excursions_v_version_days_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_excursions_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_excursions_v" ADD CONSTRAINT "_excursions_v_parent_id_excursions_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."excursions"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_excursions_v_locales" ADD CONSTRAINT "_excursions_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_excursions_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_excursions_v_rels" ADD CONSTRAINT "_excursions_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_excursions_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_excursions_v_rels" ADD CONSTRAINT "_excursions_v_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "excursions_days_stops_links_order_idx" ON "excursions_days_stops_links" USING btree ("_order");
  CREATE INDEX "excursions_days_stops_links_parent_id_idx" ON "excursions_days_stops_links" USING btree ("_parent_id");
  CREATE INDEX "excursions_days_stops_links_locale_idx" ON "excursions_days_stops_links" USING btree ("_locale");
  CREATE INDEX "excursions_days_stops_links_project_idx" ON "excursions_days_stops_links" USING btree ("project_id");
  CREATE INDEX "excursions_days_stops_order_idx" ON "excursions_days_stops" USING btree ("_order");
  CREATE INDEX "excursions_days_stops_parent_id_idx" ON "excursions_days_stops" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "excursions_days_stops_locales_locale_parent_id_unique" ON "excursions_days_stops_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "excursions_days_order_idx" ON "excursions_days" USING btree ("_order");
  CREATE INDEX "excursions_days_parent_id_idx" ON "excursions_days" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "excursions_slug_idx" ON "excursions" USING btree ("slug");
  CREATE INDEX "excursions_updated_at_idx" ON "excursions" USING btree ("updated_at");
  CREATE INDEX "excursions_created_at_idx" ON "excursions" USING btree ("created_at");
  CREATE INDEX "excursions__status_idx" ON "excursions" USING btree ("_status");
  CREATE UNIQUE INDEX "excursions_locales_locale_parent_id_unique" ON "excursions_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "excursions_rels_order_idx" ON "excursions_rels" USING btree ("order");
  CREATE INDEX "excursions_rels_parent_idx" ON "excursions_rels" USING btree ("parent_id");
  CREATE INDEX "excursions_rels_path_idx" ON "excursions_rels" USING btree ("path");
  CREATE INDEX "excursions_rels_media_id_idx" ON "excursions_rels" USING btree ("media_id");
  CREATE INDEX "_excursions_v_version_days_stops_links_order_idx" ON "_excursions_v_version_days_stops_links" USING btree ("_order");
  CREATE INDEX "_excursions_v_version_days_stops_links_parent_id_idx" ON "_excursions_v_version_days_stops_links" USING btree ("_parent_id");
  CREATE INDEX "_excursions_v_version_days_stops_links_locale_idx" ON "_excursions_v_version_days_stops_links" USING btree ("_locale");
  CREATE INDEX "_excursions_v_version_days_stops_links_project_idx" ON "_excursions_v_version_days_stops_links" USING btree ("project_id");
  CREATE INDEX "_excursions_v_version_days_stops_order_idx" ON "_excursions_v_version_days_stops" USING btree ("_order");
  CREATE INDEX "_excursions_v_version_days_stops_parent_id_idx" ON "_excursions_v_version_days_stops" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_excursions_v_version_days_stops_locales_locale_parent_id_un" ON "_excursions_v_version_days_stops_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_excursions_v_version_days_order_idx" ON "_excursions_v_version_days" USING btree ("_order");
  CREATE INDEX "_excursions_v_version_days_parent_id_idx" ON "_excursions_v_version_days" USING btree ("_parent_id");
  CREATE INDEX "_excursions_v_parent_idx" ON "_excursions_v" USING btree ("parent_id");
  CREATE INDEX "_excursions_v_version_version_slug_idx" ON "_excursions_v" USING btree ("version_slug");
  CREATE INDEX "_excursions_v_version_version_updated_at_idx" ON "_excursions_v" USING btree ("version_updated_at");
  CREATE INDEX "_excursions_v_version_version_created_at_idx" ON "_excursions_v" USING btree ("version_created_at");
  CREATE INDEX "_excursions_v_version_version__status_idx" ON "_excursions_v" USING btree ("version__status");
  CREATE INDEX "_excursions_v_created_at_idx" ON "_excursions_v" USING btree ("created_at");
  CREATE INDEX "_excursions_v_updated_at_idx" ON "_excursions_v" USING btree ("updated_at");
  CREATE INDEX "_excursions_v_snapshot_idx" ON "_excursions_v" USING btree ("snapshot");
  CREATE INDEX "_excursions_v_published_locale_idx" ON "_excursions_v" USING btree ("published_locale");
  CREATE INDEX "_excursions_v_latest_idx" ON "_excursions_v" USING btree ("latest");
  CREATE UNIQUE INDEX "_excursions_v_locales_locale_parent_id_unique" ON "_excursions_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_excursions_v_rels_order_idx" ON "_excursions_v_rels" USING btree ("order");
  CREATE INDEX "_excursions_v_rels_parent_idx" ON "_excursions_v_rels" USING btree ("parent_id");
  CREATE INDEX "_excursions_v_rels_path_idx" ON "_excursions_v_rels" USING btree ("path");
  CREATE INDEX "_excursions_v_rels_media_id_idx" ON "_excursions_v_rels" USING btree ("media_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_excursions_fk" FOREIGN KEY ("excursions_id") REFERENCES "public"."excursions"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_excursions_id_idx" ON "payload_locked_documents_rels" USING btree ("excursions_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "excursions_days_stops_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "excursions_days_stops" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "excursions_days_stops_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "excursions_days" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "excursions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "excursions_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "excursions_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_excursions_v_version_days_stops_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_excursions_v_version_days_stops" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_excursions_v_version_days_stops_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_excursions_v_version_days" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_excursions_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_excursions_v_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_excursions_v_rels" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "excursions_days_stops_links" CASCADE;
  DROP TABLE "excursions_days_stops" CASCADE;
  DROP TABLE "excursions_days_stops_locales" CASCADE;
  DROP TABLE "excursions_days" CASCADE;
  DROP TABLE "excursions" CASCADE;
  DROP TABLE "excursions_locales" CASCADE;
  DROP TABLE "excursions_rels" CASCADE;
  DROP TABLE "_excursions_v_version_days_stops_links" CASCADE;
  DROP TABLE "_excursions_v_version_days_stops" CASCADE;
  DROP TABLE "_excursions_v_version_days_stops_locales" CASCADE;
  DROP TABLE "_excursions_v_version_days" CASCADE;
  DROP TABLE "_excursions_v" CASCADE;
  DROP TABLE "_excursions_v_locales" CASCADE;
  DROP TABLE "_excursions_v_rels" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_excursions_fk";
  
  DROP INDEX "payload_locked_documents_rels_excursions_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "excursions_id";
  DROP TYPE "public"."enum_excursions_days_stops_links_kind";
  DROP TYPE "public"."enum_excursions_days_stops_type";
  DROP TYPE "public"."enum_excursions_status";
  DROP TYPE "public"."enum__excursions_v_version_days_stops_links_kind";
  DROP TYPE "public"."enum__excursions_v_version_days_stops_type";
  DROP TYPE "public"."enum__excursions_v_version_status";
  DROP TYPE "public"."enum__excursions_v_published_locale";`)
}
