'use client'

import {
  closestCorners,
  type CollisionDetection,
  DndContext,
  type DragEndEvent,
  type DragOverEvent,
  DragOverlay,
  type DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  pointerWithin,
  useDroppable,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { getTranslation } from '@payloadcms/translations'
import type { ListViewClientProps } from 'payload'
import {
  Button,
  DragHandleIcon,
  Form,
  Gutter,
  LeaveWithoutSaving,
  toast,
  useConfig,
  useDocumentDrawer,
  useForm,
  useLocale,
  useStepNav,
  useTranslation,
} from '@payloadcms/ui'
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { useCategories } from '@/components/cms/CategoryPicker/useCategories'
import {
  buildLayout,
  type CategoryLayout,
  containerOf,
  MENU_COLUMNS,
  moveItem,
  NO_COLUMN,
  NOT_IN_GROUP,
  planChanges,
} from '@/fields/projects/categoryLayout'
import type { CategoryId, CategoryNode } from '@/fields/projects/categoryTree'
import type { TranslationKeys, Translations } from '@/i18n/translations'
import '@/components/cms/CategoryPicker/index.css'
import './index.css'

// Replaces the list view of project categories: groups in the four columns of the website's
// project filter menu, each with its categories, laid out like the category picker on projects.
// Entries are rearranged by drag and drop (categories between groups, groups between columns) and
// stored with Save; they open in a drawer for editing. Each category shows how many projects
// use it, linking to those projects.

const PROJECTS = 'projects'

type Target = { id?: number; initialData?: Record<string, unknown> }

/** What the entries need from the view, without passing it down every level. */
type ViewContext = {
  names: Map<string, string>
  counts: Map<string, number> | undefined
  locked: boolean
  open: (target: Target) => void
  projectsURL: (id: string) => string
}
const Context = createContext<ViewContext | null>(null)
const useView = () => useContext(Context)!

type DragData =
  | { type: 'group'; column: string }
  | { type: 'column'; column: string }
  | { type: 'category'; group: string }
  | { type: 'body'; group: string }

const groupKey = (id: string) => `group:${id}`
const categoryKey = (id: string) => `category:${id}`
const idOfKey = (key: string | number) => String(key).slice(String(key).indexOf(':') + 1)

/**
 * Groups land only on groups and columns, categories only on categories and group bodies, and
 * nothing on the column without a menu column or the stray categories.
 */
const collisionDetection: CollisionDetection = (args) => {
  const dragging = args.active.data.current as DragData | undefined
  const droppableContainers = args.droppableContainers.filter((container) => {
    const data = container.data.current as DragData | undefined
    if (!data) return false
    if (dragging?.type === 'group')
      return (data.type === 'group' || data.type === 'column') && data.column !== NO_COLUMN
    return (data.type === 'category' || data.type === 'body') && data.group !== NOT_IN_GROUP
  })
  const scoped = { ...args, droppableContainers }
  const within = pointerWithin(scoped)
  if (within.length > 0) {
    // An entry under the pointer wins over the list it sits in.
    const entry = within.find((collision) => {
      const type = (collision.data?.droppableContainer?.data.current as DragData | undefined)?.type
      return type === 'group' || type === 'category'
    })
    return [entry ?? within[0]]
  }
  return closestCorners(scoped)
}

/** Number of projects per category id, drafts and hidden projects included. */
const useProjectCounts = (reloadKey: unknown) => {
  const {
    config: {
      serverURL,
      routes: { api },
    },
  } = useConfig()
  const [counts, setCounts] = useState<Map<string, number>>()
  useEffect(() => {
    let cancelled = false
    const params = new URLSearchParams({ 'select[categories]': 'true', depth: '0', limit: '0' })
    fetch(`${serverURL}${api}/${PROJECTS}?${params}`, { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then(
        (result: { docs: { categories?: (CategoryId | { id: CategoryId })[] | null }[] }) => {
          const next = new Map<string, number>()
          for (const project of result.docs) {
            for (const ref of project.categories ?? []) {
              const id = String(typeof ref === 'object' ? ref.id : ref)
              next.set(id, (next.get(id) ?? 0) + 1)
            }
          }
          if (!cancelled) setCounts(next)
        },
        // Without counts the view still works.
        () => undefined,
      )
    return () => {
      cancelled = true
    }
  }, [reloadKey, serverURL, api])
  return counts
}

/** Lets Payload's leave-without-saving prompt guard unsaved drags. */
function ModifiedFlag({ modified }: { modified: boolean }) {
  const { setModified } = useForm()
  useEffect(() => setModified(modified), [modified, setModified])
  return null
}

function DragHandle({
  name,
  setActivatorNodeRef,
  attributes,
  listeners,
}: { name: string } & Pick<
  ReturnType<typeof useSortable>,
  'setActivatorNodeRef' | 'attributes' | 'listeners'
>) {
  const { t } = useTranslation<Translations, TranslationKeys>()
  return (
    <button
      aria-label={t('categories:dragHandle', { name })}
      className="category-view__handle"
      ref={setActivatorNodeRef}
      type="button"
      {...attributes}
      {...listeners}
    >
      <DragHandleIcon />
    </button>
  )
}

function Category({ id, group }: { id: string; group: string }) {
  const { t } = useTranslation<Translations, TranslationKeys>()
  const { names, counts, locked, open, projectsURL } = useView()
  const {
    attributes,
    isDragging,
    listeners,
    setActivatorNodeRef,
    setNodeRef,
    transform,
    transition,
  } = useSortable({
    id: categoryKey(id),
    data: { type: 'category', group } satisfies DragData,
  })
  const name = names.get(id) || t('categories:untitled')
  const count = counts?.get(id) ?? (counts ? 0 : undefined)
  return (
    <div
      className={['category-view__category', isDragging && 'category-view__placeholder']
        .filter(Boolean)
        .join(' ')}
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
    >
      <DragHandle
        attributes={attributes}
        listeners={listeners}
        name={name}
        setActivatorNodeRef={setActivatorNodeRef}
      />
      <button
        className="category-view__name"
        disabled={locked}
        onClick={() => open({ id: Number(id) })}
        title={locked ? t('categories:saveFirst') : undefined}
        type="button"
      >
        {name}
      </button>
      {count !== undefined && (
        <a
          className="category-view__count"
          href={projectsURL(id)}
          rel="noopener noreferrer"
          target="_blank"
          title={t('categories:projectCount', { count })}
        >
          {count}
        </a>
      )}
    </div>
  )
}

function Group({ id, column, categoryIds }: { id: string; column: string; categoryIds: string[] }) {
  const { t } = useTranslation<Translations, TranslationKeys>()
  const { names, locked, open } = useView()
  const isGroup = id !== NOT_IN_GROUP
  const {
    attributes,
    isDragging,
    listeners,
    setActivatorNodeRef,
    setNodeRef,
    transform,
    transition,
  } = useSortable({
    id: groupKey(id),
    data: { type: 'group', column } satisfies DragData,
    disabled: !isGroup,
  })
  const { isOver, setNodeRef: setBodyRef } = useDroppable({
    id: `body:${id}`,
    data: { type: 'body', group: id } satisfies DragData,
  })
  const name = isGroup ? names.get(id) || t('categories:untitled') : t('categories:notInGroup')
  return (
    <div
      className={['category-view__group', isDragging && 'category-view__placeholder']
        .filter(Boolean)
        .join(' ')}
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
    >
      <div className="category-view__group-header">
        {isGroup && (
          <DragHandle
            attributes={attributes}
            listeners={listeners}
            name={name}
            setActivatorNodeRef={setActivatorNodeRef}
          />
        )}
        {isGroup ? (
          <button
            className="category-view__name category-view__group-name"
            disabled={locked}
            onClick={() => open({ id: Number(id) })}
            title={locked ? t('categories:saveFirst') : undefined}
            type="button"
          >
            {name}
          </button>
        ) : (
          <span className="category-view__group-name">{name}</span>
        )}
        {isGroup && (
          <Button
            aria-label={t('categories:newCategoryIn', { group: name })}
            buttonStyle="icon-label"
            className="category-view__add"
            disabled={locked}
            icon="plus"
            iconStyle="without-border"
            margin={false}
            onClick={() => open({ initialData: { parent: Number(id) } })}
            tooltip={
              locked ? t('categories:saveFirst') : t('categories:newCategoryIn', { group: name })
            }
          />
        )}
      </div>
      <SortableContext items={categoryIds.map(categoryKey)} strategy={verticalListSortingStrategy}>
        <div
          className={['category-view__body', isOver && 'category-view__body--over']
            .filter(Boolean)
            .join(' ')}
          ref={setBodyRef}
        >
          {categoryIds.map((categoryId) => (
            <Category group={id} id={categoryId} key={categoryId} />
          ))}
          {categoryIds.length === 0 && (
            <span className="category-view__empty">{t('categories:emptyGroup')}</span>
          )}
        </div>
      </SortableContext>
    </div>
  )
}

function Column({ column, layout }: { column: string; layout: CategoryLayout }) {
  const { t } = useTranslation<Translations, TranslationKeys>()
  const { locked, open } = useView()
  const { isOver, setNodeRef } = useDroppable({
    id: `column:${column}`,
    data: { type: 'column', column } satisfies DragData,
  })
  const groupIds = layout.columns[column] ?? []
  const strays = column === NO_COLUMN ? (layout.groups[NOT_IN_GROUP] ?? []) : []
  return (
    <div
      className={[
        'category-picker__column',
        'category-view__column',
        isOver && 'category-view__column--over',
      ]
        .filter(Boolean)
        .join(' ')}
      ref={setNodeRef}
    >
      <div className="category-view__column-header">
        <span>
          {column === NO_COLUMN
            ? t('categories:noColumn')
            : t('categories:column', { number: column })}
        </span>
        {column !== NO_COLUMN && (
          <Button
            buttonStyle="icon-label"
            disabled={locked}
            icon="plus"
            iconStyle="without-border"
            margin={false}
            onClick={() => open({ initialData: { menuColumn: column } })}
            size="small"
            tooltip={locked ? t('categories:saveFirst') : undefined}
          >
            {t('categories:newGroup')}
          </Button>
        )}
      </div>
      <SortableContext items={groupIds.map(groupKey)} strategy={verticalListSortingStrategy}>
        {groupIds.map((id) => (
          <Group categoryIds={layout.groups[id] ?? []} column={column} id={id} key={id} />
        ))}
      </SortableContext>
      {strays.length > 0 && <Group categoryIds={strays} column={column} id={NOT_IN_GROUP} />}
    </div>
  )
}

export function CategoryView({ collectionSlug }: ListViewClientProps) {
  const { i18n, t } = useTranslation<Translations, TranslationKeys>()
  const {
    config: {
      serverURL,
      routes: { admin, api },
    },
    getEntityConfig,
  } = useConfig()
  const { code: locale } = useLocale()
  const { setStepNav } = useStepNav()
  const collectionConfig = getEntityConfig({ collectionSlug })
  const title = getTranslation(collectionConfig?.labels?.plural ?? collectionSlug, i18n)

  useEffect(() => setStepNav([{ label: title }]), [setStepNav, title])

  // `layout` is null while it shows the stored arrangement, and holds the rearranged one after a drag.
  const [layout, setLayout] = useState<CategoryLayout | null>(null)
  const [reloads, setReloads] = useState(0)
  const [saving, setSaving] = useState(false)
  const categories = useCategories(collectionSlug, locale, {
    reloadKey: reloads,
    reloadOnVisible: layout === null,
  })
  const counts = useProjectCounts(reloads)
  const stored = useMemo(() => buildLayout(categories ?? []), [categories])
  const shown = layout ?? stored
  const changes = useMemo(
    () => (layout && categories ? planChanges(categories, layout) : []),
    [categories, layout],
  )
  const modified = changes.length > 0
  const locked = modified || saving
  const names = useMemo(
    () =>
      new Map(
        (categories ?? []).map((category: CategoryNode) => [
          String(category.id),
          category.name ?? '',
        ]),
      ),
    [categories],
  )

  const reload = useCallback(() => {
    setLayout(null)
    setReloads((count) => count + 1)
  }, [])

  // The drawer: one at a time, for an existing entry or a new one with prefilled data.
  const [target, setTarget] = useState<Target | null>(null)
  const [DocumentDrawer, , { closeDrawer, openDrawer }] = useDocumentDrawer({
    collectionSlug,
    id: target?.id,
  })
  useEffect(() => {
    if (target) openDrawer()
  }, [target, openDrawer])

  const projectsURL = useCallback(
    (id: string) =>
      `${admin}/collections/${PROJECTS}?${new URLSearchParams({ 'where[or][0][and][0][categories][in][0]': id })}`,
    [admin],
  )
  const view = useMemo<ViewContext>(
    () => ({ names, counts, locked, open: (next) => setTarget({ ...next }), projectsURL }),
    [names, counts, locked, projectsURL],
  )

  // Dragging. The arrangement before the drag comes back on cancel.
  const before = useRef<CategoryLayout | null>(null)
  const [active, setActive] = useState<{ id: string; type: DragData['type'] } | null>(null)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )
  const nameOf = (key: string | number) => names.get(idOfKey(key)) || t('categories:untitled')

  const onDragStart = ({ active: dragged }: DragStartEvent) => {
    before.current = shown
    setLayout(shown)
    setActive({ id: idOfKey(dragged.id), type: (dragged.data.current as DragData).type })
  }

  // Moves the entry into another list while it's dragged over it.
  const onDragOver = ({ active: dragged, over }: DragOverEvent) => {
    if (!over || over.id === dragged.id) return
    const data = dragged.data.current as DragData
    const target = over.data.current as DragData
    const id = idOfKey(dragged.id)
    setLayout((current) => {
      if (!current) return current
      const key = data.type === 'group' ? 'columns' : 'groups'
      const map = current[key]
      const from = containerOf(map, id)
      const to =
        target.type === 'column' || target.type === 'group'
          ? target.type === 'column'
            ? target.column
            : containerOf(map, idOfKey(over.id))
          : target.type === 'body'
            ? target.group
            : containerOf(map, idOfKey(over.id))
      if (!from || !to || from === to) return current
      const overIndex = map[to].indexOf(idOfKey(over.id))
      const below =
        dragged.rect.current.translated &&
        dragged.rect.current.translated.top > over.rect.top + over.rect.height / 2
      const index = overIndex === -1 ? map[to].length : overIndex + (below ? 1 : 0)
      return { ...current, [key]: moveItem(map, id, to, index) }
    })
  }

  const onDragEnd = ({ active: dragged, over }: DragEndEvent) => {
    setActive(null)
    const data = dragged.data.current as DragData
    const id = idOfKey(dragged.id)
    setLayout((current) => {
      let next = current ?? stored
      if (over && over.id !== dragged.id) {
        const key = data.type === 'group' ? 'columns' : 'groups'
        const map = next[key]
        const from = containerOf(map, id)
        const overId = idOfKey(over.id)
        if (from && map[from].includes(overId)) {
          next = { ...next, [key]: moveItem(map, id, from, map[from].indexOf(overId)) }
        }
      }
      // Back where it started: show the stored arrangement again.
      return categories && planChanges(categories, next).length > 0 ? next : null
    })
  }

  const onDragCancel = () => {
    setActive(null)
    setLayout(
      before.current && categories && planChanges(categories, before.current).length > 0
        ? before.current
        : null,
    )
  }

  const save = async () => {
    setSaving(true)
    try {
      for (const { id, data } of changes) {
        const res = await fetch(`${serverURL}${api}/${collectionSlug}/${id}?depth=0`, {
          body: JSON.stringify(data),
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          method: 'PATCH',
        })
        if (!res.ok) {
          const result = await res.json().catch(() => null)
          throw new Error(result?.errors?.[0]?.message ?? res.statusText)
        }
      }
      toast.success(t('categories:saved'))
    } catch (error) {
      toast.error(
        t('categories:saveFailed', {
          error: error instanceof Error ? error.message : String(error),
        }),
      )
    } finally {
      setSaving(false)
      reload()
    }
  }

  let body: React.ReactNode
  if (categories === undefined)
    body = <p className="category-picker__note">{t('categories:loading')}</p>
  else if (categories === null)
    body = <p className="category-picker__note">{t('categories:loadFailed')}</p>
  else
    body = (
      <DndContext
        accessibility={{
          announcements: {
            onDragStart: ({ active: dragged }) =>
              t('categories:dragStart', { name: nameOf(dragged.id) }),
            onDragOver: () => undefined,
            onDragEnd: ({ active: dragged }) =>
              t('categories:dragEnd', { name: nameOf(dragged.id) }),
            onDragCancel: ({ active: dragged }) =>
              t('categories:dragCancel', { name: nameOf(dragged.id) }),
          },
          screenReaderInstructions: { draggable: t('categories:dragInstructions') },
        }}
        collisionDetection={collisionDetection}
        onDragCancel={onDragCancel}
        onDragEnd={onDragEnd}
        onDragOver={onDragOver}
        onDragStart={onDragStart}
        sensors={sensors}
      >
        <div className="category-picker__columns category-view__columns">
          {MENU_COLUMNS.map((column) => (
            <Column column={column} key={column} layout={shown} />
          ))}
          {(shown.columns[NO_COLUMN].length > 0 || shown.groups[NOT_IN_GROUP].length > 0) && (
            <Column column={NO_COLUMN} layout={shown} />
          )}
        </div>
        <DragOverlay>
          {active && (
            <div className={`category-view__overlay category-view__overlay--${active.type}`}>
              <DragHandleIcon />
              <span>{names.get(active.id) || t('categories:untitled')}</span>
            </div>
          )}
        </DragOverlay>
      </DndContext>
    )

  return (
    <div className={`collection-list collection-list--${collectionSlug} category-view`}>
      <Gutter className="collection-list__wrap">
        <header className="list-header">
          <div className="list-header__content">
            <div className="list-header__title-and-actions">
              <h1 className="list-header__title">{title}</h1>
              <div className="list-header__title-actions">
                <Button
                  buttonStyle="pill"
                  disabled={locked}
                  margin={false}
                  onClick={() => setTarget({})}
                  size="small"
                  tooltip={locked ? t('categories:saveFirst') : undefined}
                >
                  {i18n.t('general:createNew')}
                </Button>
              </div>
            </div>
          </div>
        </header>
        <p className="category-view__usage">{t('categories:usage')}</p>
        {(modified || saving) && (
          <div className="category-view__unsaved" role="status">
            <span>{saving ? t('categories:saving') : t('categories:unsaved')}</span>
            <Button
              buttonStyle="secondary"
              disabled={saving}
              margin={false}
              onClick={reload}
              size="small"
            >
              {t('categories:discard')}
            </Button>
            <Button disabled={saving} margin={false} onClick={() => void save()} size="small">
              {t('categories:save')}
            </Button>
          </div>
        )}
        <Form initialState={{}}>
          <ModifiedFlag modified={modified} />
          <LeaveWithoutSaving />
        </Form>
        <Context.Provider value={view}>{body}</Context.Provider>
      </Gutter>
      {target && (
        <DocumentDrawer
          initialData={target.initialData}
          onDelete={() => {
            closeDrawer()
            reload()
          }}
          onSave={({ operation }) => {
            if (operation === 'create') closeDrawer()
            reload()
          }}
          redirectAfterCreate={false}
          redirectAfterDelete={false}
        />
      )}
    </div>
  )
}
