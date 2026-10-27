'use client'

import React from 'react'
import { getTranslation } from '@payloadcms/translations'
import { useFormFields, useRowLabel, useTranslation } from '@payloadcms/ui'
import { NUMBERED_STOP_TYPE, STOP_TYPES } from '@/fields/stopTypes'
import type { TranslationKeys, Translations } from '@/i18n/translations'

// Row labels of an excursion's days and stops, so collapsed rows still say which is which.

export function DayRowLabel() {
  const { data } = useRowLabel<{ date?: string | null }>()
  const { i18n, t } = useTranslation<Translations, TranslationKeys>()
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
