import { COUNTRY_CODES } from '@/fields/country'
import { num, type Row, str } from '../legacy'
import { byLocale, docPlan } from './build'
import type { PlanContext } from './context'
import { type DocPlan, ref } from './types'

// The mine database is English only. German names for its features and main uses, so the
// default locale isn't empty; terms missing here are reported and imported in English.
const GERMAN_TERMS: Record<string, string> = {
  // features.feature_name
  Fishing: 'Angeln',
  Swimming: 'Baden',
  'Horse Racing': 'Pferderennen',
  Hiking: 'Wandern',
  Golf: 'Golf',
  Airport: 'Flughafen',
  Housing: 'Wohnen',
  Ecology: 'Ökologie',
  Wintersports: 'Wintersport',
  Watersports: 'Wassersport',
  Agriculture: 'Landwirtschaft',
  'Car Racing': 'Motorsport',
  'Inline-Skating': 'Inlineskaten',
  Camping: 'Camping',
  Zoo: 'Zoo',
  Education: 'Bildung',
  Tennis: 'Tennis',
  Cycling: 'Radfahren',
  'Nature Reserve': 'Naturschutzgebiet',
  Holiday: 'Urlaub',
  Industry: 'Industrie',
  Forestry: 'Forstwirtschaft',
  'Green Energy': 'Erneuerbare Energie',
  'Water Reservoir': 'Wasserspeicher',
  'Waste Dump': 'Deponie',
  Beaching: 'Strand',
  Events: 'Veranstaltungen',
  Mining: 'Bergbau',
  // mines.essential_use
  'Water sports': 'Wassersport',
  Hippodrome: 'Pferderennbahn',
  Park: 'Park',
  'Protected area (Natura 2000)': 'Schutzgebiet (Natura 2000)',
  'Winter sports': 'Wintersport',
}

// Legacy spellings → corrected English.
const ENGLISH_FIXES: Record<string, string> = { Hipodrom: 'Hippodrome' }

// Legacy country codes that aren't the ones countryField uses.
const COUNTRY_FIXES: Record<string, string> = { KO: 'XK' }

const SITE_TYPES: Record<string, string> = { Openpit: 'open_cast', 'External dump': 'external_dump' }
const STATUSES: Record<string, string> = {
  'in use': 'in_use',
  'in revitalization': 'in_revitalization',
  revitalized: 'revitalized',
}
const MATERIALS: Record<string, string> = {
  Lignite: 'lignite',
  Coal: 'coal',
  Gold: 'gold',
  Copper: 'copper',
  Chromium: 'chromium',
  Boron: 'boron',
}
const MORPHOLOGIES: Record<string, string> = { lake: 'lake', dump: 'dump', backfilled: 'backfilled' }
const FOLLOW_UP_USES: Record<string, string> = { Recreation: 'recreation', Production: 'production', Ecology: 'ecology' }
const COLORS = new Set(['blue', 'green', 'grey'])

function bilingual(ctx: PlanContext, english: string | null, where: string): { de: string | null; en: string | null } {
  if (english === null) return { de: null, en: null }
  const fixed = ENGLISH_FIXES[english] ?? english
  const german = GERMAN_TERMS[fixed]
  if (!german) ctx.report.add('Mine term without a German translation (imported in English)', `${where}: ${fixed}`)
  return { de: german ?? fixed, en: fixed }
}

/** Maps a legacy value through a lookup table, reporting values the table doesn't know. */
function mapped(ctx: PlanContext, table: Record<string, string>, row: Row, column: string, where: string): string | null {
  const value = str(row, column)
  if (value === null) return null
  if (!(value in table)) ctx.report.add(`Unknown mine ${column} (left empty)`, `${where}: ${value}`)
  return table[value] ?? null
}

