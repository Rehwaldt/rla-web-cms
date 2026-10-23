'use client'

import React from 'react'
import { useRowLabel, useTranslation } from '@payloadcms/ui'
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
  const { data, rowNumber } = useRowLabel<{ title?: string | null; time?: string | null }>()
  const { t } = useTranslation<Translations, TranslationKeys>()
  const number = String((rowNumber ?? 0) + 1).padStart(2, '0')
  return (
    <span>
      {number} · {data?.time ? `${data.time} ` : ''}
      {data?.title || t('excursions:untitledStop')}
    </span>
  )
}
