import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  // A page's news references become its featured news, per language and in their flow order, in
  // the document and in every version. Projects and topics have no featured news; their news
  // references (none so far) are dropped.
  await db.execute(sql`
  INSERT INTO "pages_rels" ("order", "parent_id", "path", "locale", "news_id")
  SELECT row_number() OVER (PARTITION BY "_parent_id", "_locale" ORDER BY "_order"), "_parent_id", 'featuredNews', "_locale", "news_id"
  FROM "pages_blocks_news_reference" WHERE "news_id" IS NOT NULL;
  INSERT INTO "_pages_v_rels" ("order", "parent_id", "path", "locale", "news_id")
  SELECT row_number() OVER (PARTITION BY "_parent_id", "_locale" ORDER BY "_order"), "_parent_id", 'version.featuredNews', "_locale", "news_id"
  FROM "_pages_v_blocks_news_reference" WHERE "news_id" IS NOT NULL;`)
  await db.execute(sql`
   DROP TABLE "projects_blocks_news_reference_modifiers" CASCADE;
  DROP TABLE "projects_blocks_news_reference" CASCADE;
  DROP TABLE "_projects_v_blocks_news_reference_modifiers" CASCADE;
  DROP TABLE "_projects_v_blocks_news_reference" CASCADE;
  DROP TABLE "pages_blocks_news_reference_modifiers" CASCADE;
  DROP TABLE "pages_blocks_news_reference" CASCADE;
  DROP TABLE "_pages_v_blocks_news_reference_modifiers" CASCADE;
  DROP TABLE "_pages_v_blocks_news_reference" CASCADE;
  DROP TABLE "topics_blocks_news_reference_modifiers" CASCADE;
  DROP TABLE "topics_blocks_news_reference" CASCADE;
  DROP TABLE "_topics_v_blocks_news_reference_modifiers" CASCADE;
  DROP TABLE "_topics_v_blocks_news_reference" CASCADE;
  DROP TYPE "public"."enum_projects_blocks_news_reference_modifiers";
  DROP TYPE "public"."enum_projects_blocks_news_reference_size";
  DROP TYPE "public"."enum__projects_v_blocks_news_reference_modifiers";
  DROP TYPE "public"."enum__projects_v_blocks_news_reference_size";
  DROP TYPE "public"."enum_pages_blocks_news_reference_modifiers";
  DROP TYPE "public"."enum_pages_blocks_news_reference_size";
  DROP TYPE "public"."enum__pages_v_blocks_news_reference_modifiers";
  DROP TYPE "public"."enum__pages_v_blocks_news_reference_size";
  DROP TYPE "public"."enum_topics_blocks_news_reference_modifiers";
  DROP TYPE "public"."enum_topics_blocks_news_reference_size";
  DROP TYPE "public"."enum__topics_v_blocks_news_reference_modifiers";
  DROP TYPE "public"."enum__topics_v_blocks_news_reference_size";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_projects_blocks_news_reference_modifiers" AS ENUM('clear', 'right', 'center', 'crop', 'topmargin');
  CREATE TYPE "public"."enum_projects_blocks_news_reference_size" AS ENUM('one6', 'one4', 'one3', 'one2', 'two3', 'full');
  CREATE TYPE "public"."enum__projects_v_blocks_news_reference_modifiers" AS ENUM('clear', 'right', 'center', 'crop', 'topmargin');
  CREATE TYPE "public"."enum__projects_v_blocks_news_reference_size" AS ENUM('one6', 'one4', 'one3', 'one2', 'two3', 'full');
  CREATE TYPE "public"."enum_pages_blocks_news_reference_modifiers" AS ENUM('clear', 'right', 'center', 'crop', 'topmargin');
  CREATE TYPE "public"."enum_pages_blocks_news_reference_size" AS ENUM('one6', 'one4', 'one3', 'one2', 'two3', 'full');
  CREATE TYPE "public"."enum__pages_v_blocks_news_reference_modifiers" AS ENUM('clear', 'right', 'center', 'crop', 'topmargin');
  CREATE TYPE "public"."enum__pages_v_blocks_news_reference_size" AS ENUM('one6', 'one4', 'one3', 'one2', 'two3', 'full');
  CREATE TYPE "public"."enum_topics_blocks_news_reference_modifiers" AS ENUM('clear', 'right', 'center', 'crop', 'topmargin');
  CREATE TYPE "public"."enum_topics_blocks_news_reference_size" AS ENUM('one6', 'one4', 'one3', 'one2', 'two3', 'full');
  CREATE TYPE "public"."enum__topics_v_blocks_news_reference_modifiers" AS ENUM('clear', 'right', 'center', 'crop', 'topmargin');
  CREATE TYPE "public"."enum__topics_v_blocks_news_reference_size" AS ENUM('one6', 'one4', 'one3', 'one2', 'two3', 'full');
  CREATE TABLE "projects_blocks_news_reference_modifiers" (
  	"order" integer NOT NULL,
  	"parent_id" varchar NOT NULL,
  	"value" "enum_projects_blocks_news_reference_modifiers",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "projects_blocks_news_reference" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"news_id" integer,
  	"size" "enum_projects_blocks_news_reference_size" DEFAULT 'one3',
  	"block_name" varchar
  );
  
  CREATE TABLE "_projects_v_blocks_news_reference_modifiers" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__projects_v_blocks_news_reference_modifiers",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_projects_v_blocks_news_reference" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"news_id" integer,
  	"size" "enum__projects_v_blocks_news_reference_size" DEFAULT 'one3',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_news_reference_modifiers" (
  	"order" integer NOT NULL,
  	"parent_id" varchar NOT NULL,
  	"value" "enum_pages_blocks_news_reference_modifiers",
  	"locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "pages_blocks_news_reference" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"news_id" integer,
  	"size" "enum_pages_blocks_news_reference_size" DEFAULT 'one3',
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_news_reference_modifiers" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__pages_v_blocks_news_reference_modifiers",
  	"locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_news_reference" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"news_id" integer,
  	"size" "enum__pages_v_blocks_news_reference_size" DEFAULT 'one3',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "topics_blocks_news_reference_modifiers" (
  	"order" integer NOT NULL,
  	"parent_id" varchar NOT NULL,
  	"value" "enum_topics_blocks_news_reference_modifiers",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "topics_blocks_news_reference" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"news_id" integer,
  	"size" "enum_topics_blocks_news_reference_size" DEFAULT 'one3',
  	"block_name" varchar
  );
  
  CREATE TABLE "_topics_v_blocks_news_reference_modifiers" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__topics_v_blocks_news_reference_modifiers",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_topics_v_blocks_news_reference" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"news_id" integer,
  	"size" "enum__topics_v_blocks_news_reference_size" DEFAULT 'one3',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  ALTER TABLE "projects_blocks_news_reference_modifiers" ADD CONSTRAINT "projects_blocks_news_reference_modifiers_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."projects_blocks_news_reference"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_blocks_news_reference" ADD CONSTRAINT "projects_blocks_news_reference_news_id_news_id_fk" FOREIGN KEY ("news_id") REFERENCES "public"."news"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "projects_blocks_news_reference" ADD CONSTRAINT "projects_blocks_news_reference_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_blocks_news_reference_modifiers" ADD CONSTRAINT "_projects_v_blocks_news_reference_modifiers_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_projects_v_blocks_news_reference"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_blocks_news_reference" ADD CONSTRAINT "_projects_v_blocks_news_reference_news_id_news_id_fk" FOREIGN KEY ("news_id") REFERENCES "public"."news"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_projects_v_blocks_news_reference" ADD CONSTRAINT "_projects_v_blocks_news_reference_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_projects_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_news_reference_modifiers" ADD CONSTRAINT "pages_blocks_news_reference_modifiers_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages_blocks_news_reference"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_news_reference" ADD CONSTRAINT "pages_blocks_news_reference_news_id_news_id_fk" FOREIGN KEY ("news_id") REFERENCES "public"."news"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_news_reference" ADD CONSTRAINT "pages_blocks_news_reference_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_news_reference_modifiers" ADD CONSTRAINT "_pages_v_blocks_news_reference_modifiers_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_pages_v_blocks_news_reference"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_news_reference" ADD CONSTRAINT "_pages_v_blocks_news_reference_news_id_news_id_fk" FOREIGN KEY ("news_id") REFERENCES "public"."news"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_news_reference" ADD CONSTRAINT "_pages_v_blocks_news_reference_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "topics_blocks_news_reference_modifiers" ADD CONSTRAINT "topics_blocks_news_reference_modifiers_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."topics_blocks_news_reference"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "topics_blocks_news_reference" ADD CONSTRAINT "topics_blocks_news_reference_news_id_news_id_fk" FOREIGN KEY ("news_id") REFERENCES "public"."news"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "topics_blocks_news_reference" ADD CONSTRAINT "topics_blocks_news_reference_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."topics"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_topics_v_blocks_news_reference_modifiers" ADD CONSTRAINT "_topics_v_blocks_news_reference_modifiers_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_topics_v_blocks_news_reference"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_topics_v_blocks_news_reference" ADD CONSTRAINT "_topics_v_blocks_news_reference_news_id_news_id_fk" FOREIGN KEY ("news_id") REFERENCES "public"."news"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_topics_v_blocks_news_reference" ADD CONSTRAINT "_topics_v_blocks_news_reference_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_topics_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "projects_blocks_news_reference_modifiers_order_idx" ON "projects_blocks_news_reference_modifiers" USING btree ("order");
  CREATE INDEX "projects_blocks_news_reference_modifiers_parent_idx" ON "projects_blocks_news_reference_modifiers" USING btree ("parent_id");
  CREATE INDEX "projects_blocks_news_reference_order_idx" ON "projects_blocks_news_reference" USING btree ("_order");
  CREATE INDEX "projects_blocks_news_reference_parent_id_idx" ON "projects_blocks_news_reference" USING btree ("_parent_id");
  CREATE INDEX "projects_blocks_news_reference_path_idx" ON "projects_blocks_news_reference" USING btree ("_path");
  CREATE INDEX "projects_blocks_news_reference_news_idx" ON "projects_blocks_news_reference" USING btree ("news_id");
  CREATE INDEX "_projects_v_blocks_news_reference_modifiers_order_idx" ON "_projects_v_blocks_news_reference_modifiers" USING btree ("order");
  CREATE INDEX "_projects_v_blocks_news_reference_modifiers_parent_idx" ON "_projects_v_blocks_news_reference_modifiers" USING btree ("parent_id");
  CREATE INDEX "_projects_v_blocks_news_reference_order_idx" ON "_projects_v_blocks_news_reference" USING btree ("_order");
  CREATE INDEX "_projects_v_blocks_news_reference_parent_id_idx" ON "_projects_v_blocks_news_reference" USING btree ("_parent_id");
  CREATE INDEX "_projects_v_blocks_news_reference_path_idx" ON "_projects_v_blocks_news_reference" USING btree ("_path");
  CREATE INDEX "_projects_v_blocks_news_reference_news_idx" ON "_projects_v_blocks_news_reference" USING btree ("news_id");
  CREATE INDEX "pages_blocks_news_reference_modifiers_order_idx" ON "pages_blocks_news_reference_modifiers" USING btree ("order");
  CREATE INDEX "pages_blocks_news_reference_modifiers_parent_idx" ON "pages_blocks_news_reference_modifiers" USING btree ("parent_id");
  CREATE INDEX "pages_blocks_news_reference_modifiers_locale_idx" ON "pages_blocks_news_reference_modifiers" USING btree ("locale");
  CREATE INDEX "pages_blocks_news_reference_order_idx" ON "pages_blocks_news_reference" USING btree ("_order");
  CREATE INDEX "pages_blocks_news_reference_parent_id_idx" ON "pages_blocks_news_reference" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_news_reference_path_idx" ON "pages_blocks_news_reference" USING btree ("_path");
  CREATE INDEX "pages_blocks_news_reference_locale_idx" ON "pages_blocks_news_reference" USING btree ("_locale");
  CREATE INDEX "pages_blocks_news_reference_news_idx" ON "pages_blocks_news_reference" USING btree ("news_id");
  CREATE INDEX "_pages_v_blocks_news_reference_modifiers_order_idx" ON "_pages_v_blocks_news_reference_modifiers" USING btree ("order");
  CREATE INDEX "_pages_v_blocks_news_reference_modifiers_parent_idx" ON "_pages_v_blocks_news_reference_modifiers" USING btree ("parent_id");
  CREATE INDEX "_pages_v_blocks_news_reference_modifiers_locale_idx" ON "_pages_v_blocks_news_reference_modifiers" USING btree ("locale");
  CREATE INDEX "_pages_v_blocks_news_reference_order_idx" ON "_pages_v_blocks_news_reference" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_news_reference_parent_id_idx" ON "_pages_v_blocks_news_reference" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_news_reference_path_idx" ON "_pages_v_blocks_news_reference" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_news_reference_locale_idx" ON "_pages_v_blocks_news_reference" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_news_reference_news_idx" ON "_pages_v_blocks_news_reference" USING btree ("news_id");
  CREATE INDEX "topics_blocks_news_reference_modifiers_order_idx" ON "topics_blocks_news_reference_modifiers" USING btree ("order");
  CREATE INDEX "topics_blocks_news_reference_modifiers_parent_idx" ON "topics_blocks_news_reference_modifiers" USING btree ("parent_id");
  CREATE INDEX "topics_blocks_news_reference_order_idx" ON "topics_blocks_news_reference" USING btree ("_order");
  CREATE INDEX "topics_blocks_news_reference_parent_id_idx" ON "topics_blocks_news_reference" USING btree ("_parent_id");
  CREATE INDEX "topics_blocks_news_reference_path_idx" ON "topics_blocks_news_reference" USING btree ("_path");
  CREATE INDEX "topics_blocks_news_reference_news_idx" ON "topics_blocks_news_reference" USING btree ("news_id");
  CREATE INDEX "_topics_v_blocks_news_reference_modifiers_order_idx" ON "_topics_v_blocks_news_reference_modifiers" USING btree ("order");
  CREATE INDEX "_topics_v_blocks_news_reference_modifiers_parent_idx" ON "_topics_v_blocks_news_reference_modifiers" USING btree ("parent_id");
  CREATE INDEX "_topics_v_blocks_news_reference_order_idx" ON "_topics_v_blocks_news_reference" USING btree ("_order");
  CREATE INDEX "_topics_v_blocks_news_reference_parent_id_idx" ON "_topics_v_blocks_news_reference" USING btree ("_parent_id");
  CREATE INDEX "_topics_v_blocks_news_reference_path_idx" ON "_topics_v_blocks_news_reference" USING btree ("_path");
  CREATE INDEX "_topics_v_blocks_news_reference_news_idx" ON "_topics_v_blocks_news_reference" USING btree ("news_id");`)
}
