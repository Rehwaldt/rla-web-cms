'use client'

import { getTranslation } from '@payloadcms/translations'
import { useLocale, useTranslation } from '@payloadcms/ui'
import React, { useEffect } from 'react'
import type { TranslationKeys, Translations } from '@/i18n/translations'
import './localeFlags.css'

// Wraps the whole admin (payload.config.ts). Tells the flag styles (localeFlags.css) which
// content locale is being edited and the tooltip of the localized-field marker, which CSS alone
// can't know.
export function LocaleFlagsProvider({ children }: { children: React.ReactNode }) {
  const locale = useLocale()
  const { i18n, t } = useTranslation<Translations, TranslationKeys>()
  const name = locale ? getTranslation(locale.label, i18n) : ''
  const tooltip = t('locales:localizedField', { locale: name })

  useEffect(() => {
    const root = document.documentElement
    if (locale?.code) root.dataset.contentLocale = locale.code
    // A CSS string, read by `content:`.
    root.style.setProperty('--localized-field-tooltip', JSON.stringify(tooltip))
  }, [locale?.code, tooltip])

  return <>{children}</>
}
