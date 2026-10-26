// @vitest-environment node
import { describe, expect, it } from 'vitest'
import type { Block, Field, SanitizedConfig } from 'payload'
import { FLOW_BLOCKS, FLOW_BLOCK_TYPES } from '@/fields/flowBlocks'
import configPromise from '@/payload.config'

// Every flow field the config declares must offer exactly the block types of
// src/fields/flowBlocks.ts, each as that module describes it.

const flowFields = (fields: Field[]): Extract<Field, { type: 'blocks' }>[] =>
  fields.flatMap((field) => {
    if (field.type === 'blocks' && field.name === 'flow') return [field]
    if (field.type === 'tabs') return field.tabs.flatMap((tab) => flowFields(tab.fields))
    return 'fields' in field ? flowFields(field.fields) : []
  })

const named = (block: Block, name: string) => block.fields.find((field) => 'name' in field && field.name === name)

describe('flow field', () => {
  it('builds its blocks from the flow block types', async () => {
    const config: SanitizedConfig = await configPromise
    const found = config.collections.flatMap((collection) =>
      flowFields(collection.fields).map((field) => ({ collection: collection.slug, blocks: field.blocks as Block[] })),
    )
    expect(found.map(({ collection }) => collection).sort()).toEqual(['pages', 'projects', 'topics'])

    for (const { blocks } of found) {
      expect(blocks.map((block) => block.slug)).toEqual(FLOW_BLOCK_TYPES)
      for (const block of blocks) {
        const expected = FLOW_BLOCKS[block.slug as keyof typeof FLOW_BLOCKS]
        expect(named(block, 'size')).toMatchObject({ required: true, defaultValue: expected.defaultSize })
        if (expected.reference) {
          expect(named(block, expected.reference.field)).toMatchObject({
            required: true,
            relationTo: expected.reference.collection,
          })
        }
      }
      const image = blocks.find((block) => block.slug === 'image')!
      expect(named(image, 'caption')).toMatchObject({ type: 'text', localized: true })
      expect(named(image, 'description')).toMatchObject({ type: 'textarea', localized: true })
    }
  })
})
