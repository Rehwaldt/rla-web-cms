import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "mines" DROP COLUMN "status";
  DROP TYPE "public"."enum_mines_status";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_mines_status" AS ENUM('in_use', 'in_revitalization', 'revitalized');
  ALTER TABLE "mines" ADD COLUMN "status" "enum_mines_status";`)
}
