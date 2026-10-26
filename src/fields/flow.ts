import type { Block, Field } from 'payload'
import {
  FLOW_BLOCKS,
  FLOW_BLOCK_TYPES,
  FLOW_MODIFIERS,
  FLOW_SIZES,
  type FlowBlockType,
  type FlowModifier,
  type ReferencingBlockType,
  SIZE_COLUMNS,
  SIZE_LABELS,
} from './flowBlocks'
import { richTextField } from './richText'

// A "flow" is a free-form grid of images, text and references to other content. Every block
// takes a size (columns out of a 12-column grid) and optional layout modifiers. The admin edits it
// in a visual editor (src/components/cms/FlowField) that renders the grid like the website does.
// What a block type points at, its default size and its modifiers come from ./flowBlocks.

type Label = { en: string; de: string }

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

const MODIFIER_LABELS: Record<FlowModifier, Label> = {
  clear: { en: 'Clear (start a new row)', de: 'Neue Zeile' },
  right: { en: 'Right (push to the right edge)', de: 'Rechtsbündig (an den rechten Rand)' },
  center: { en: 'Center', de: 'Zentriert' },
  crop: { en: 'Crop (fixed height, cover)', de: 'Zuschneiden (feste Höhe, füllend)' },
  topmargin: { en: 'Top margin (extra space above)', de: 'Abstand oben (zusätzlicher Abstand darüber)' },
  separator: { en: 'Separator (full-width divider row)', de: 'Trennlinie (Trennzeile über die volle Breite)' },
}

// TEMPORARY: the database still stores `crop` as an option of text blocks, and one imported project
// uses it (plus its version history). Dropping the option before those rows are gone would make
// the schema push fail on them. Once the database holds none (e.g. after a fresh import), this goes
// and the options are FLOW_BLOCKS[blockType].modifiers.
const STILL_STORED: Partial<Record<FlowBlockType, FlowModifier[]>> = { text: ['crop'] }

const modifierOptions = (blockType: FlowBlockType) => {
  const offered: readonly FlowModifier[] = [...FLOW_BLOCKS[blockType].modifiers, ...(STILL_STORED[blockType] ?? [])]
  return FLOW_MODIFIERS.filter((value) => offered.includes(value)).map((value) => ({
    label: MODIFIER_LABELS[value],
    value,
  }))
}

const layoutFields = (blockType: FlowBlockType): Field[] => [
  {
    name: 'size',
    label: { en: 'Size', de: 'Breite' },
    type: 'select',
    required: true,
    defaultValue: FLOW_BLOCKS[blockType].defaultSize,
    options: SIZE_OPTIONS,
  },
  {
    name: 'modifiers',
    label: { en: 'Modifiers', de: 'Optionen' },
    type: 'select',
    hasMany: true,
    options: modifierOptions(blockType),
  },
]

const referenceField = (blockType: ReferencingBlockType, label: Label, description?: Label): Field => {
  const { field: name, collection: relationTo } = FLOW_BLOCKS[blockType].reference
  const shared = { name, label, required: true, ...(description && { admin: { description } }) }
  // Media is the upload collection; the others are plain relationships.
  return relationTo === 'media'
    ? { ...shared, type: 'upload', relationTo }
    : { ...shared, type: 'relationship', relationTo }
}

const block = (
  blockType: FlowBlockType,
  { fields, ...config }: Pick<Block, 'fields' | 'interfaceName' | 'labels'>,
): Block => ({
  slug: blockType,
  ...config,
  fields: [...fields, ...layoutFields(blockType)],
})

const BLOCKS: Record<FlowBlockType, Block> = {
  image: block('image', {
    interfaceName: 'FlowImageBlock',
    labels: { singular: { en: 'Image', de: 'Bild' }, plural: { en: 'Images', de: 'Bilder' } },
    fields: [
      referenceField(
        'image',
        { en: 'Image', de: 'Bild' },
        {
          en: "Caption and link come from the image's project (set on the media item), unless a caption is set below.",
          de: 'Bildunterschrift und Link kommen vom Projekt des Bildes (am Medium festgelegt), außer eine Bildunterschrift ist unten gesetzt.',
        },
      ),
      {
        name: 'caption',
        label: { en: 'Caption', de: 'Bildunterschrift' },
        type: 'text',
        localized: true,
        admin: {
          description: {
            en: 'Replaces the project name as the caption. Project pages show no captions.',
            de: 'Ersetzt den Projektnamen als Bildunterschrift. Projektseiten zeigen keine Bildunterschriften.',
          },
        },
      },
      {
        name: 'description',
        label: { en: 'Description', de: 'Beschreibung' },
        type: 'textarea',
        localized: true,
        admin: {
          description: {
            en: 'Shown below the image, on every page.',
            de: 'Erscheint unter dem Bild, auf jeder Seite.',
          },
        },
      },
    ],
  }),
  text: block('text', {
    interfaceName: 'FlowTextBlock',
    labels: { singular: { en: 'Text', de: 'Text' }, plural: { en: 'Texts', de: 'Texte' } },
    fields: [
      { name: 'title', label: { en: 'Title', de: 'Titel' }, type: 'text', localized: true },
      ...richTextField('body', { en: 'Text', de: 'Text' }),
    ],
  }),
  topicReference: block('topicReference', {
    interfaceName: 'FlowTopicReferenceBlock',
    labels: {
      singular: { en: 'Topic reference', de: 'Themen-Verweis' },
      plural: { en: 'Topic references', de: 'Themen-Verweise' },
    },
    fields: [
      referenceField(
        'topicReference',
        { en: 'Topic', de: 'Thema' },
        {
          en: "Shown as an image tile with the topic's image and name.",
          de: 'Erscheint als Bildkachel mit dem Bild und dem Namen des Themas.',
        },
      ),
    ],
  }),
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
  blocks: FLOW_BLOCK_TYPES.map((blockType) => BLOCKS[blockType]),
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
