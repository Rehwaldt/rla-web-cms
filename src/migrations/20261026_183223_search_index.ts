import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "search_index" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"doc_collection" varchar NOT NULL,
  	"doc_id" numeric NOT NULL,
  	"language" varchar NOT NULL,
  	"title" varchar,
  	"secondary" varchar,
  	"body" varchar,
  	"title_folded" varchar,
  	"secondary_folded" varchar,
  	"body_folded" varchar,
  	"image" numeric,
  	"code" varchar,
  	"category" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "search_index_id" integer;
  CREATE INDEX "search_index_doc_collection_idx" ON "search_index" USING btree ("doc_collection");
  CREATE INDEX "search_index_doc_id_idx" ON "search_index" USING btree ("doc_id");
  CREATE INDEX "search_index_language_idx" ON "search_index" USING btree ("language");
  CREATE INDEX "search_index_updated_at_idx" ON "search_index" USING btree ("updated_at");
  CREATE INDEX "search_index_created_at_idx" ON "search_index" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_search_index_fk" FOREIGN KEY ("search_index_id") REFERENCES "public"."search_index"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_search_index_id_idx" ON "payload_locked_documents_rels" USING btree ("search_index_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "search_index" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "search_index" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_search_index_fk";
  
  DROP INDEX "payload_locked_documents_rels_search_index_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "search_index_id";`)
}
