'use client'

import React, { useEffect } from 'react'
import { getTranslation } from '@payloadcms/translations'
import {
  useDocumentInfo,
  useForm,
  useFormFields,
  useRowLabel,
  useTranslation,
} from '@payloadcms/ui'
import type { Row } from 'payload'
import { NUMBERED_STOP_TYPE, STOP_TYPES } from '@/fields/stopTypes'
import type { TranslationKeys, Translations } from '@/i18n/translations'

// Row labels of an excursion's days and stops, so collapsed rows still say which is which.

type SavedExcursion = { days?: { id?: string | null; stops?: { id?: string | null }[] | null }[] | null }

// Ids of rows already opened by useOpenNewRow, so a row the editor collapses stays collapsed.
const openedRowIDs = new Set<string>()

// Days and stops start collapsed (initCollapsed), and Payload collapses rows added later as well.
// A row the saved document doesn't have yet is opened once, so the editor can fill it in.
function useOpenNewRow(path: string) {
  const arrayPath = path.slice(0, path.lastIndexOf('.'))
  const rowID = useFormFields(([fields]) => fields[`${path}.id`]?.value) as string | undefined
  const rows = useFormFields(([fields]) => fields[arrayPath]?.rows)
  const { dispatchFields } = useForm()
  const { savedDocumentData } = useDocumentInfo()

  useEffect(() => {
    if (!rowID || openedRowIDs.has(rowID)) return
    const row = rows?.find(({ id }) => id === rowID)
    // Wait until the form state says whether the row is collapsed.
    if (!rows || row?.collapsed === undefined) return
    const saved = new Set(
      ((savedDocumentData ?? {}) as SavedExcursion).days?.flatMap((day) => [
        day.id,
        ...(day.stops ?? []).map((stop) => stop.id),
      ]),
    )
    if (saved.has(rowID)) return
    openedRowIDs.add(rowID)
    if (!row.collapsed) return
    dispatchFields({
      type: 'SET_ROW_COLLAPSED',
      path: arrayPath,
      updatedRows: rows.map((r: Row) => (r.id === rowID ? { ...r, collapsed: false } : r)),
    })
  }, [arrayPath, dispatchFields, rowID, rows, savedDocumentData])
}

export function DayRowLabel() {
  const { data, path } = useRowLabel<{ date?: string | null }>()
  const { i18n, t } = useTranslation<Translations, TranslationKeys>()
  useOpenNewRow(path)
  if (!data?.date) return <span>{t('excursions:unscheduledDay')}</span>
  const date = new Intl.DateTimeFormat(i18n.language, {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(data.date))
  return <span>{date}</span>
}

export function StopRowLabel() {
  const {
    data,
    path,
    rowNumber = 0,
  } = useRowLabel<{ title?: string | null; time?: string | null; type?: string | null }>()
  const { i18n, t } = useTranslation<Translations, TranslationKeys>()
  useOpenNewRow(path)
  // Numbered stops count up per day, skipping the rows of other types, as on the website.
  const arrayPath = path.slice(0, path.lastIndexOf('.'))
  const position = useFormFields(([fields]) => {
    let count = 0
    for (let i = 0; i < rowNumber; i++) {
      if (fields[`${arrayPath}.${i}.type`]?.value === NUMBERED_STOP_TYPE) count++
    }
    return count + 1
  })
  const type = STOP_TYPES.find(({ value }) => value === (data?.type ?? NUMBERED_STOP_TYPE))
  const prefix =
    !type || type.value === NUMBERED_STOP_TYPE
      ? String(position).padStart(2, '0')
      : getTranslation(type.label, i18n)
  return (
    <span>
      {prefix} · {data?.time ? `${data.time} · ` : ''}
      {data?.title || t('excursions:untitledStop')}
    </span>
  )
}
