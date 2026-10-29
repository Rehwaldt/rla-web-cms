'use client'

import React from 'react'
import { CheckboxInput, useListQuery, useTranslation } from '@payloadcms/ui'
import type { TranslationKeys, Translations } from '@/i18n/translations'
import { SHOW_FORMER_PARAM } from '@/collections/employeeListFilter'

// Above the employee list: lifts the list's filter on former employees (employeeListFilter).
// Goes through the list's own query state, so search, sort and paging keep the setting.
export function FormerEmployeesToggle() {
  const { query, refineListData } = useListQuery()
  const { t } = useTranslation<Translations, TranslationKeys>()
  const checked = (query as Record<string, unknown>)[SHOW_FORMER_PARAM] === '1'
  return (
    <div style={{ marginBottom: 'var(--base)' }}>
      <CheckboxInput
        id="show-former-employees"
        checked={checked}
        label={t('employees:showFormer')}
        onToggle={() =>
          void refineListData({ [SHOW_FORMER_PARAM]: checked ? undefined : '1', page: 1 } as never)
        }
      />
    </div>
  )
}
