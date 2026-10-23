import type { SelectField } from 'payload'

// ISO 3166-1 alpha-2 codes (Kosovo has none; XK is the code in common use). Consumers render the
// localized country name from the code.
const COUNTRIES = [
  { label: { en: 'Australia', de: 'Australien' }, value: 'AU' },
  { label: { en: 'Austria', de: 'Österreich' }, value: 'AT' },
  { label: { en: 'Bosnia and Herzegovina', de: 'Bosnien und Herzegowina' }, value: 'BA' },
  { label: { en: 'Bulgaria', de: 'Bulgarien' }, value: 'BG' },
  { label: { en: 'China', de: 'China' }, value: 'CN' },
  { label: { en: 'Czechia', de: 'Tschechien' }, value: 'CZ' },
  { label: { en: 'Finland', de: 'Finnland' }, value: 'FI' },
  { label: { en: 'France', de: 'Frankreich' }, value: 'FR' },
  { label: { en: 'Germany', de: 'Deutschland' }, value: 'DE' },
  { label: { en: 'Kosovo', de: 'Kosovo' }, value: 'XK' },
  { label: { en: 'Montenegro', de: 'Montenegro' }, value: 'ME' },
  { label: { en: 'North Macedonia', de: 'Nordmazedonien' }, value: 'MK' },
  { label: { en: 'Norway', de: 'Norwegen' }, value: 'NO' },
  { label: { en: 'Poland', de: 'Polen' }, value: 'PL' },
  { label: { en: 'Russia', de: 'Russland' }, value: 'RU' },
  { label: { en: 'Serbia', de: 'Serbien' }, value: 'RS' },
  { label: { en: 'South Korea', de: 'Südkorea' }, value: 'KR' },
  { label: { en: 'Switzerland', de: 'Schweiz' }, value: 'CH' },
  { label: { en: 'Türkiye', de: 'Türkei' }, value: 'TR' },
]

export const COUNTRY_CODES: ReadonlySet<string> = new Set(COUNTRIES.map((country) => country.value))

export const countryField = ({ admin }: { admin?: SelectField['admin'] } = {}): SelectField => ({
  name: 'country',
  label: { en: 'Country', de: 'Land' },
  type: 'select',
  options: COUNTRIES,
  admin,
})
