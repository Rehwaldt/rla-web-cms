import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "offices" ADD COLUMN "leader_id" integer;
  ALTER TABLE "offices" ADD CONSTRAINT "offices_leader_id_employees_id_fk" FOREIGN KEY ("leader_id") REFERENCES "public"."employees"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "offices_leader_idx" ON "offices" USING btree ("leader_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "offices" DROP CONSTRAINT "offices_leader_id_employees_id_fk";
  
  DROP INDEX "offices_leader_idx";
  ALTER TABLE "offices" DROP COLUMN "leader_id";`)
}
