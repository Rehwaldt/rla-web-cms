import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "employees" ADD COLUMN "external" boolean DEFAULT false;
  ALTER TABLE "_employees_v" ADD COLUMN "version_external" boolean DEFAULT false;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "employees" DROP COLUMN "external";
  ALTER TABLE "_employees_v" DROP COLUMN "version_external";`)
}
