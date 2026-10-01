// @vitest-environment node
import { describe, expect, it } from 'vitest'
import type { Block, Field, SanitizedConfig } from 'payload'
import configPromise from '@/payload.config'

// The admin UI is bilingual (English, German). Every label, description and option the config
// declares must therefore be an `{ en, de }` object or a function (Payload's own fields use
// `({ t }) => …`). A plain string, or a label Payload generated from the field name, would show
// English on German screens.

const LANGUAGES = ['en', 'de'] as const

type Problem = string

const isTranslated = (value: unknown) =>
  typeof value === 'function' ||
  (typeof value === 'object' &&
    value !== null &&
    LANGUAGES.every((language) => {
      const text = (value as Record<string, unknown>)[language]
      return typeof text === 'string' && text.trim() !== ''
    }))

const check = (problems: Problem[], path: string, what: string, value: unknown) => {
  if (value === undefined || value === false) return
  if (!isTranslated(value)) problems.push(`${path}: ${what} ${JSON.stringify(value)}`)
}

const checkFields = (problems: Problem[], path: string, fields: Field[]) => {
  for (const field of fields) {
    const name = 'name' in field && field.name ? field.name : `(${field.type})`
    const fieldPath = `${path}.${name}`
    // Fields the admin never renders.
    if (field.admin && 'hidden' in field.admin && field.admin.hidden) continue
    if (field.admin && 'disabled' in field.admin && field.admin.disabled) continue
    if ('hidden' in field && field.hidden) continue

    if ('label' in field) check(problems, fieldPath, 'label', field.label)
    if (field.admin && 'description' in field.admin) {
      check(problems, fieldPath, 'description', field.admin.description)
    }
    if ('labels' in field && field.labels) {
      check(problems, fieldPath, 'singular label', field.labels.singular)
      check(problems, fieldPath, 'plural label', field.labels.plural)
    }
    if ((field.type === 'select' || field.type === 'radio') && field.options) {
      for (const option of field.options) {
        if (typeof option === 'string') problems.push(`${fieldPath}: option "${option}" has no label`)
        else check(problems, `${fieldPath}[${option.value}]`, 'option label', option.label)
      }
    }
    if ('fields' in field && field.fields) checkFields(problems, fieldPath, field.fields)
    if (field.type === 'tabs') {
      for (const tab of field.tabs) {
        const tabPath = `${fieldPath}[${'name' in tab && tab.name ? tab.name : 'tab'}]`
        check(problems, tabPath, 'tab label', tab.label)
        check(problems, tabPath, 'tab description', tab.description)
        checkFields(problems, tabPath, tab.fields)
      }
    }
    if (field.type === 'blocks') {
      for (const block of (field.blocks ?? []) as Block[]) {
        const blockPath = `${fieldPath}[${block.slug}]`
        check(problems, blockPath, 'singular label', block.labels?.singular)
        check(problems, blockPath, 'plural label', block.labels?.plural)
        checkFields(problems, blockPath, block.fields)
      }
    }
  }
}

describe('admin translations', () => {
  it('translates every label, description and option into English and German', async () => {
    const config: SanitizedConfig = await configPromise
    const problems: Problem[] = []

    for (const collection of config.collections) {
      // Payload's internal collections (preferences, migrations, …) never show in the admin.
      if (collection.admin.hidden === true) continue
      const path = collection.slug
      check(problems, path, 'singular label', collection.labels.singular)
      check(problems, path, 'plural label', collection.labels.plural)
      check(problems, path, 'group', collection.admin.group)
      check(problems, path, 'description', collection.admin.description)
      checkFields(problems, path, collection.fields)
    }

    for (const global of config.globals) {
      check(problems, global.slug, 'label', global.label)
      check(problems, global.slug, 'group', global.admin.group)
      check(problems, global.slug, 'description', global.admin.description)
      checkFields(problems, global.slug, global.fields)
    }

    for (const locale of config.localization ? config.localization.locales : []) {
      check(problems, `locale ${locale.code}`, 'label', locale.label)
    }

    expect(problems).toEqual([])
  })
})
