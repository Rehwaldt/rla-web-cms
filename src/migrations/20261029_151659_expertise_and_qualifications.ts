import crypto from 'crypto'
import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// Specialist groups (expertise) and the intranet ids, and the employees' single qualification text
// becomes a list. The old texts mixed certificates with Czech chamber authorizations
// ("autorizovaný krajinářský architekt od roku 2019 / vedoucí pražské kanceláře"): those parts move
// to the chamber membership, the rest become entries. Other texts stay one entry, since a " / " can
// be part of them. Status notes ("V současnosti na mateřské dovolené.", on parental leave) are no
// qualification and stay behind. The old field stays until the website reads the list.
const isChamber = (part: string) => /^autorizovan/i.test(part)
const isStatusNote = (part: string) => /mateřsk|rodičovsk|elternzeit|mutterschutz|parental|maternity/i.test(part)
const splitQualification = (text: string) => {
  const parts = /autorizovan/i.test(text) ? text.split(/\s+\/\s+/) : [text]
  const trimmed = parts.map((part) => part.trim()).filter((part) => part && !isStatusNote(part))
  return {
    chamber: trimmed.filter(isChamber).join(' / '),
    entries: trimmed.filter((part) => !isChamber(part)),
  }
}
type Row = Record<string, unknown>

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "employees_qualifications" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar
  );
  
  CREATE TABLE "employees_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"expertise_id" integer
  );
  
  CREATE TABLE "_employees_v_version_qualifications" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_employees_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"expertise_id" integer
  );
  
  CREATE TABLE "expertise_breadcrumbs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"doc_id" integer,
  	"url" varchar,
  	"label" varchar
  );
  
  CREATE TABLE "expertise" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"_order" varchar,
  	"intranet_id" numeric,
  	"parent_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "expertise_locales" (
  	"name" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "employees" ADD COLUMN "intranet_id" numeric;
  ALTER TABLE "_employees_v" ADD COLUMN "version_intranet_id" numeric;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "expertise_id" integer;
  ALTER TABLE "employees_qualifications" ADD CONSTRAINT "employees_qualifications_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."employees"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "employees_rels" ADD CONSTRAINT "employees_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."employees"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "employees_rels" ADD CONSTRAINT "employees_rels_expertise_fk" FOREIGN KEY ("expertise_id") REFERENCES "public"."expertise"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_employees_v_version_qualifications" ADD CONSTRAINT "_employees_v_version_qualifications_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_employees_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_employees_v_rels" ADD CONSTRAINT "_employees_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_employees_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_employees_v_rels" ADD CONSTRAINT "_employees_v_rels_expertise_fk" FOREIGN KEY ("expertise_id") REFERENCES "public"."expertise"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "expertise_breadcrumbs" ADD CONSTRAINT "expertise_breadcrumbs_doc_id_expertise_id_fk" FOREIGN KEY ("doc_id") REFERENCES "public"."expertise"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "expertise_breadcrumbs" ADD CONSTRAINT "expertise_breadcrumbs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."expertise"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "expertise" ADD CONSTRAINT "expertise_parent_id_expertise_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."expertise"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "expertise_locales" ADD CONSTRAINT "expertise_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."expertise"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "employees_qualifications_order_idx" ON "employees_qualifications" USING btree ("_order");
  CREATE INDEX "employees_qualifications_parent_id_idx" ON "employees_qualifications" USING btree ("_parent_id");
  CREATE INDEX "employees_qualifications_locale_idx" ON "employees_qualifications" USING btree ("_locale");
  CREATE INDEX "employees_rels_order_idx" ON "employees_rels" USING btree ("order");
  CREATE INDEX "employees_rels_parent_idx" ON "employees_rels" USING btree ("parent_id");
  CREATE INDEX "employees_rels_path_idx" ON "employees_rels" USING btree ("path");
  CREATE INDEX "employees_rels_expertise_id_idx" ON "employees_rels" USING btree ("expertise_id");
  CREATE INDEX "_employees_v_version_qualifications_order_idx" ON "_employees_v_version_qualifications" USING btree ("_order");
  CREATE INDEX "_employees_v_version_qualifications_parent_id_idx" ON "_employees_v_version_qualifications" USING btree ("_parent_id");
  CREATE INDEX "_employees_v_version_qualifications_locale_idx" ON "_employees_v_version_qualifications" USING btree ("_locale");
  CREATE INDEX "_employees_v_rels_order_idx" ON "_employees_v_rels" USING btree ("order");
  CREATE INDEX "_employees_v_rels_parent_idx" ON "_employees_v_rels" USING btree ("parent_id");
  CREATE INDEX "_employees_v_rels_path_idx" ON "_employees_v_rels" USING btree ("path");
  CREATE INDEX "_employees_v_rels_expertise_id_idx" ON "_employees_v_rels" USING btree ("expertise_id");
  CREATE INDEX "expertise_breadcrumbs_order_idx" ON "expertise_breadcrumbs" USING btree ("_order");
  CREATE INDEX "expertise_breadcrumbs_parent_id_idx" ON "expertise_breadcrumbs" USING btree ("_parent_id");
  CREATE INDEX "expertise_breadcrumbs_locale_idx" ON "expertise_breadcrumbs" USING btree ("_locale");
  CREATE INDEX "expertise_breadcrumbs_doc_idx" ON "expertise_breadcrumbs" USING btree ("doc_id");
  CREATE INDEX "expertise__order_idx" ON "expertise" USING btree ("_order");
  CREATE UNIQUE INDEX "expertise_intranet_id_idx" ON "expertise" USING btree ("intranet_id");
  CREATE INDEX "expertise_parent_idx" ON "expertise" USING btree ("parent_id");
  CREATE INDEX "expertise_updated_at_idx" ON "expertise" USING btree ("updated_at");
  CREATE INDEX "expertise_created_at_idx" ON "expertise" USING btree ("created_at");
  CREATE UNIQUE INDEX "expertise_locales_locale_parent_id_unique" ON "expertise_locales" USING btree ("_locale","_parent_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_expertise_fk" FOREIGN KEY ("expertise_id") REFERENCES "public"."expertise"("id") ON DELETE cascade ON UPDATE no action;
  CREATE UNIQUE INDEX "employees_intranet_id_idx" ON "employees" USING btree ("intranet_id");
  CREATE INDEX "_employees_v_version_version_intranet_id_idx" ON "_employees_v" USING btree ("version_intranet_id");
  CREATE INDEX "payload_locked_documents_rels_expertise_id_idx" ON "payload_locked_documents_rels" USING btree ("expertise_id");`)

  // Array rows keep their id across versions (_uuid), so a document and its versions share them.
  const rowIds = new Map<string, string>()
  const rowId = (doc: unknown, locale: unknown, order: number) => {
    const key = `${doc}:${locale}:${order}`
    if (!rowIds.has(key)) rowIds.set(key, crypto.randomBytes(12).toString('hex'))
    return rowIds.get(key)!
  }

  const docs = await db.execute(sql`
    SELECT "_parent_id" AS doc, "_locale" AS locale, "qualification" AS text, "chamber_membership" AS chamber
    FROM "employees_locales" WHERE coalesce("qualification", '') <> ''`)
  for (const row of docs.rows as Row[]) {
    const { chamber, entries } = splitQualification(String(row.text))
    for (const [index, name] of entries.entries()) {
      await db.execute(sql`
        INSERT INTO "employees_qualifications" ("_order", "_parent_id", "_locale", "id", "name")
        VALUES (${index + 1}, ${row.doc}, ${row.locale}, ${rowId(row.doc, row.locale, index)}, ${name})`)
    }
    if (chamber && !row.chamber) {
      await db.execute(sql`
        UPDATE "employees_locales" SET "chamber_membership" = ${chamber}
        WHERE "_parent_id" = ${row.doc} AND "_locale" = ${row.locale}`)
    }
  }

  const versions = await db.execute(sql`
    SELECT l."_parent_id" AS version, v."parent_id" AS doc, l."_locale" AS locale,
      l."version_qualification" AS text, l."version_chamber_membership" AS chamber
    FROM "_employees_v_locales" l JOIN "_employees_v" v ON v."id" = l."_parent_id"
    WHERE coalesce(l."version_qualification", '') <> ''`)
  for (const row of versions.rows as Row[]) {
    const { chamber, entries } = splitQualification(String(row.text))
    for (const [index, name] of entries.entries()) {
      await db.execute(sql`
        INSERT INTO "_employees_v_version_qualifications" ("_order", "_parent_id", "_locale", "name", "_uuid")
        VALUES (${index + 1}, ${row.version}, ${row.locale}, ${name}, ${rowId(row.doc, row.locale, index)})`)
    }
    if (chamber && !row.chamber) {
      await db.execute(sql`
        UPDATE "_employees_v_locales" SET "version_chamber_membership" = ${chamber}
        WHERE "_parent_id" = ${row.version} AND "_locale" = ${row.locale}`)
    }
  }
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  // The chamber memberships the up step filled from the old texts go again; the texts are still there.
  const filled = await db.execute(sql`
    SELECT "id", "qualification" AS text, "chamber_membership" AS chamber FROM "employees_locales"
    WHERE "qualification" ILIKE '%autorizovan%'`)
  for (const row of filled.rows as Row[]) {
    if (row.chamber !== splitQualification(String(row.text)).chamber) continue
    await db.execute(sql`UPDATE "employees_locales" SET "chamber_membership" = NULL WHERE "id" = ${row.id}`)
  }
  const filledVersions = await db.execute(sql`
    SELECT "id", "version_qualification" AS text, "version_chamber_membership" AS chamber FROM "_employees_v_locales"
    WHERE "version_qualification" ILIKE '%autorizovan%'`)
  for (const row of filledVersions.rows as Row[]) {
    if (row.chamber !== splitQualification(String(row.text)).chamber) continue
    await db.execute(sql`UPDATE "_employees_v_locales" SET "version_chamber_membership" = NULL WHERE "id" = ${row.id}`)
  }

  await db.execute(sql`
   ALTER TABLE "employees_qualifications" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "employees_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_employees_v_version_qualifications" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_employees_v_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "expertise_breadcrumbs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "expertise" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "expertise_locales" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "employees_qualifications" CASCADE;
  DROP TABLE "employees_rels" CASCADE;
  DROP TABLE "_employees_v_version_qualifications" CASCADE;
  DROP TABLE "_employees_v_rels" CASCADE;
  DROP TABLE "expertise_breadcrumbs" CASCADE;
  DROP TABLE "expertise" CASCADE;
  DROP TABLE "expertise_locales" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_expertise_fk";
  
  DROP INDEX "employees_intranet_id_idx";
  DROP INDEX "_employees_v_version_version_intranet_id_idx";
  DROP INDEX "payload_locked_documents_rels_expertise_id_idx";
  ALTER TABLE "employees" DROP COLUMN "intranet_id";
  ALTER TABLE "_employees_v" DROP COLUMN "version_intranet_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "expertise_id";`)
}
