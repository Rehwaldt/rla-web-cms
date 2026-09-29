import fs from 'fs'
import os from 'os'
import path from 'path'
import { vi } from 'vitest'
import { LEGACY_TABLES, type LegacySnapshot, type Row } from '@/migration/legacy'
import { createPlanContext, type PlanContext } from '@/migration/plan/context'
import { Report } from '@/migration/report'

/** A legacy snapshot with every table empty unless given. */
export const snapshot = (tables: Partial<LegacySnapshot> = {}): LegacySnapshot =>
  ({ ...Object.fromEntries(LEGACY_TABLES.map((table) => [table, []])), ...tables }) as LegacySnapshot

/** A legacy files root containing empty files at the given paths (relative to the root). */
export function filesRoot(files: string[] = []): string {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'rla-migration-'))
  for (const relative of files) {
    const file = path.join(root, relative)
    fs.mkdirSync(path.dirname(file), { recursive: true })
    fs.writeFileSync(file, '')
  }
  return root
}

/** Rich text stub: keeps the HTML so tests can see what would have been converted. */
export const convertHtml = (html: string) => ({ html })

export interface Harness {
  ctx: PlanContext
  report: Report
  /** Details recorded under a report category. */
  issues: (category: string) => string[]
}

/**
 * A plan context over the given tables. `images` are paths inside `0_img`; `files` are any other
 * files relative to the legacy files root (e.g. publication PDFs under `4_res`).
 */
export function harness(tables: Partial<LegacySnapshot> = {}, images: string[] = [], files: string[] = []): Harness {
  const report = new Report()
  const recorded: [string, string][] = []
  const add = report.add.bind(report)
  vi.spyOn(report, 'add').mockImplementation((category, detail) => {
    recorded.push([category, detail])
    add(category, detail)
  })
  const root = filesRoot([...images.map((image) => `0_img/${image}`), ...files])
  const ctx = createPlanContext(snapshot(tables), report, root, convertHtml)
  return {
    ctx,
    report,
    issues: (category) => recorded.filter(([c]) => c === category).map(([, detail]) => detail),
  }
}

/** A legacy project row with the columns planners read; override what a test cares about. */
export const projectRow = (overrides: Row = {}): Row => ({
  ID: 1,
  kuerzel: 'ABC',
  aktiv: 1,
  als_projekt: 1,
  als_wettbewerb: 0,
  objektplanung: 1,
  name_de: 'Park',
  ...overrides,
})
