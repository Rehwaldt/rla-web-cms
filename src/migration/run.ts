import 'dotenv/config'
import path from 'path'
import { getPayload } from 'payload'
import { convertHTMLToLexical, defaultEditorConfig, sanitizeServerEditorConfig } from '@payloadcms/richtext-lexical'
import { JSDOM } from 'jsdom'
import configPromise from '../payload.config'
import { readLegacySnapshot } from './legacy'
import { planWebsite } from './plan'
import { Report } from './report'
import { applyPlan } from './write'

// Imports the legacy website database into Payload.
//   pnpm migrate:website            import (re-runnable: updates what already exists)
//   pnpm migrate:website --dry-run  only plan and write the report
//   --update-media                  also update already-imported media (alt text, credit, project)
async function main() {
  const dryRun = process.argv.includes('--dry-run')
  const filesRoot = process.env.LEGACY_WEB_FILES_ROOT || 'Z:/website/website_rla'
  const report = new Report()
  const reportName = `website-import-${new Date().toISOString().replace(/[:.]/g, '-')}${dryRun ? '-dry-run' : ''}`

  console.log('Reading the legacy database…')
  const snapshot = await readLegacySnapshot()

  const config = await configPromise
  const editorConfig = await sanitizeServerEditorConfig(defaultEditorConfig, config)
  const convertHtml = (html: string) => convertHTMLToLexical({ editorConfig, html, JSDOM })

  console.log('Planning…')
  const plan = planWebsite(snapshot, report, filesRoot, convertHtml)

  if (!dryRun) {
    const payload = await getPayload({ config })
    await applyPlan(payload, plan, report, { updateMedia: process.argv.includes('--update-media') })
  }

  const file = report.write(path.resolve(process.cwd(), 'migration', 'reports'), reportName)
  console.log(`\n${report.summary()}\n\nReport: ${file}`)
  process.exit(0)
}

main().catch((error) => {
  console.error('Import failed:', error)
  process.exit(1)
})
