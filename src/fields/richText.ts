import type { RichTextField } from 'payload'
import { lexicalEditor, FixedToolbarFeature } from '@payloadcms/richtext-lexical'

// Localized rich text with the fixed toolbar — the editor setup every content field uses.
export const richTextField = (
  name: string,
  label: RichTextField['label'],
  overrides: Partial<Omit<RichTextField, 'type' | 'name' | 'label'>> = {},
): RichTextField => ({
  name,
  label,
  type: 'richText',
  localized: true,
  editor: lexicalEditor({
    features: ({ defaultFeatures }) => [...defaultFeatures, FixedToolbarFeature()],
  }),
  ...overrides,
})
