import { describe, expect, it } from 'vitest'
import { planMineFeatures, planMines } from '@/migration/plan/mines'
import { ref } from '@/migration/plan/types'
import { harness } from './fixtures'

const features = [
  { id: 1, feature_name: 'Fishing', icon_link: 'fishing.svg', icon_color: 'blue' },
  { id: 8, feature_name: 'Ecology', icon_link: 'plant.svg', icon_color: 'grey' },
  { id: 4, feature_name: 'Hiking', icon_link: 'hiking.svg', icon_color: 'green' },
]

const mineRow = (overrides = {}) => ({
  id: 149,
  object_id: 'PL01',
  mine_id: 'PL01',
  name: 'Bełchatów',
  lat: '51.23',
  lng: '19.32',
  surface_total_ha: 3300,
  surface_lake_ha: null,
  district: 'Bełchatów',
  region: 'Łódź',
  iso_code: 'PL',
  product_type: 'Lignite',
  operation_type: 'Openpit',
  morphology: 'lake',
  current_state: 'in use',
  activity_scale: '3',
  closing_year: 2038,
  function_after: 'Recreation',
  essential_use: 'Water sports',
  reference_city: 'Łódź',
  city_population: 670000,
  distance_to_city_km: 60,
  website_url: 'https://example.org',
  ...overrides,
})

describe('planMineFeatures', () => {
  it('imports the English name with its German translation, icon and color', () => {
    const { ctx } = harness({ features })
    const [fishing] = planMineFeatures(ctx)
    expect(fishing).toMatchObject({
      collection: 'mine-features',
      key: '1',
      data: { legacyId: 1, name: 'Angeln', iconName: 'fishing.svg', color: 'blue' },
      localized: { en: { name: 'Fishing' } },
    })
  })

  it('reports untranslated names and unknown colors', () => {
    const { ctx, issues } = harness({ features: [{ id: 50, feature_name: 'Paragliding', icon_link: 'x.svg', icon_color: 'red' }] })
    const [doc] = planMineFeatures(ctx)
    expect(doc.data).toMatchObject({ name: 'Paragliding', color: null })
    expect(issues('Mine term without a German translation (imported in English)')).toEqual(['mine feature 50: Paragliding'])
    expect(issues('Unknown mine feature color (left empty)')).toEqual(['mine feature 50: red'])
  })
})

describe('planMines', () => {
  it('maps a mine to the schema', () => {
    const { ctx } = harness({ mines: [mineRow()] })
    const [mine] = planMines(ctx)
    expect(mine).toMatchObject({
      collection: 'mines',
      status: 'published',
      data: {
        legacyId: 149,
        title: 'Bełchatów',
        code: 'PL01',
        parentMine: null,
        location: [19.32, 51.23],
        country: 'PL',
        region: 'Łódź',
        district: 'Bełchatów',
        nearestCity: { name: 'Łódź', population: 670000, distanceKm: 60 },
        website: 'https://example.org',
        siteType: ['open_cast'],
        operatingStatus: 'in_use',
        closureYear: 2038,
        extractedMaterials: ['lignite'],
        morphology: 'lake',
        surface: { total: 3300, lake: null },
        followUpUse: 'recreation',
        mainUse: 'Wassersport',
        activityScale: 3,
        features: [],
      },
      localized: { en: { mainUse: 'Water sports' } },
    })
  })

  it('links a sub-site to its main mine by mine_id', () => {
    const { ctx, issues } = harness({
      mines: [mineRow(), mineRow({ id: 150, object_id: 'PL011', mine_id: 'PL01' }), mineRow({ id: 151, object_id: 'PL021', mine_id: 'PL02' })],
    })
    const [main, sub, orphan] = planMines(ctx)
    expect(main.data.parentMine).toBeNull()
    expect(sub.data.parentMine).toEqual(ref('mines', 149))
    expect(orphan.data.parentMine).toBeNull()
    expect(issues('Mine whose main mine is unknown (no link set)')).toEqual(['mine 151: PL02'])
  })

  it('links features in the legacy display order (by color)', () => {
    const { ctx } = harness({
      features,
      mines: [mineRow()],
      mine_features: [
        { mine_id: 149, feature_id: 8 },
        { mine_id: 149, feature_id: 4 },
        { mine_id: 149, feature_id: 1 },
        { mine_id: 999, feature_id: 1 },
      ],
    })
    const [mine] = planMines(ctx)
    expect(mine.data.features).toEqual([ref('mine-features', 1), ref('mine-features', 4), ref('mine-features', 8)])
  })

  it('fixes legacy codes and spellings, and reports values it cannot map', () => {
    const { ctx, issues } = harness({
      mines: [mineRow({ iso_code: 'KO', essential_use: 'Hipodrom', operation_type: 'Underground', product_type: 'Uranium' })],
    })
    const [mine] = planMines(ctx)
    expect(mine.data).toMatchObject({ country: 'XK', mainUse: 'Pferderennbahn', siteType: [], extractedMaterials: [] })
    expect(mine.localized.en).toMatchObject({ mainUse: 'Hippodrome' })
    expect(issues('Unknown mine operation_type (left empty)')).toEqual(['mine 149: Underground'])
    expect(issues('Unknown mine product_type (left empty)')).toEqual(['mine 149: Uranium'])
  })
})
