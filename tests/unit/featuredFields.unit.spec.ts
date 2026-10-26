// @vitest-environment node
import { describe, expect, it } from 'vitest'
import type { SanitizedConfig } from 'payload'
import configPromise from '@/payload.config'

// A page's featured news and projects are hand-sorted lists, one per language.

describe('featured fields', () => {
  it('gives pages a sortable list per language of news and of projects', async () => {
    const config: SanitizedConfig = await configPromise
    const pages = config.collections.find((collection) => collection.slug === 'pages')!
    const field = (name: string) => pages.fields.find((candidate) => 'name' in candidate && candidate.name === name)
    for (const [name, relationTo] of [
      ['featuredNews', 'news'],
      ['featuredProjects', 'projects'],
    ]) {
      expect(field(name)).toMatchObject({
        type: 'relationship',
        relationTo,
        hasMany: true,
        localized: true,
        admin: { isSortable: true },
      })
    }
  })
})
