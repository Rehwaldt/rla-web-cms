import type { SelectField } from 'payload'

// ISO 3166-1 alpha-2 codes. Consumers render the localized country name from the code.
const COUNTRIES = [
  { label: { en: 'Austria', de: 'Österreich' }, value: 'AT' },
  { label: { en: 'China', de: 'China' }, value: 'CN' },
  { label: { en: 'Czechia', de: 'Tschechien' }, value: 'CZ' },
  { label: { en: 'Finland', de: 'Finnland' }, value: 'FI' },
  { label: { en: 'France', de: 'Frankreich' }, value: 'FR' },
  { label: { en: 'Germany', de: 'Deutschland' }, value: 'DE' },
  { label: { en: 'Norway', de: 'Norwegen' }, value: 'NO' },
  { label: { en: 'Poland', de: 'Polen' }, value: 'PL' },
  { label: { en: 'South Korea', de: 'Südkorea' }, value: 'KR' },
  { label: { en: 'Switzerland', de: 'Schweiz' }, value: 'CH' },
]

export const countryField = ({ admin }: { admin?: SelectField['admin'] } = {}): SelectField => ({
  name: 'country',
  label: { en: 'Country', de: 'Land' },
  type: 'select',
  options: COUNTRIES,
  admin,
})
