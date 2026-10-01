import type { Block, Field } from 'payload'
import { FLOW_SIZES, MODIFIER_LABELS, SIZE_COLUMNS, SIZE_LABELS, modifiersFor } from './flowLayout'
import { richTextField } from './richText'

// A "flow" is a free-form grid of images, text and references to other content. Every block
// takes a size (columns out of a 12-column grid) and optional layout modifiers. The admin edits it
// in a visual editor (src/components/cms/FlowField) that renders the grid like the website does.

const SIZE_OPTIONS = FLOW_SIZES.map((value) => ({
  label:
    value === 'full'
      ? { en: 'Full width (12 columns)', de: 'Volle Breite (12 Spalten)' }
      : {
          en: `${SIZE_LABELS[value]} (${SIZE_COLUMNS[value]} columns)`,
          de: `${SIZE_LABELS[value]} (${SIZE_COLUMNS[value]} Spalten)`,
        },
  value,
}))

const modifierOptions = (blockType: string) =>
  modifiersFor(blockType).map((value) => ({ label: MODIFIER_LABELS[value], value }))

const sizeField = (defaultValue: string): Field => ({
  name: 'size',
  label: { en: 'Size', de: 'Breite' },
  type: 'select',
  required: true,
  defaultValue,
  options: SIZE_OPTIONS,
})

const modifiersField = (blockType: string): Field => ({
  name: 'modifiers',
  label: { en: 'Modifiers', de: 'Optionen' },
  type: 'select',
  hasMany: true,
  options: modifierOptions(blockType),
})

const imageBlock: Block = {
  slug: 'image',
  interfaceName: 'FlowImageBlock',
  labels: { singular: { en: 'Image', de: 'Bild' }, plural: { en: 'Images', de: 'Bilder' } },
  fields: [
    {
      name: 'image',
      label: { en: 'Image', de: 'Bild' },
      type: 'upload',
      relationTo: 'media',
      required: true,
      admin: {
        description: {
          en: "Caption and link come from the image's project (set on the media item).",
          de: 'Bildunterschrift und Link kommen vom Projekt des Bildes (am Medium festgelegt).',
        },
      },
    },
    sizeField('one3'),
    modifiersField('image'),
  ],
}

const textBlock: Block = {
  slug: 'text',
  interfaceName: 'FlowTextBlock',
  labels: { singular: { en: 'Text', de: 'Text' }, plural: { en: 'Texts', de: 'Texte' } },
  fields: [
    { name: 'title', label: { en: 'Title', de: 'Titel' }, type: 'text', localized: true },
    richTextField('body', { en: 'Text', de: 'Text' }),
    sizeField('one2'),
    modifiersField('text'),
  ],
}

const newsReferenceBlock: Block = {
  slug: 'newsReference',
  interfaceName: 'FlowNewsReferenceBlock',
  labels: {
    singular: { en: 'News reference', de: 'News-Verweis' },
    plural: { en: 'News references', de: 'News-Verweise' },
  },
  fields: [
    {
      name: 'news',
      label: { en: 'News', de: 'News' },
      type: 'relationship',
      relationTo: 'news',
      required: true,
    },
    sizeField('one3'),
    modifiersField('newsReference'),
  ],
}

const topicReferenceBlock: Block = {
  slug: 'topicReference',
  interfaceName: 'FlowTopicReferenceBlock',
  labels: {
    singular: { en: 'Topic reference', de: 'Themen-Verweis' },
    plural: { en: 'Topic references', de: 'Themen-Verweise' },
  },
  fields: [
    {
      name: 'topic',
      label: { en: 'Topic', de: 'Thema' },
      type: 'relationship',
      relationTo: 'topics',
      required: true,
      admin: {
        description: {
          en: "Shown as an image tile with the topic's image and name.",
          de: 'Erscheint als Bildkachel mit dem Bild und dem Namen des Themas.',
        },
      },
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
  label: { en: 'Flow', de: 'Flow' },
  type: 'blocks',
  localized,
  labels: { singular: { en: 'Block', de: 'Block' }, plural: { en: 'Flow', de: 'Flow' } },
  blocks: [imageBlock, textBlock, newsReferenceBlock, topicReferenceBlock],
  admin: {
    initCollapsed: true,
    components: {
      Field: { path: '@/components/cms/FlowField#FlowField', clientProps: { captions } },
    },
    description: localized
      ? {
          en: 'Grid of images, texts and references. Each language has its own flow.',
          de: 'Raster aus Bildern, Texten und Verweisen. Jede Sprache hat ihren eigenen Flow.',
        }
      : {
          en: 'Grid of images, texts and references.',
          de: 'Raster aus Bildern, Texten und Verweisen.',
        },
  },
})
