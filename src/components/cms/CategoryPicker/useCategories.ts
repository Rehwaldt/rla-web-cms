'use client'

import { useConfig } from '@payloadcms/ui'
import { useEffect, useState } from 'react'
import type { CategoryNode } from '@/fields/projects/categoryTree'

/**
 * All categories in display order, named in `locale`. `undefined` while loading, `null` if they
 * couldn't be loaded. Loads again when the editor returns to the tab, e.g. after editing the
 * categories in another one, and whenever `reloadKey` changes.
 */
export const useCategories = (collection: string, locale: string, reloadKey?: unknown) => {
  const {
    config: {
      serverURL,
      routes: { api },
    },
  } = useConfig()
  const [categories, setCategories] = useState<CategoryNode[] | null>()
  const [reloads, setReloads] = useState(0)

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible') setReloads((count) => count + 1)
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [])

  useEffect(() => {
    let cancelled = false
    const params = new URLSearchParams({
      'select[name]': 'true',
      'select[parent]': 'true',
      'select[menuColumn]': 'true',
      depth: '0',
      limit: '0',
      sort: '_order',
      locale,
    })
    fetch(`${serverURL}${api}/${collection}?${params}`, { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then(
        (result: { docs: CategoryNode[] }) => !cancelled && setCategories(result.docs),
        // A failed reload keeps the list already shown.
        () => !cancelled && setCategories((previous) => previous ?? null),
      )
    return () => {
      cancelled = true
    }
  }, [collection, locale, reloads, reloadKey, serverURL, api])

  return categories
}
