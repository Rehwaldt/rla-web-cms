'use client'

import { useConfig, useListQuery, useLocale, useTranslation } from '@payloadcms/ui'
import Link from 'next/link'
import React, { useMemo } from 'react'
import { buildCategoryColumns, type CategoryId } from '@/fields/projects/categoryTree'
import type { TranslationKeys, Translations } from '@/i18n/translations'
import { useCategories } from './useCategories'
import './index.css'

const COLLECTION = 'project-categories'

// Above the categories list: the same grouped columns as the category picker on projects, each
// group and category linking to its edit view, so a category is found by where it sits on the
// website rather than on a page of the flat list. The list below stays for search and
// drag-and-drop ordering; the overview picks up a new order on the next load.
export function CategoryOverview() {
  const { t } = useTranslation<Translations, TranslationKeys>()
  const {
    config: {
      routes: { admin },
    },
  } = useConfig()
  const { code: locale } = useLocale()
  // Reloads when the list does, e.g. after a delete.
  const { data } = useListQuery()
  const categories = useCategories(COLLECTION, locale, data)
  const columns = useMemo(
    () => buildCategoryColumns(categories ?? [], { includeEmptyGroups: true }),
    [categories],
  )
  const editURL = (id: CategoryId) => `${admin}/collections/${COLLECTION}/${id}`

  if (categories === undefined) return <p className="category-picker__note">{t('categories:loading')}</p>
  if (categories === null) return <p className="category-picker__note">{t('categories:loadFailed')}</p>
  if (columns.length === 0) return null

  return (
    <nav aria-label={t('categories:overview')} className="category-picker category-overview">
      <div className="category-picker__columns">
        {columns.map((groups, index) => (
          <div className="category-picker__column" key={index}>
            {groups.map((group) => (
              <div className="category-picker__group" key={group.id}>
                <Link className="category-picker__group-name category-overview__link" href={editURL(group.id)}>
                  {group.name || t('categories:untitled')}
                </Link>
                {group.children.map((child) => (
                  <Link className="category-overview__link" href={editURL(child.id)} key={child.id}>
                    {child.name || t('categories:untitled')}
                  </Link>
                ))}
              </div>
            ))}
          </div>
        ))}
      </div>
    </nav>
  )
}
