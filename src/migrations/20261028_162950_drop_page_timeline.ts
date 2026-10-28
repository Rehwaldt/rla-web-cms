import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// Drops the pages' timeline (#46), which 20261028_161714_page_timeline_into_content copied into
// the content. Down brings the tables back empty.
export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "pages_timeline" CASCADE;
  DROP TABLE "_pages_v_version_timeline" CASCADE;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "pages_timeline" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"period" varchar,
  	"text" varchar
  );
  
  CREATE TABLE "_pages_v_version_timeline" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"period" varchar,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  ALTER TABLE "pages_timeline" ADD CONSTRAINT "pages_timeline_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_version_timeline" ADD CONSTRAINT "_pages_v_version_timeline_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_timeline_order_idx" ON "pages_timeline" USING btree ("_order");
  CREATE INDEX "pages_timeline_parent_id_idx" ON "pages_timeline" USING btree ("_parent_id");
  CREATE INDEX "pages_timeline_locale_idx" ON "pages_timeline" USING btree ("_locale");
  CREATE INDEX "_pages_v_version_timeline_order_idx" ON "_pages_v_version_timeline" USING btree ("_order");
  CREATE INDEX "_pages_v_version_timeline_parent_id_idx" ON "_pages_v_version_timeline" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_version_timeline_locale_idx" ON "_pages_v_version_timeline" USING btree ("_locale");`)
}
