import type { CodeField, Field, RichTextField } from 'payload'
import { lexicalEditor, lexicalHTMLField, FixedToolbarFeature } from '@payloadcms/richtext-lexical'

// Localized rich text with the fixed toolbar — the editor setup every content field uses — plus
// a read-only `{name}Html` twin with the same content as HTML, for the PHP website, which has no
// Lexical renderer. The twin is virtual: computed on read from the sibling field in the requested
// locale (fallback included), never stored. Spread the result into a fields array.
export const richTextField = (
  name: string,
  label: RichTextField['label'],
  overrides: Partial<Omit<RichTextField, 'type' | 'name' | 'label'>> = {},
): Field[] => [
  {
    name,
    label,
    type: 'richText',
    localized: true,
    editor: lexicalEditor({
      features: ({ defaultFeatures }) => [...defaultFeatures, FixedToolbarFeature()],
    }),
    ...overrides,
  },
  {
    // typed as the generic Field, but it is always a code field
    ...(lexicalHTMLField({ htmlFieldName: `${name}Html`, lexicalFieldName: name }) as CodeField),
    virtual: true,
  },
]
