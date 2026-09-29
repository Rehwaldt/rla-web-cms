import type { Block, Field } from 'payload'
import { lexicalEditor, FixedToolbarFeature } from '@payloadcms/richtext-lexical'

const FLOW_SIZE_OPTIONS = [
  { label: '1/6 (span 2)', value: 'one6' },
  { label: '1/4 (span 3)', value: 'one4' },
  { label: '1/3 (span 4)', value: 'one3' },
  { label: '1/2 (span 6)', value: 'one2' },
  { label: '2/3 (span 8)', value: 'two3' },
  { label: 'Full width (span 12)', value: 'full' },
]

const flowSizeField = (defaultValue: string): Field => ({
  name: 'size',
  type: 'select',
  defaultValue,
  options: FLOW_SIZE_OPTIONS,
  admin: {
    description: 'Legacy css size token — grid-column span out of 12.',
  },
})

const FLOW_MODIFIER_OPTIONS = [
  { label: 'Clear (start new row)', value: 'clear' },
  { label: 'Right (push to right edge)', value: 'right' },
  { label: 'Center (limited css support)', value: 'center' },
  { label: 'Crop (object-fit: cover, fixed height)', value: 'crop' },
  { label: 'Top margin (extra spacer above)', value: 'topmargin' },
]

const flowModifiersField = (): Field => ({
  name: 'modifiers',
  type: 'select',
  hasMany: true,
  options: FLOW_MODIFIER_OPTIONS,
  admin: {
    description: 'Legacy css modifier tokens — freely combinable.',
  },
})

const flowImageBlock: Block = {
  slug: 'image',
  interfaceName: 'FlowImageBlock',
  labels: { singular: 'Image', plural: 'Images' },
  fields: [
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      required: true,
    },
    {
      name: 'caption',
      type: 'text',
      localized: true,
      admin: {
        description:
          "Optional. Legacy never let editors set this directly — it was computed at render time from the image's project association. Leave blank to match legacy behavior, or set explicitly.",
      },
    },
    {
      name: 'link',
      type: 'text',
      admin: {
        placeholder: 'https://...',
        description: 'Optional click-through override (see caption note).',
      },
    },
    flowSizeField('one3'),
    flowModifiersField(),
  ],
}

const flowTextBlock: Block = {
  slug: 'text',
  interfaceName: 'FlowTextBlock',
  labels: { singular: 'Text', plural: 'Texts' },
  fields: [
    {
      name: 'title',
      type: 'text',
      localized: true,
    },
    {
      name: 'body',
      type: 'richText',
      localized: true,
      editor: lexicalEditor({
        features: ({ defaultFeatures }) => [...defaultFeatures, FixedToolbarFeature()],
      }),
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description:
          'Optional accompanying image. Legacy parsed this (textelemente.bild) but a rendering bug meant it was never actually shown — this field revives the intent; the consuming frontend must be built to render it, unlike legacy.',
      },
    },
    flowSizeField('one2'),
    flowModifiersField(),
  ],
}

const flowNewsReferenceBlock: Block = {
  slug: 'newsReference',
  interfaceName: 'FlowNewsReferenceBlock',
  labels: { singular: 'News Reference', plural: 'News References' },
  fields: [
    {
      name: 'news',
      type: 'relationship',
      relationTo: 'news',
      required: true,
    },
    flowSizeField('one3'),
    flowModifiersField(),
  ],
}

const flowTopicReferenceBlock: Block = {
  slug: 'topicReference',
  interfaceName: 'FlowTopicReferenceBlock',
  labels: { singular: 'Topic Reference', plural: 'Topic References' },
  fields: [
    {
      name: 'theme',
      type: 'relationship',
      relationTo: 'theme',
      required: true,
      admin: {
        description:
          "Renders as an image tile using the theme's own thumbnail + name; always gets the legacy has-overlay caption style (auto-applied, not configurable). No separate caption field — the theme's name is the display caption.",
      },
    },
    flowSizeField('one3'),
    flowModifiersField(),
  ],
}

// A full-width divider. No configurable options — it always ignores the flow grid and spans full
// width. (Blocks have no `admin.description`, so this lives in a comment.)
const flowSeparatorBlock: Block = {
  slug: 'separator',
  interfaceName: 'FlowSeparatorBlock',
  labels: { singular: 'Separator', plural: 'Separators' },
  fields: [],
}

export const flowField = (legacySourceNote: string): Field => ({
  name: 'flow',
  type: 'blocks',
  labels: { singular: 'Block', plural: 'Flow' },
  blocks: [
    flowImageBlock,
    flowTextBlock,
    flowNewsReferenceBlock,
    flowTopicReferenceBlock,
    flowSeparatorBlock,
  ],
  admin: {
    initCollapsed: true,
    description: `Mixed content stream of images, text, news references, topic references, and separators. ${legacySourceNote}`,
  },
})
