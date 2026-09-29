import type { Block, Field } from 'payload'
import { richTextField } from './richText'

// A "flow" is a free-form grid of images, text and references to other content. Every block
// takes a size (columns out of a 12-column grid) and optional layout modifiers.

const SIZE_OPTIONS = [
  { label: '1/6 (2 columns)', value: 'one6' },
  { label: '1/4 (3 columns)', value: 'one4' },
  { label: '1/3 (4 columns)', value: 'one3' },
  { label: '1/2 (6 columns)', value: 'one2' },
  { label: '2/3 (8 columns)', value: 'two3' },
  { label: 'Full width (12 columns)', value: 'full' },
]

const MODIFIER_OPTIONS = [
  { label: 'Clear (start a new row)', value: 'clear' },
  { label: 'Right (push to the right edge)', value: 'right' },
  { label: 'Center', value: 'center' },
  { label: 'Crop (fixed height, cover)', value: 'crop' },
  { label: 'Top margin (extra space above)', value: 'topmargin' },
]

const SEPARATOR_OPTION = { label: 'Separator (full-width divider row)', value: 'separator' }

const sizeField = (defaultValue: string): Field => ({
  name: 'size',
  type: 'select',
  required: true,
  defaultValue,
  options: SIZE_OPTIONS,
})

const modifiersField = (options = MODIFIER_OPTIONS): Field => ({
  name: 'modifiers',
  type: 'select',
  hasMany: true,
  options,
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
    modifiersField(),
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
    modifiersField([...MODIFIER_OPTIONS, SEPARATOR_OPTION]),
  ],
}

const newsReferenceBlock: Block = {
  slug: 'newsReference',
  interfaceName: 'FlowNewsReferenceBlock',
  labels: { singular: 'News Reference', plural: 'News References' },
  fields: [
    { name: 'news', type: 'relationship', relationTo: 'news', required: true },
    sizeField('one3'),
    modifiersField(),
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
    modifiersField(),
  ],
}

export const flowField = ({ localized = false }: { localized?: boolean } = {}): Field => ({
  name: 'flow',
  type: 'blocks',
  localized,
  labels: { singular: 'Block', plural: 'Flow' },
  blocks: [imageBlock, textBlock, newsReferenceBlock, topicReferenceBlock],
  admin: {
    initCollapsed: true,
    description: localized
      ? 'Grid of images, texts and references. Each language has its own flow.'
      : 'Grid of images, texts and references.',
  },
})
