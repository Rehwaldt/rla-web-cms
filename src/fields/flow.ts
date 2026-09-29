import type { Block, Field } from 'payload'
import { FLOW_SIZES, MODIFIER_LABELS, SIZE_COLUMNS, SIZE_LABELS, modifiersFor } from './flowLayout'
import { richTextField } from './richText'

// A "flow" is a free-form grid of images, text and references to other content. Every block
// takes a size (columns out of a 12-column grid) and optional layout modifiers. The admin edits it
// in a visual editor (src/components/cms/FlowField) that renders the grid like the website does.

const SIZE_OPTIONS = FLOW_SIZES.map((value) => ({
  label: value === 'full' ? 'Full width (12 columns)' : `${SIZE_LABELS[value]} (${SIZE_COLUMNS[value]} columns)`,
  value,
}))

const modifierOptions = (blockType: string) =>
  modifiersFor(blockType).map((value) => ({ label: MODIFIER_LABELS[value], value }))

const sizeField = (defaultValue: string): Field => ({
  name: 'size',
  type: 'select',
  required: true,
  defaultValue,
  options: SIZE_OPTIONS,
})

const modifiersField = (blockType: string): Field => ({
  name: 'modifiers',
  type: 'select',
  hasMany: true,
  options: modifierOptions(blockType),
})

const imageBlock: Block = {
  slug: 'image',
  interfaceName: 'FlowImageBlock',
  labels: { singular: 'Image', plural: 'Images' },
  fields: [
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      required: true,
      admin: {
        description: "Caption and link come from the image's project (set on the media item).",
      },
    },
    sizeField('one3'),
    modifiersField('image'),
  ],
}

const textBlock: Block = {
  slug: 'text',
  interfaceName: 'FlowTextBlock',
  labels: { singular: 'Text', plural: 'Texts' },
  fields: [
    { name: 'title', type: 'text', localized: true },
    richTextField('body'),
    sizeField('one2'),
    modifiersField('text'),
  ],
}

const newsReferenceBlock: Block = {
  slug: 'newsReference',
  interfaceName: 'FlowNewsReferenceBlock',
  labels: { singular: 'News Reference', plural: 'News References' },
  fields: [
    { name: 'news', type: 'relationship', relationTo: 'news', required: true },
    sizeField('one3'),
    modifiersField('newsReference'),
  ],
}

const topicReferenceBlock: Block = {
  slug: 'topicReference',
  interfaceName: 'FlowTopicReferenceBlock',
  labels: { singular: 'Topic Reference', plural: 'Topic References' },
  fields: [
    {
      name: 'topic',
      type: 'relationship',
      relationTo: 'topics',
      required: true,
      admin: { description: "Shown as an image tile with the topic's image and name." },
    },
    sizeField('one3'),
    modifiersField('topicReference'),
  ],
}

/**
 * `captions`: whether the website shows image captions under this flow (project pages hide them).
 * Only affects the editor preview.
 */
export const flowField = ({
  localized = false,
  captions = true,
}: { localized?: boolean; captions?: boolean } = {}): Field => ({
  name: 'flow',
  type: 'blocks',
  localized,
  labels: { singular: 'Block', plural: 'Flow' },
  blocks: [imageBlock, textBlock, newsReferenceBlock, topicReferenceBlock],
  admin: {
    initCollapsed: true,
    components: {
      Field: { path: '@/components/cms/FlowField#FlowField', clientProps: { captions } },
    },
    description: localized
      ? 'Grid of images, texts and references. Each language has its own flow.'
      : 'Grid of images, texts and references.',
  },
})
