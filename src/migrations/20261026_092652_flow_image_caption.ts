import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "projects_blocks_image_locales" (
  	"caption" varchar,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "_projects_v_blocks_image_locales" (
  	"caption" varchar,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "topics_blocks_image_locales" (
  	"caption" varchar,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "_topics_v_blocks_image_locales" (
  	"caption" varchar,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "pages_blocks_image" ADD COLUMN "caption" varchar;
  ALTER TABLE "pages_blocks_image" ADD COLUMN "description" varchar;
  ALTER TABLE "_pages_v_blocks_image" ADD COLUMN "caption" varchar;
  ALTER TABLE "_pages_v_blocks_image" ADD COLUMN "description" varchar;
  ALTER TABLE "projects_blocks_image_locales" ADD CONSTRAINT "projects_blocks_image_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects_blocks_image"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_blocks_image_locales" ADD CONSTRAINT "_projects_v_blocks_image_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_projects_v_blocks_image"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "topics_blocks_image_locales" ADD CONSTRAINT "topics_blocks_image_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."topics_blocks_image"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_topics_v_blocks_image_locales" ADD CONSTRAINT "_topics_v_blocks_image_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_topics_v_blocks_image"("id") ON DELETE cascade ON UPDATE no action;
  CREATE UNIQUE INDEX "projects_blocks_image_locales_locale_parent_id_unique" ON "projects_blocks_image_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "_projects_v_blocks_image_locales_locale_parent_id_unique" ON "_projects_v_blocks_image_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "topics_blocks_image_locales_locale_parent_id_unique" ON "topics_blocks_image_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "_topics_v_blocks_image_locales_locale_parent_id_unique" ON "_topics_v_blocks_image_locales" USING btree ("_locale","_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "projects_blocks_image_locales" CASCADE;
  DROP TABLE "_projects_v_blocks_image_locales" CASCADE;
  DROP TABLE "topics_blocks_image_locales" CASCADE;
  DROP TABLE "_topics_v_blocks_image_locales" CASCADE;
  ALTER TABLE "pages_blocks_image" DROP COLUMN "caption";
  ALTER TABLE "pages_blocks_image" DROP COLUMN "description";
  ALTER TABLE "_pages_v_blocks_image" DROP COLUMN "caption";
  ALTER TABLE "_pages_v_blocks_image" DROP COLUMN "description";`)
}
