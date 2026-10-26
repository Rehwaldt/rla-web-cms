'use client'

import { useConfig } from '@payloadcms/ui'
import { useEffect, useMemo, useState } from 'react'
import type { FlowCollection } from '@/fields/flowBlocks'

// Loads the media and topics a flow points at, with just the fields the preview needs.

export type DocRef = { collection: FlowCollection; id: number | string }

const IMAGE_FIELDS = ['filename', 'url', 'width', 'height', 'sizes', 'alt']

const QUERIES: Record<FlowCollection, Record<string, string>> = {
  media: {
    ...Object.fromEntries([...IMAGE_FIELDS, 'project'].map((f) => [`select[${f}]`, 'true'])),
    'populate[projects][name]': 'true',
  },
  topics: {
    'select[name]': 'true',
    'select[image]': 'true',
    draft: 'true',
    ...Object.fromEntries(IMAGE_FIELDS.map((f) => [`populate[media][${f}]`, 'true'])),
  },
}

const keyOf = (locale: string, ref: DocRef) => `${locale}:${ref.collection}:${ref.id}`

/**
 * Returns a lookup for the referenced documents: a document once loaded, `null` if it doesn't
 * exist (or can't be read), `undefined` while loading.
 */
export const useReferencedDocs = (refs: DocRef[], locale: string) => {
  const {
    config: {
      serverURL,
      routes: { api },
    },
  } = useConfig()
  const [docs, setDocs] = useState<Record<string, Record<string, any> | null>>({})

  const refsKey = useMemo(
    () => [...new Set(refs.map((ref) => `${ref.collection}:${ref.id}`))].sort().join('|'),
    [refs],
  )

  useEffect(() => {
    const missing = new Map<FlowCollection, Set<string>>()
    for (const entry of refsKey ? refsKey.split('|') : []) {
      const [collection, id] = entry.split(':') as [FlowCollection, string]
      if (keyOf(locale, { collection, id }) in docs) continue
      if (!missing.has(collection)) missing.set(collection, new Set())
      missing.get(collection)!.add(id)
    }
    if (missing.size === 0) return

    // A request outdated by a newer set of refs is dropped; its ids are fetched again.
    let cancelled = false
    for (const [collection, ids] of missing) {
      const params = new URLSearchParams({
        'where[id][in]': [...ids].join(','),
        depth: '1',
        limit: '0',
        locale,
        ...QUERIES[collection],
      })
      fetch(`${serverURL}${api}/${collection}?${params}`, { credentials: 'include' })
        .then((res) => (res.ok ? res.json() : { docs: [] }))
        .catch(() => ({ docs: [] }))
        .then((result: { docs?: Record<string, any>[] }) => {
          if (cancelled) return
          const found: Record<string, Record<string, any> | null> = {}
          for (const id of ids) found[keyOf(locale, { collection, id })] = null
          for (const doc of result.docs ?? []) found[keyOf(locale, { collection, id: doc.id })] = doc
          setDocs((prev) => ({ ...prev, ...found }))
        })
    }
    return () => {
      cancelled = true
    }
    // `docs` is deliberately left out: fetched entries only ever get added.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refsKey, locale, serverURL, api])

  return (ref: DocRef) => docs[keyOf(locale, ref)]
}

/** A reasonably sized rendition of an image for the preview. */
export const imageSource = (media: Record<string, any> | null | undefined) => {
  if (!media || typeof media !== 'object') return undefined
  const sizes = media.sizes ?? {}
  const pick = sizes.w992?.url ? sizes.w992 : sizes.w768?.url ? sizes.w768 : null
  return {
    src: (pick?.url ?? media.url) as string | undefined,
    width: (pick?.width ?? media.width) as number | undefined,
    height: (pick?.height ?? media.height) as number | undefined,
    alt: (media.alt ?? '') as string,
  }
}
