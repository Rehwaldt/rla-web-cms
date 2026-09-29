import { bool, num, str } from '../legacy'
import { byLocale, docPlan } from './build'
import type { PlanContext } from './context'
import { type Data, type DocPlan, ref } from './types'

// The legacy offices store address and contact as one HTML blob per language. These structured
// values were transcribed from those blobs by hand (legacy office id → values); only the parts
// that don't fit the structure go into the per-language contact note.
const OFFICE_DETAILS: Record<number, { address: Data; city: Data; contact: Data; contactNote?: Data }> = {
  1: {
    address: { company: 'Rehwaldt Landschaftsarchitekten', street: 'Bautzner Strasse 133', postalCode: '01099', country: 'DE' },
    city: { de: 'Dresden' },
    contact: { phone: '+49 351 8119690', fax: '+49 351 8119699', email: 'mail@rehwaldt.de' },
  },
  2: {
    address: {
      company: 'Rehwaldt Landschaftsarchitekten, Projektbüro Berlin',
      street: 'Joseph-Haydn-Str. 1',
      postalCode: '10557',
      country: 'DE',
    },
    city: { de: 'Berlin' },
    contact: { phone: '+49 30 39885802', email: 'berlin@rehwaldt.de' },
  },
  3: {
    address: {
      company: 'REHWALDT LANDSCAPE PLANNING & DESIGN (BEIJING) CO., LTD',
      street: '710, Building 2, No. 28 Xiaoyun Road, Chaoyang District',
      country: 'CN',
    },
    city: { de: 'Peking', en: 'Beijing', zh: '北京' },
    contact: { phone: '+86 13910622864', email: 'beijing@rehwaldt.net' },
    contactNote: {
      de:
        '<p>RLA Rehwaldt Landscape Architects<br>project Office Guangzhou<br>Room 2103, Building 2, Phase 2,<br>Aoyuan International Center, No. 36<br>Wanhui 1st Road,<br>Nancun Town, Panyu District, Guangzhou City,<br>Guangdong Province</p>',
    },
  },
  5: {
    address: { company: 'Rehwaldt Landscape Architects', street: 'Janáčkovo nábřeží 1211/11', postalCode: '150 00', country: 'CZ' },
    city: { de: 'Prag', en: 'Prague', cs: 'Praha 5' },
    contact: { phone: '+420 773 533 708', email: 'praha@rehwaldt.de' },
  },
}

export function planOffices(ctx: PlanContext): DocPlan[] {
  return [...ctx.snapshot.standorte]
    .sort((a, b) => num(a, 'position')! - num(b, 'position')!)
    .map((row) => {
      const legacyId = num(row, 'index')!
      const where = `office ${legacyId}`
      const details = OFFICE_DETAILS[legacyId]
      if (!details) ctx.report.add('Office without transcribed address (address left empty)', where)
      const perLocale = byLocale({
        name: ctx.plainByLocale(row, 'name', where),
        description: ctx.richTextByLocale(row, 'text', where),
        contactNote: {
          de: ctx.richText((details?.contactNote?.de as string) ?? null, where),
          // The Chinese contact blob holds the full local address and a contact person.
          zh: ctx.richText(str(row, 'kontakt_zh'), where),
        },
      })
      for (const [locale, city] of Object.entries(details?.city ?? {})) {
        const localeData = perLocale[locale as keyof typeof perLocale]
        localeData.address = { city }
      }
      // `address` is a group with one localized field; the default-locale values carry the rest.
      perLocale.de.address = { ...(details?.address ?? {}), city: (details?.city as Data)?.de }
      return docPlan({
        collection: 'offices',
        legacyId,
        perLocale,
        shared: {
          image: ctx.imageRef(num(row, 'bild'), `${where} image`),
          contact: details?.contact ?? {},
        },
      })
    })
}

export function planEmployees(ctx: PlanContext): DocPlan[] {
  const officeIds = new Set(ctx.snapshot.standorte.map((row) => num(row, 'index')))
  return ctx.snapshot.mitarbeiter.map((row) => {
    const legacyId = num(row, 'index')!
    const where = `employee ${legacyId}`
    const active = bool(row, 'aktiv')
    const officeId = num(row, 'standort')
    if (officeId !== null && !officeIds.has(officeId)) ctx.report.add('Employee with an unknown office', where)
    const qualification = ctx.plainByLocale(row, 'quali', where)
    for (const [locale, value] of Object.entries(qualification)) {
      if (value && /mateřsk|elternzeit|parental|maternity/i.test(value)) {
        ctx.report.add('Status note stored as a qualification (check by hand)', `${where} [${locale}]: ${value}`)
      }
    }
    return docPlan({
      collection: 'employees',
      legacyId,
      status: active ? 'published' : 'draft',
      perLocale: byLocale({
        firstName: { de: str(row, 'vorname'), zh: str(row, 'vorname_zh') },
        lastName: { de: str(row, 'nachname'), zh: str(row, 'nachname_zh') },
        profession: ctx.plainByLocale(row, 'beruf', where),
        university: ctx.plainByLocale(row, 'uni', where),
        chamberMembership: ctx.plainByLocale(row, 'kammer', where),
        qualification,
      }),
      shared: {
        academicTitle: ctx.plain(str(row, 'titel_de'), where),
        email: str(row, 'email'),
        phone: str(row, 'telefon'),
        joinedYear: num(row, 'bueroeintritt'),
        office: officeId !== null && officeIds.has(officeId) ? ref('offices', officeId) : null,
        // Former employees keep no portrait.
        portrait: active ? ctx.imageRef(num(row, 'bild'), `${where} portrait`) : null,
      },
    })
  })
}
