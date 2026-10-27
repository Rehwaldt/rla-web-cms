// Types of an excursion's stops. The schema (src/collections/Excursions.ts) and the stops' row
// labels (src/components/cms/ExcursionRowLabels.tsx) both read them from here. Plain data, so
// the client can import it.

export const STOP_TYPES = [
  { label: { en: 'Stop', de: 'Station' }, value: 'default' },
  { label: { en: 'Optional', de: 'Optional' }, value: 'optional' },
  { label: { en: 'Break', de: 'Pause' }, value: 'break' },
  { label: { en: 'Meeting point', de: 'Treffpunkt' }, value: 'meetUp' },
  { label: { en: 'Meal', de: 'Essen' }, value: 'food' },
] as const

export type StopType = (typeof STOP_TYPES)[number]['value']

// As on the website, only these stops are numbered; the others show their type instead.
export const NUMBERED_STOP_TYPE: StopType = 'default'
