import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_offices_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__offices_v_version_address_country" AS ENUM('AU', 'AT', 'BA', 'BG', 'CN', 'CZ', 'FI', 'FR', 'DE', 'XK', 'ME', 'MK', 'NO', 'PL', 'RU', 'RS', 'KR', 'CH', 'TR');
  CREATE TYPE "public"."enum__offices_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__offices_v_published_locale" AS ENUM('de', 'en', 'zh', 'cs');
  CREATE TABLE "_offices_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version__order" varchar,
  	"version_leader_id" integer,
  	"version_image_id" integer,
  	"version_address_street" varchar,
  	"version_address_postal_code" varchar,
  	"version_address_country" "enum__offices_v_version_address_country",
  	"version_address_coordinates" geometry(Point),
  	"version_contact_phone" varchar,
  	"version_contact_fax" varchar,
  	"version_contact_email" varchar,
  	"version_contact_team_email" varchar,
  	"version_legacy_id" numeric,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__offices_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__offices_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_offices_v_locales" (
  	"version_name" varchar,
  	"version_description" jsonb,
  	"version_address_company" varchar,
  	"version_address_city" varchar,
  	"version_contact_note" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "offices" ADD COLUMN "_status" "enum_offices_status" DEFAULT 'draft';
  ALTER TABLE "_offices_v" ADD CONSTRAINT "_offices_v_parent_id_offices_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."offices"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_offices_v" ADD CONSTRAINT "_offices_v_version_leader_id_employees_id_fk" FOREIGN KEY ("version_leader_id") REFERENCES "public"."employees"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_offices_v" ADD CONSTRAINT "_offices_v_version_image_id_media_id_fk" FOREIGN KEY ("version_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_offices_v_locales" ADD CONSTRAINT "_offices_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_offices_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "_offices_v_parent_idx" ON "_offices_v" USING btree ("parent_id");
  CREATE INDEX "_offices_v_version_version__order_idx" ON "_offices_v" USING btree ("version__order");
  CREATE INDEX "_offices_v_version_version_leader_idx" ON "_offices_v" USING btree ("version_leader_id");
  CREATE INDEX "_offices_v_version_version_image_idx" ON "_offices_v" USING btree ("version_image_id");
  CREATE INDEX "_offices_v_version_version_legacy_id_idx" ON "_offices_v" USING btree ("version_legacy_id");
  CREATE INDEX "_offices_v_version_version_updated_at_idx" ON "_offices_v" USING btree ("version_updated_at");
  CREATE INDEX "_offices_v_version_version_created_at_idx" ON "_offices_v" USING btree ("version_created_at");
  CREATE INDEX "_offices_v_version_version__status_idx" ON "_offices_v" USING btree ("version__status");
  CREATE INDEX "_offices_v_created_at_idx" ON "_offices_v" USING btree ("created_at");
  CREATE INDEX "_offices_v_updated_at_idx" ON "_offices_v" USING btree ("updated_at");
  CREATE INDEX "_offices_v_snapshot_idx" ON "_offices_v" USING btree ("snapshot");
  CREATE INDEX "_offices_v_published_locale_idx" ON "_offices_v" USING btree ("published_locale");
  CREATE INDEX "_offices_v_latest_idx" ON "_offices_v" USING btree ("latest");
  CREATE UNIQUE INDEX "_offices_v_locales_locale_parent_id_unique" ON "_offices_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "offices__status_idx" ON "offices" USING btree ("_status");`)

  // The imported offices stay on the website. Offices created in the admin since the cutover start
  // as drafts until an editor publishes them.
  await db.execute(sql`
   UPDATE "offices" SET "_status" = 'published' WHERE "legacy_id" IS NOT NULL;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "_offices_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_offices_v_locales" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "_offices_v" CASCADE;
  DROP TABLE "_offices_v_locales" CASCADE;
  DROP INDEX "offices__status_idx";
  ALTER TABLE "offices" DROP COLUMN "_status";
  DROP TYPE "public"."enum_offices_status";
  DROP TYPE "public"."enum__offices_v_version_address_country";
  DROP TYPE "public"."enum__offices_v_version_status";
  DROP TYPE "public"."enum__offices_v_published_locale";`)
}
