import type { SelectField } from 'payload'

// ISO 3166-1 alpha-2 codes. Consumers render the localized country name from the code.
const COUNTRIES = [
  { label: 'Austria', value: 'AT' },
  { label: 'China', value: 'CN' },
  { label: 'Czechia', value: 'CZ' },
  { label: 'Finland', value: 'FI' },
  { label: 'France', value: 'FR' },
  { label: 'Germany', value: 'DE' },
  { label: 'Norway', value: 'NO' },
  { label: 'Poland', value: 'PL' },
  { label: 'South Korea', value: 'KR' },
  { label: 'Switzerland', value: 'CH' },
]

export const countryField = ({ admin }: { admin?: SelectField['admin'] } = {}): SelectField => ({
  name: 'country',
  type: 'select',
  options: COUNTRIES,
  admin,
})
