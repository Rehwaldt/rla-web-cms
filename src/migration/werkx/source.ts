// Reads the employees of WerkX, the office's time tracking (Dresden and Berlin), from its
// on-prem API. Keeps only what the import needs; everything else in the response is dropped here.

export type WerkxPerson = {
  code: string
  name: string
  email: string | null
  birthDate: string | null // YYYY-MM-DD
  entryDate: string | null
  exitDate: string | null
  location: string | null // office name, e.g. "Dresden"
  active: boolean
}

type WerkxRecord = {
  id: string
  name?: string | null
  email?: string | null
  birthday?: string | null
  entry_date?: string | null
  exit_date?: string | null
  location?: { name?: string | null } | null
  active?: boolean | null
}

const day = (value: string | null | undefined) => (value ? value.slice(0, 10) : null)

export function toWerkxPerson(record: WerkxRecord): WerkxPerson {
  return {
    code: record.id.trim(),
    name: (record.name ?? '').trim(),
    email: record.email?.trim() || null,
    birthDate: day(record.birthday),
    entryDate: day(record.entry_date),
    exitDate: day(record.exit_date),
    location: record.location?.name?.trim() || null,
    active: Boolean(record.active),
  }
}

export async function readWerkxPeople(apiUrl: string): Promise<WerkxPerson[]> {
  const response = await fetch(`${apiUrl.replace(/\/$/, '')}/employees/`)
  if (!response.ok) throw new Error(`WerkX API: ${response.status} ${response.statusText}`)
  const records = (await response.json()) as WerkxRecord[]
  return records.map(toWerkxPerson)
}
