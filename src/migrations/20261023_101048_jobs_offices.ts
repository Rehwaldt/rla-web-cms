import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "jobs_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"offices_id" integer
  );
  
  CREATE TABLE "_jobs_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"offices_id" integer
  );
  
  ALTER TABLE "jobs" DROP CONSTRAINT "jobs_office_id_offices_id_fk";
  
  ALTER TABLE "_jobs_v" DROP CONSTRAINT "_jobs_v_version_office_id_offices_id_fk";
  
  DROP INDEX "jobs_office_idx";
  DROP INDEX "_jobs_v_version_version_office_idx";
  ALTER TABLE "jobs_rels" ADD CONSTRAINT "jobs_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."jobs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "jobs_rels" ADD CONSTRAINT "jobs_rels_offices_fk" FOREIGN KEY ("offices_id") REFERENCES "public"."offices"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_jobs_v_rels" ADD CONSTRAINT "_jobs_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_jobs_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_jobs_v_rels" ADD CONSTRAINT "_jobs_v_rels_offices_fk" FOREIGN KEY ("offices_id") REFERENCES "public"."offices"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "jobs_rels_order_idx" ON "jobs_rels" USING btree ("order");
  CREATE INDEX "jobs_rels_parent_idx" ON "jobs_rels" USING btree ("parent_id");
  CREATE INDEX "jobs_rels_path_idx" ON "jobs_rels" USING btree ("path");
  CREATE INDEX "jobs_rels_offices_id_idx" ON "jobs_rels" USING btree ("offices_id");
  CREATE INDEX "_jobs_v_rels_order_idx" ON "_jobs_v_rels" USING btree ("order");
  CREATE INDEX "_jobs_v_rels_parent_idx" ON "_jobs_v_rels" USING btree ("parent_id");
  CREATE INDEX "_jobs_v_rels_path_idx" ON "_jobs_v_rels" USING btree ("path");
  CREATE INDEX "_jobs_v_rels_offices_id_idx" ON "_jobs_v_rels" USING btree ("offices_id");
  ALTER TABLE "jobs" DROP COLUMN "office_id";
  ALTER TABLE "_jobs_v" DROP COLUMN "version_office_id";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "jobs_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_jobs_v_rels" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "jobs_rels" CASCADE;
  DROP TABLE "_jobs_v_rels" CASCADE;
  ALTER TABLE "jobs" ADD COLUMN "office_id" integer;
  ALTER TABLE "_jobs_v" ADD COLUMN "version_office_id" integer;
  ALTER TABLE "jobs" ADD CONSTRAINT "jobs_office_id_offices_id_fk" FOREIGN KEY ("office_id") REFERENCES "public"."offices"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_jobs_v" ADD CONSTRAINT "_jobs_v_version_office_id_offices_id_fk" FOREIGN KEY ("version_office_id") REFERENCES "public"."offices"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "jobs_office_idx" ON "jobs" USING btree ("office_id");
  CREATE INDEX "_jobs_v_version_version_office_idx" ON "_jobs_v" USING btree ("version_office_id");`)
}
