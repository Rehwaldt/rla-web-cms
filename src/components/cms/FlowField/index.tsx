'use client'

import type { BlocksFieldClientProps, ClientBlock } from 'payload'
import {
  BlocksField,
  Drawer,
  FieldDescription,
  FieldLabel,
  RenderFields,
  useConfig,
  useDocumentInfo,
  useDrawerSlug,
  useField,
  useForm,
  useFormFields,
  useListDrawer,
  useLocale,
  useModal,
} from '@payloadcms/ui'
import { RichText } from '@payloadcms/richtext-lexical/react'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import {
  type FlowModifier,
  SIZE_LABELS,
  dropIndex,
  isFlowSize,
  modifiersFor,
  rendersOnWebsite,
  stepSize,
  toggleModifier,
} from '@/fields/flowLayout'
import { type DocRef, imageSource, useReferencedDocs } from './useReferencedDocs'
import './flow.css'
import './index.css'

// The flow field edited as what it is: the website's grid. Every block shows as it will on the
// page; clicking one opens a toolbar for its size and modifiers, dragging reorders, and "Edit"
// opens the block's own fields in a drawer. The standard block list stays available as "List".

type Props = BlocksFieldClientProps & { captions?: boolean }

type Row = {
  id: string
  blockType: string
  size?: string
  modifiers?: string[]
  image?: number | string
  news?: number | string
  topic?: number | string
  title?: string
  body?: any
  hasError: boolean
  isLoading: boolean
}

const BLOCK_LABELS: Record<string, string> = {
  image: 'Image',
  text: 'Text',
  newsReference: 'News',
  topicReference: 'Topic',
}

const SHORT_MODIFIER_LABELS: Record<FlowModifier, string> = {
  clear: 'New row',
  right: 'Right',
  center: 'Center',
  crop: 'Crop',
  topmargin: 'Space above',
  separator: 'Divider',
}

const MODIFIER_HINTS: Record<FlowModifier, string> = {
  clear: 'Start a new row with this block',
  right: 'Push to the right edge of the row',
  center: 'Center the content in its cell',
  crop: 'Fixed height, image cropped to fill (1/4, 1/3 and 1/2 only)',
  topmargin: 'Extra space above',
  separator: 'Full-width divider line above; starts a new section',
}

// A constant: the list drawer reloads whenever it gets a new filter object.
const IMAGES_ONLY = { media: { mimeType: { contains: 'image/' } } }

const idOf = (value: unknown) =>
  value && typeof value === 'object' && 'id' in value ? (value as { id: number | string }).id : (value as number | string | undefined)

// Crop has no effect on text; the website only defines crop heights for images.
const toolbarModifiers = (blockType: string) =>
  modifiersFor(blockType).filter((m) => m !== 'crop' || blockType !== 'text')

export const FlowField: React.FC<Props> = (props) => {
  const { captions = true, field, path: pathFromProps, permissions, readOnly: readOnlyFromProps, schemaPath: schemaPathFromProps } = props
  const [mode, setMode] = useState<'visual' | 'list'>('visual')

  const { disabled, errorPaths = [], path, rows = [] } = useField({ hasRows: true, potentiallyStalePath: pathFromProps })
  const schemaPath = schemaPathFromProps ?? field.name
  const readOnly = Boolean(readOnlyFromProps || disabled)

  const header = (
    <div className="flow-editor__header">
      <div>
        {mode === 'visual' && (
          <>
            <FieldLabel label={field.label || 'Flow'} localized={field.localized} path={path} />
            <FieldDescription description={field.admin?.description} path={path} />
          </>
        )}
      </div>
      <Segmented
        value={mode}
        onChange={setMode}
        options={[
          { value: 'visual', label: 'Visual' },
          { value: 'list', label: 'List' },
        ]}
      />
    </div>
  )

  if (mode === 'list') {
    return (
      <div className="flow-editor">
        {header}
        <BlocksField {...props} />
      </div>
    )
  }

  return (
    <div className="flow-editor">
      {header}
      <VisualFlow
        blocks={field.blocks}
        captions={captions}
        errorPaths={errorPaths}
        path={path}
        permissions={permissions}
        readOnly={readOnly}
        rowMeta={rows}
        schemaPath={schemaPath}
      />
    </div>
  )
}

