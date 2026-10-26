'use client'

import { getTranslation } from '@payloadcms/translations'
import { ReactSelect, usePreferences, useTranslation } from '@payloadcms/ui'
import type { ReactSelectOption } from '@payloadcms/ui'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'

import type { TranslationKeys, Translations } from '@/i18n/translations'
import { ALL_SECTIONS, WORKSPACE_PREFERENCE, WORKSPACES } from '@/workspaces'

// Switches the user's workspace. The choice is saved as a preference, so it follows the user
// across devices; the refresh lets the navigation and the dashboard re-render on the server.
export function WorkspaceSwitcher({ workspace }: { workspace: string }) {
  const { i18n, t } = useTranslation<Translations, TranslationKeys>()
  const { setPreference } = usePreferences()
  const router = useRouter()
  const [current, setCurrent] = useState(workspace)
  const [pending, startTransition] = useTransition()

  const options: ReactSelectOption[] = [
    ...WORKSPACES.map(({ slug, label }) => ({ label: getTranslation(label, i18n), value: slug })),
    { label: t('workspaces:all'), value: ALL_SECTIONS },
  ]

  const choose = (option: ReactSelectOption | ReactSelectOption[]) => {
    const slug = String((option as ReactSelectOption).value)
    if (slug === current) return
    setCurrent(slug)
    startTransition(async () => {
      await setPreference(WORKSPACE_PREFERENCE, slug)
      router.refresh()
    })
  }

  return (
    <div className="workspace-switcher">
      <span className="workspace-switcher__label">{t('workspaces:label')}</span>
      <ReactSelect
        disabled={pending}
        isClearable={false}
        isSearchable={false}
        onChange={choose}
        options={options}
        value={options.find(({ value }) => value === current)}
      />
    </div>
  )
}
