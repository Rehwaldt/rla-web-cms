import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  // A news item's one image becomes its hero image, in the document and in every version (a hero
  // image set since the previous migration wins).
  await db.execute(sql`
  UPDATE "news" SET "hero_image_id" = "image_id" WHERE "hero_image_id" IS NULL;
  UPDATE "_news_v" SET "version_hero_image_id" = "version_image_id" WHERE "version_hero_image_id" IS NULL;`)
  await db.execute(sql`
   ALTER TABLE "news" DROP CONSTRAINT "news_image_id_media_id_fk";
  
  ALTER TABLE "_news_v" DROP CONSTRAINT "_news_v_version_image_id_media_id_fk";
  
  DROP INDEX "news_image_idx";
  DROP INDEX "_news_v_version_version_image_idx";
  ALTER TABLE "news" DROP COLUMN "image_id";
  ALTER TABLE "_news_v" DROP COLUMN "version_image_id";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "news" ADD COLUMN "image_id" integer;
  ALTER TABLE "_news_v" ADD COLUMN "version_image_id" integer;
  ALTER TABLE "news" ADD CONSTRAINT "news_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_news_v" ADD CONSTRAINT "_news_v_version_image_id_media_id_fk" FOREIGN KEY ("version_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "news_image_idx" ON "news" USING btree ("image_id");
  CREATE INDEX "_news_v_version_version_image_idx" ON "_news_v" USING btree ("version_image_id");`)
}
