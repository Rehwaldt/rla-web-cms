import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// The company on an office's address is no longer localized. It only ever had a German value.
export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "offices" ADD COLUMN "address_company" varchar;
  ALTER TABLE "_offices_v" ADD COLUMN "version_address_company" varchar;
  UPDATE "offices" o SET "address_company" = l."address_company"
  FROM "offices_locales" l WHERE l."_parent_id" = o."id" AND l."_locale" = 'de';
  UPDATE "_offices_v" v SET "version_address_company" = l."version_address_company"
  FROM "_offices_v_locales" l WHERE l."_parent_id" = v."id" AND l."_locale" = 'de';
  ALTER TABLE "offices_locales" DROP COLUMN "address_company";
  ALTER TABLE "_offices_v_locales" DROP COLUMN "version_address_company";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "offices_locales" ADD COLUMN "address_company" varchar;
  ALTER TABLE "_offices_v_locales" ADD COLUMN "version_address_company" varchar;
  UPDATE "offices_locales" l SET "address_company" = o."address_company"
  FROM "offices" o WHERE l."_parent_id" = o."id" AND l."_locale" = 'de';
  UPDATE "_offices_v_locales" l SET "version_address_company" = v."version_address_company"
  FROM "_offices_v" v WHERE l."_parent_id" = v."id" AND l."_locale" = 'de';
  ALTER TABLE "offices" DROP COLUMN "address_company";
  ALTER TABLE "_offices_v" DROP COLUMN "version_address_company";`)
}