export function planMineFeatures(ctx: PlanContext): DocPlan[] {
  return ctx.snapshot.features.map((row) => {
    const legacyId = num(row, 'id')!
    const where = `mine feature ${legacyId}`
    const color = str(row, 'icon_color')
    if (color !== null && !COLORS.has(color)) ctx.report.add('Unknown mine feature color (left empty)', `${where}: ${color}`)
    return docPlan({
      collection: 'mine-features',
      legacyId,
      perLocale: byLocale({ name: bilingual(ctx, str(row, 'feature_name'), where) }),
      shared: {
        iconName: str(row, 'icon_link'),
        color: color !== null && COLORS.has(color) ? color : null,
      },
    })
  })
}

export function planMines(ctx: PlanContext): DocPlan[] {
  const { mines, mine_features: links } = ctx.snapshot
  const legacyIdByCode = new Map(mines.map((row) => [str(row, 'object_id'), num(row, 'id')!]))
  const featureColors = new Map(ctx.snapshot.features.map((row) => [num(row, 'id'), str(row, 'icon_color') ?? '']))

  return mines.map((row) => {
    const legacyId = num(row, 'id')!
    const where = `mine ${legacyId}`
    const code = str(row, 'object_id')

    // `mine_id` names the main mine a sub-site belongs to (e.g. PL011 → PL01); on main mines it
    // repeats the mine's own code.
    const parentCode = str(row, 'mine_id')
    const parentId = parentCode !== null && parentCode !== code ? legacyIdByCode.get(parentCode) : undefined
    if (parentCode !== null && parentCode !== code && parentId === undefined) {
      ctx.report.add('Mine whose main mine is unknown (no link set)', `${where}: ${parentCode}`)
    }

    const legacyCountry = str(row, 'iso_code')
    const country = legacyCountry !== null ? (COUNTRY_FIXES[legacyCountry] ?? legacyCountry) : null
    if (country !== null && !COUNTRY_CODES.has(country)) {
      ctx.report.add('Mine country not offered by countryField (left empty)', `${where}: ${country}`)
    }

    const siteType = mapped(ctx, SITE_TYPES, row, 'operation_type', where)
    const material = mapped(ctx, MATERIALS, row, 'product_type', where)
    const lat = num(row, 'lat')
    const lng = num(row, 'lng')

    return docPlan({
      collection: 'mines',
      legacyId,
      status: 'published',
      perLocale: byLocale({
        // Place names as the legacy data spells them; the other languages fall back to them.
        region: { de: str(row, 'region') },
        district: { de: str(row, 'district') },
        mainUse: bilingual(ctx, str(row, 'essential_use'), where),
      }),
      shared: {
        title: str(row, 'name'),
        code,
        parentMine: parentId !== undefined ? ref('mines', parentId) : null,
        location: lat !== null && lng !== null ? [lng, lat] : null,
        country: country !== null && COUNTRY_CODES.has(country) ? country : null,
        nearestCity: {
          name: str(row, 'reference_city'),
          population: num(row, 'city_population'),
          distanceKm: num(row, 'distance_to_city_km'),
        },
        website: str(row, 'website_url'),
        siteType: siteType ? [siteType] : [],
        operatingStatus: mapped(ctx, STATUSES, row, 'current_state', where),
        closureYear: num(row, 'closing_year'),
        extractedMaterials: material ? [material] : [],
        morphology: mapped(ctx, MORPHOLOGIES, row, 'morphology', where),
        surface: {
          total: num(row, 'surface_total_ha'),
          lake: num(row, 'surface_lake_ha'),
          forest: num(row, 'surface_forest_ha'),
          agriculture: num(row, 'surface_agriculture_ha'),
          settlement: num(row, 'surface_settlement_ha'),
        },
        followUpUse: mapped(ctx, FOLLOW_UP_USES, row, 'function_after', where),
        activityScale: num(row, 'activity_scale'),
        // In the order the legacy map shows them: by color.
        features: links
          .map((link) => [num(link, 'mine_id'), num(link, 'feature_id')] as const)
          .filter(([mineId, featureId]) => mineId === legacyId && featureColors.has(featureId))
          .sort(([, a], [, b]) => featureColors.get(a)!.localeCompare(featureColors.get(b)!) || a! - b!)
          .map(([, featureId]) => ref('mine-features', featureId!)),
      },
    })
  })
}
