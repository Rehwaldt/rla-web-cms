import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// An office's contact note only ever held an address written out, so it becomes the address as
// plain text: paragraphs and line breaks turn into lines. The note goes in the next migration.
type LexicalNode = { type?: string; text?: string; children?: LexicalNode[] }
const inline = (node: LexicalNode): string =>
  node.type === 'linebreak' ? '\n' : (node.text ?? (node.children ?? []).map(inline).join(''))
const toText = (value: unknown): string | null => {
  const root = (typeof value === 'string' ? JSON.parse(value) : value) as { root?: LexicalNode } | null
  const text = (root?.root?.children ?? [])
    .map(inline)
    .join('\n')
    .split('\n')
    .map((line) => line.trim())
    .join('\n')
    .trim()
  return text || null
}
type Row = Record<string, unknown>

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "offices_locales" ADD COLUMN "address_text" varchar;
  ALTER TABLE "_offices_v_locales" ADD COLUMN "version_address_text" varchar;`)

  const docs = await db.execute(sql`
    SELECT "id", "contact_note" AS note FROM "offices_locales" WHERE "contact_note" IS NOT NULL`)
  for (const row of docs.rows as Row[]) {
    await db.execute(sql`UPDATE "offices_locales" SET "address_text" = ${toText(row.note)} WHERE "id" = ${row.id}`)
  }
  const versions = await db.execute(sql`
    SELECT "id", "version_contact_note" AS note FROM "_offices_v_locales" WHERE "version_contact_note" IS NOT NULL`)
  for (const row of versions.rows as Row[]) {
    await db.execute(sql`
      UPDATE "_offices_v_locales" SET "version_address_text" = ${toText(row.note)} WHERE "id" = ${row.id}`)
  }
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "offices_locales" DROP COLUMN "address_text";
  ALTER TABLE "_offices_v_locales" DROP COLUMN "version_address_text";`)
}