type VisualFlowProps = {
  blocks: ClientBlock[]
  captions: boolean
  errorPaths: string[]
  path: string
  permissions: Props['permissions']
  readOnly: boolean
  rowMeta: { id: string; blockType?: string; isLoading?: boolean }[]
  schemaPath: string
}

const VisualFlow: React.FC<VisualFlowProps> = ({ blocks, captions, errorPaths, path, permissions, readOnly, rowMeta, schemaPath }) => {
  const { addFieldRow, dispatchFields, moveFieldRow, removeFieldRow, setModified } = useForm()
  const { code: locale } = useLocale()
  const { openModal, closeModal, isModalOpen } = useModal()
  const editDrawerSlug = useDrawerSlug('flow-edit')

  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [editId, setEditId] = useState<string | null>(null)
  const [dragFrom, setDragFrom] = useState<number | null>(null)
  const [dragMedia, setDragMedia] = useState<number | string | null>(null)
  const [dropAt, setDropAt] = useState<{ index: number; after: boolean } | null>(null)
  const canvasRef = useRef<HTMLDivElement>(null)

  // The values the preview needs, as a string so unrelated form changes don't re-render.
  const snapshot = useFormFields(([fields]) => {
    const count = fields[path]?.rows?.length ?? 0
    const out = []
    for (let i = 0; i < count; i++) {
      const at = (key: string) => fields[`${path}.${i}.${key}`]?.value
      out.push({
        size: at('size'),
        modifiers: at('modifiers'),
        image: idOf(at('image')),
        news: idOf(at('news')),
        topic: idOf(at('topic')),
        title: at('title'),
        body: at('body'),
      })
    }
    return JSON.stringify(out)
  })

  const rows: Row[] = useMemo(() => {
    const values = JSON.parse(snapshot) as Partial<Row>[]
    return rowMeta.map((meta, i) => ({
      ...values[i],
      id: meta.id,
      blockType: meta.blockType ?? '',
      isLoading: Boolean(meta.isLoading),
      hasError: errorPaths.some((p) => p.startsWith(`${path}.${i}.`)),
    }))
  }, [snapshot, rowMeta, errorPaths, path])

  const refs = useMemo(() => {
    const out: DocRef[] = []
    for (const row of rows) {
      if (row.image) out.push({ collection: 'media', id: row.image })
      if (row.news) out.push({ collection: 'news', id: row.news })
      if (row.topic) out.push({ collection: 'topics', id: row.topic })
    }
    return out
  }, [rows])
  const docFor = useReferencedDocs(refs, locale)

  const selectedIndex = rows.findIndex((row) => row.id === selectedId)
  // A removed row simply stops matching the selection.
  const selected = selectedIndex === -1 ? null : rows[selectedIndex]

  const setRowValue = useCallback(
    (index: number, key: string, value: unknown) => {
      dispatchFields({ type: 'UPDATE', path: `${path}.${index}.${key}`, value })
      setModified(true)
    },
    [dispatchFields, path, setModified],
  )

  const resize = (index: number, step: number) => setRowValue(index, 'size', stepSize(rows[index].size, step))
  const toggle = (index: number, modifier: FlowModifier) =>
    setRowValue(index, 'modifiers', toggleModifier(rows[index].modifiers, modifier))
  const remove = (index: number) => removeFieldRow({ path, rowIndex: index })
  const move = (from: number, to: number) => {
    if (to < 0 || to >= rows.length || to === from) return
    moveFieldRow({ moveFromIndex: from, moveToIndex: to, path })
  }

  const openEditor = (id: string) => {
    setEditId(id)
    openModal(editDrawerSlug)
  }

  // New blocks go after the selected one, or at the end.
  const insertIndex = () => (selectedIndex === -1 ? rows.length : selectedIndex + 1)

  const addBlock = (blockType: string, values: Record<string, unknown>[], start = insertIndex()) => {
    const defaultSize = blockType === 'text' ? 'one2' : 'one3'
    values.forEach((value, offset) => {
      const subFieldState: Record<string, { initialValue: unknown; valid: true; value: unknown }> = {}
      for (const [key, v] of Object.entries({ size: defaultSize, ...value })) {
        subFieldState[key] = { initialValue: v, valid: true, value: v }
      }
      addFieldRow({ blockType, path, rowIndex: start + offset, schemaPath, subFieldState: subFieldState as any })
    })
  }

  // After adding, select the (last) new row once it exists.
  const pendingSelect = useRef<{ index: number; edit: boolean } | null>(null)
  useEffect(() => {
    const pending = pendingSelect.current
    if (pending && rows[pending.index]) {
      pendingSelect.current = null
      setSelectedId(rows[pending.index].id)
      if (pending.edit) openEditor(rows[pending.index].id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows])

  const addReferences = (blockType: string, key: string, ids: (number | string)[], at = insertIndex()) => {
    if (ids.length === 0) return
    pendingSelect.current = { index: at + ids.length - 1, edit: false }
    addBlock(
      blockType,
      ids.map((id) => ({ [key]: id })),
      at,
    )
  }

  const projectImages = useProjectImages(rows)

  const [MediaDrawer, , { openDrawer: openMediaDrawer, closeDrawer: closeMediaDrawer }] = useListDrawer({
    collectionSlugs: ['media'],
    filterOptions: IMAGES_ONLY,
    uploads: true,
  })
  const [TopicDrawer, , { openDrawer: openTopicDrawer, closeDrawer: closeTopicDrawer }] = useListDrawer({
    collectionSlugs: ['topics'],
  })

  const addText = () => {
    pendingSelect.current = { index: insertIndex(), edit: true }
    addBlock('text', [{}])
  }

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (readOnly || selectedIndex === -1 || event.target !== canvasRef.current) return
    const actions: Record<string, () => void> = {
      Delete: () => remove(selectedIndex),
      Backspace: () => remove(selectedIndex),
      Escape: () => setSelectedId(null),
      '+': () => resize(selectedIndex, 1),
      '-': () => resize(selectedIndex, -1),
      Enter: () => openEditor(rows[selectedIndex].id),
    }
    if (event.altKey && (event.key === 'ArrowLeft' || event.key === 'ArrowUp')) actions[event.key] = () => move(selectedIndex, selectedIndex - 1)
    if (event.altKey && (event.key === 'ArrowRight' || event.key === 'ArrowDown')) actions[event.key] = () => move(selectedIndex, selectedIndex + 1)
    const action = actions[event.key]
    if (action) {
      event.preventDefault()
      action()
    }
  }

  // Drag and drop: drop on the leading or trailing half of a block to land before or after it.
  const onDragOver = (index: number) => (event: React.DragEvent<HTMLElement>) => {
    if (dragFrom === null && dragMedia === null) return
    event.preventDefault()
    const rect = event.currentTarget.getBoundingClientRect()
    const fullRow = rect.width > (canvasRef.current?.clientWidth ?? Infinity) * 0.9
    const after = fullRow ? event.clientY > rect.top + rect.height / 2 : event.clientX > rect.left + rect.width / 2
    if (dropAt?.index !== index || dropAt.after !== after) setDropAt({ index, after })
  }
  const onDrop = (event: React.DragEvent) => {
    event.preventDefault()
    event.stopPropagation()
    if (dragFrom !== null && dropAt) {
      const to = dropIndex(dragFrom, dropAt.index, dropAt.after)
      if (to !== null) move(dragFrom, to)
    }
    if (dragMedia !== null) {
      addReferences('image', 'image', [dragMedia], dropAt ? dropAt.index + (dropAt.after ? 1 : 0) : rows.length)
    }
    endDrag()
  }
  const endDrag = () => {
    setDragFrom(null)
    setDragMedia(null)
    setDropAt(null)
  }

  const editIndex = rows.findIndex((row) => row.id === editId)
  const editRow = editIndex === -1 ? null : rows[editIndex]
  const editBlock = editRow ? blocks.find((block) => block.slug === editRow.blockType) : undefined
  const blockPermissions = (() => {
    if (!editBlock || permissions === true || !permissions || typeof permissions !== 'object') return true
    const specific = (permissions as any).blocks?.[editBlock.slug]
    return specific === true ? true : (specific?.fields ?? true)
  })()

  return (
    <>
      <div className="flow-editor__toolbar">
        <Segmented
          value={device}
          onChange={setDevice}
          options={[
            { value: 'desktop', label: 'Desktop' },
            { value: 'mobile', label: 'Mobile' },
          ]}
        />
        <span className="flow-editor__hint">
          {readOnly
            ? 'Read only'
            : 'Click a block to change its layout · drag to reorder · double-click to edit its content'}
        </span>
      </div>

      <div
        className={`flow-editor__stage flow-editor__stage--${device}`}
        onClick={(event) => {
          if (event.target === event.currentTarget) setSelectedId(null)
        }}
      >
        <div
          ref={canvasRef}
          className={[
            'flow-grid',
            device === 'desktop' && 'flow-grid--desktop',
            !captions && 'flow-grid--no-captions',
            'flow-editor__canvas',
          ]
            .filter(Boolean)
            .join(' ')}
          tabIndex={0}
          onKeyDown={onKeyDown}
          onDragOver={(event) => {
            // Tray images dropped on empty space go to the end.
            if (dragMedia === null || event.target !== event.currentTarget) return
            event.preventDefault()
            if (dropAt) setDropAt(null)
          }}
          onDrop={onDrop}
          onClick={(event) => {
            if (event.target === event.currentTarget) setSelectedId(null)
          }}
        >
          {rows.map((row, index) => rendersOnWebsite(row.blockType) && (
            <FlowItem
              key={row.id}
              row={row}
              index={index}
              docFor={docFor}
              readOnly={readOnly}
              selected={row.id === selectedId}
              dragging={dragFrom === index}
              dropSide={dropAt?.index === index && dragFrom !== index ? (dropAt.after ? 'after' : 'before') : null}
              onSelect={() => {
                setSelectedId(row.id)
                canvasRef.current?.focus({ preventScroll: true })
              }}
              onEdit={() => openEditor(row.id)}
              onDragStart={() => {
                setDragFrom(index)
                setSelectedId(row.id)
              }}
              onDragEnd={endDrag}
              onDragOver={onDragOver(index)}
              onDrop={onDrop}
              toolbar={
                row.id === selectedId && !readOnly ? (
                  <ItemToolbar
                    row={row}
                    canMoveBack={index > 0}
                    canMoveForward={index < rows.length - 1}
                    onResize={(step) => resize(index, step)}
                    onToggle={(modifier) => toggle(index, modifier)}
                    onMove={(step) => move(index, index + step)}
                    onEdit={() => openEditor(row.id)}
                    onRemove={() => remove(index)}
                  />
                ) : null
              }
            />
          ))}
          {rows.length === 0 && <div className="flow-editor__empty">The flow is empty. Add images or text below.</div>}
        </div>
      </div>

      {rows.some((row) => !rendersOnWebsite(row.blockType)) && (
        <div className="flow-editor__offstage">
          <div className="flow-editor__tray-title">
            Not shown on the website: its flow skips news references, so they take no place in the grid.
          </div>
          {rows.map(
            (row, index) =>
              !rendersOnWebsite(row.blockType) && (
                <OffstageItem
                  key={row.id}
                  row={row}
                  docFor={docFor}
                  readOnly={readOnly}
                  onEdit={() => openEditor(row.id)}
                  onRemove={() => remove(index)}
                />
              ),
          )}
        </div>
      )}

      {!readOnly && (
        <div className="flow-editor__add">
          <span>{selected ? `Add after the selected block:` : 'Add at the end:'}</span>
          <button type="button" className="flow-editor__add-btn" onClick={openMediaDrawer}>
            + Images
          </button>
          <button type="button" className="flow-editor__add-btn" onClick={addText}>
            + Text
          </button>
          <button type="button" className="flow-editor__add-btn" onClick={openTopicDrawer}>
            + Topic
          </button>
        </div>
      )}

      {!readOnly && projectImages.length > 0 && (
        <div className="flow-editor__tray">
          <div className="flow-editor__tray-title">
            Images of this project not in the flow ({projectImages.length}) · click to add, or drag into place
          </div>
          <div className="flow-editor__tray-images">
            {projectImages.map((media) => (
              <button
                key={media.id}
                type="button"
                className="flow-editor__tray-image"
                title={media.filename}
                draggable
                onClick={() => addReferences('image', 'image', [media.id])}
                onDragStart={(event) => {
                  event.dataTransfer.effectAllowed = 'copy'
                  event.dataTransfer.setData('text/plain', String(media.id))
                  setDragMedia(media.id)
                }}
                onDragEnd={endDrag}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={media.sizes?.thumbnail?.url ?? media.url} alt="" draggable={false} />
              </button>
            ))}
          </div>
        </div>
      )}

      <MediaDrawer
        allowCreate
        enableRowSelections
        onSelect={({ doc }) => {
          addReferences('image', 'image', [doc.id])
          closeMediaDrawer()
        }}
        onBulkSelect={(selection) => {
          addReferences(
            'image',
            'image',
            [...selection.entries()].filter(([, on]) => on).map(([id]) => id),
          )
          closeMediaDrawer()
        }}
      />
      <TopicDrawer
        onSelect={({ doc }) => {
          addReferences('topicReference', 'topic', [doc.id])
          closeTopicDrawer()
        }}
      />

      <Drawer slug={editDrawerSlug} title={editRow ? `Edit ${BLOCK_LABELS[editRow.blockType] ?? 'block'}` : 'Edit block'}>
        {editRow && editBlock && isModalOpen(editDrawerSlug) && (
          <>
            <RenderFields
              fields={editBlock.fields}
              margins="small"
              parentIndexPath=""
              parentPath={`${path}.${editIndex}`}
              parentSchemaPath={`${schemaPath}.${editBlock.slug}`}
              permissions={blockPermissions as any}
              readOnly={readOnly}
            />
            <button type="button" className="flow-editor__add-btn" onClick={() => closeModal(editDrawerSlug)}>
              Done
            </button>
          </>
        )}
      </Drawer>
    </>
  )
}

/**
 * On a project: the project's own images (media items whose `project` is this document) that the
 * flow doesn't use yet, like the image sidebar of the legacy admin tool.
 */
const useProjectImages = (rows: Row[]) => {
  const { collectionSlug, id } = useDocumentInfo()
  const {
    config: {
      serverURL,
      routes: { api },
    },
  } = useConfig()
  const [images, setImages] = useState<Record<string, any>[]>([])

  useEffect(() => {
    if (collectionSlug !== 'projects' || id === undefined) return
    let cancelled = false
    const params = new URLSearchParams({
      'where[project][equals]': String(id),
      'where[mimeType][contains]': 'image/',
      'select[filename]': 'true',
      'select[url]': 'true',
      'select[sizes]': 'true',
      depth: '0',
      limit: '0',
      sort: 'filename',
    })
    fetch(`${serverURL}${api}/media?${params}`, { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : { docs: [] }))
      .catch(() => ({ docs: [] }))
      .then((result: { docs?: Record<string, any>[] }) => {
        if (!cancelled) setImages(result.docs ?? [])
      })
    return () => {
      cancelled = true
    }
  }, [collectionSlug, id, serverURL, api])

  return useMemo(() => {
    const used = new Set(rows.map((row) => String(row.image)))
    return images.filter((media) => !used.has(String(media.id)))
  }, [images, rows])
}

type FlowItemProps = {
  row: Row
  index: number
  docFor: ReturnType<typeof useReferencedDocs>
  readOnly: boolean
  selected: boolean
  dragging: boolean
  dropSide: 'before' | 'after' | null
  toolbar: React.ReactNode
  onSelect: () => void
  onEdit: () => void
  onDragStart: () => void
  onDragEnd: () => void
  onDragOver: (event: React.DragEvent<HTMLElement>) => void
  onDrop: (event: React.DragEvent) => void
}

const FlowItem: React.FC<FlowItemProps> = ({ row, docFor, readOnly, selected, dragging, dropSide, toolbar, ...handlers }) => {
  const size = isFlowSize(row.size) ? row.size : 'full'
  const isText = row.blockType === 'text'
  const className = [
    isText ? 'textelement' : 'figure-wrapper',
    row.blockType === 'topicReference' && 'has-overlay',
    size,
    ...(row.modifiers ?? []),
    'flow-editor__item',
    selected && 'flow-editor__item--selected',
    dragging && 'flow-editor__item--dragging',
    row.hasError && 'flow-editor__item--error',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div
      className={className}
      draggable={!readOnly}
      onClick={(event) => {
        event.stopPropagation()
        handlers.onSelect()
      }}
      onContextMenu={(event) => {
        event.preventDefault()
        handlers.onSelect()
      }}
      onDoubleClick={readOnly ? undefined : handlers.onEdit}
      onDragStart={(event) => {
        event.dataTransfer.effectAllowed = 'move'
        event.dataTransfer.setData('text/plain', row.id)
        handlers.onDragStart()
      }}
      onDragEnd={handlers.onDragEnd}
      onDragOver={handlers.onDragOver}
      onDrop={handlers.onDrop}
    >
      {isText ? <TextContent row={row} /> : <FigureContent row={row} docFor={docFor} />}
      <span className="flow-editor__tag">
        {BLOCK_LABELS[row.blockType] ?? row.blockType} · {SIZE_LABELS[size]}
      </span>
      {dropSide && <span className={`flow-editor__drop flow-editor__drop--${dropSide}`} />}
      {toolbar}
    </div>
  )
}

const OffstageItem: React.FC<{
  row: Row
  docFor: ReturnType<typeof useReferencedDocs>
  readOnly: boolean
  onEdit: () => void
  onRemove: () => void
}> = ({ row, docFor, readOnly, onEdit, onRemove }) => {
  const news = row.news ? docFor({ collection: 'news', id: row.news }) : null
  const image = imageSource(news?.image)
  return (
    <div className={`flow-editor__offstage-item${row.hasError ? ' flow-editor__item--error' : ''}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {image?.src ? <img src={image.src} alt="" /> : <span className="flow-editor__offstage-noimg" />}
      <span className="flow-editor__offstage-title">
        {BLOCK_LABELS[row.blockType] ?? row.blockType}:{' '}
        {news === undefined ? 'Loading…' : (news?.title ?? 'not found')}
      </span>
      {!readOnly && (
        <>
          <button type="button" className="flow-editor__btn" onClick={onEdit}>
            Edit
          </button>
          <button type="button" className="flow-editor__btn flow-editor__btn--danger" title="Remove" onClick={onRemove}>
            ✕
          </button>
        </>
      )}
    </div>
  )
}

const TextContent: React.FC<{ row: Row }> = ({ row }) => {
  const hasBody = Boolean(row.body?.root?.children?.length)
  return (
    <div className="col">
      {row.title && <h4 className="textelement__title">{row.title}</h4>}
      {hasBody && (
        <div className="textelement__body">
          <RichText data={row.body} disableContainer />
        </div>
      )}
      {!row.title && !hasBody && <p className="flow-editor__placeholder-text">Empty text block. Double-click to write.</p>}
    </div>
  )
}

const FigureContent: React.FC<{ row: Row; docFor: ReturnType<typeof useReferencedDocs> }> = ({ row, docFor }) => {
  let media: Record<string, any> | null | undefined
  let caption: string | undefined
  let missing = 'No image selected'

  if (row.blockType === 'image' && row.image) {
    media = docFor({ collection: 'media', id: row.image })
    caption = media?.project?.name
    missing = 'Image not found'
  } else if (row.blockType === 'topicReference' && row.topic) {
    const topic = docFor({ collection: 'topics', id: row.topic })
    media = topic === undefined ? undefined : (topic?.image ?? null)
    caption = topic?.name
    missing = topic ? 'Topic has no image' : 'Topic not found'
  } else if (row.blockType === 'newsReference' && row.news) {
    const news = docFor({ collection: 'news', id: row.news })
    media = news === undefined ? undefined : (news?.image ?? null)
    caption = news?.title
    missing = news ? 'News item has no image' : 'News item not found'
  } else {
    media = null
  }

  const image = imageSource(media)
  return (
    <>
      <figure>
        {image?.src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image.src} alt={image.alt} width={image.width} height={image.height} draggable={false} />
        ) : (
          <div className={`flow-editor__placeholder${media === undefined ? '' : ' flow-editor__placeholder--missing'}`}>
            {media === undefined ? 'Loading…' : missing}
          </div>
        )}
      </figure>
      {caption && <div className="figure-caption">{caption}</div>}
    </>
  )
}

type ItemToolbarProps = {
  row: Row
  canMoveBack: boolean
  canMoveForward: boolean
  onResize: (step: number) => void
  onToggle: (modifier: FlowModifier) => void
  onMove: (step: number) => void
  onEdit: () => void
  onRemove: () => void
}

const ItemToolbar: React.FC<ItemToolbarProps> = ({ row, canMoveBack, canMoveForward, onResize, onToggle, onMove, onEdit, onRemove }) => {
  const ref = useRef<HTMLDivElement>(null)
  const [alignRight, setAlignRight] = useState(false)
  const size = isFlowSize(row.size) ? row.size : 'full'
  const active = new Set(row.modifiers ?? [])

  // Open towards the side with room, so toolbars of blocks near the right edge stay visible.
  useEffect(() => {
    const item = ref.current?.parentElement
    const canvas = item?.parentElement
    if (!item || !canvas) return
    const itemBox = item.getBoundingClientRect()
    const canvasBox = canvas.getBoundingClientRect()
    setAlignRight(itemBox.left + (ref.current?.offsetWidth ?? 0) > canvasBox.right)
  }, [row.size, row.modifiers])

  const stop = (event: React.SyntheticEvent) => event.stopPropagation()

  return (
    <div
      ref={ref}
      className={`flow-editor__bar${alignRight ? ' flow-editor__bar--right' : ''}`}
      onClick={stop}
      onDoubleClick={stop}
      onMouseDown={stop}
      draggable
      onDragStart={(event) => {
        event.preventDefault()
        event.stopPropagation()
      }}
    >
      <div className="flow-editor__group" title="Width">
        <button type="button" className="flow-editor__btn" title="Narrower (−)" disabled={size === 'one6'} onClick={() => onResize(-1)}>
          −
        </button>
        <span className="flow-editor__size">{SIZE_LABELS[size]}</span>
        <button type="button" className="flow-editor__btn" title="Wider (+)" disabled={size === 'full'} onClick={() => onResize(1)}>
          +
        </button>
      </div>
      <div className="flow-editor__group">
        {toolbarModifiers(row.blockType).map((modifier) => (
          <button
            key={modifier}
            type="button"
            className={`flow-editor__btn flow-editor__chip${active.has(modifier) ? ' flow-editor__chip--on' : ''}`}
            title={MODIFIER_HINTS[modifier]}
            aria-pressed={active.has(modifier)}
            onClick={() => onToggle(modifier)}
          >
            {SHORT_MODIFIER_LABELS[modifier]}
          </button>
        ))}
      </div>
      <div className="flow-editor__group">
        <button type="button" className="flow-editor__btn" title="Move earlier (Alt+←)" disabled={!canMoveBack} onClick={() => onMove(-1)}>
          ←
        </button>
        <button type="button" className="flow-editor__btn" title="Move later (Alt+→)" disabled={!canMoveForward} onClick={() => onMove(1)}>
          →
        </button>
        <button type="button" className="flow-editor__btn" title="Edit content (Enter)" onClick={onEdit}>
          Edit
        </button>
        <button type="button" className="flow-editor__btn flow-editor__btn--danger" title="Remove (Delete)" onClick={onRemove}>
          ✕
        </button>
      </div>
    </div>
  )
}

function Segmented<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T
  onChange: (value: T) => void
  options: { value: T; label: string }[]
}) {
  return (
    <div className="flow-editor__segmented" role="radiogroup">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={value === option.value}
          className={value === option.value ? 'is-active' : ''}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
