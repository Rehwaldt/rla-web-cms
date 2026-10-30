'use client'

import type { RelationshipFieldClientProps } from 'payload'
import {
  CheckboxInput,
  FieldDescription,
  FieldError,
  FieldLabel,
  useConfig,
  useField,
  useTranslation,
} from '@payloadcms/ui'
import React, { useMemo } from 'react'
import { buildCategoryColumns, type CategoryId, toggleCategory } from '@/fields/projects/categoryTree'
import { idOf } from '@/fields/validation'
import { DEFAULT_LOCALE, LOCALE_CODES } from '@/locales'
import type { TranslationKeys, Translations } from '@/i18n/translations'
import { useCategories } from './useCategories'
import './index.css'

// Replaces the paginated relationship dropdown for project categories: all categories at once,
// grouped and in columns like the website's project filter menu. Only the categories within a
// group can be ticked. The value stays a plain hasMany relationship.

export const CategoryPicker: React.FC<RelationshipFieldClientProps> = ({
  field,
  path: pathFromProps,
  readOnly: readOnlyFromProps,
}) => {
  const { i18n, t } = useTranslation<Translations, TranslationKeys>()
  const {
    config: {
      routes: { admin },
    },
  } = useConfig()
  const { disabled, path, setValue, showError, value } = useField<CategoryId[] | null>({
    potentiallyStalePath: pathFromProps,
  })
  const readOnly = Boolean(readOnlyFromProps || disabled)
  const collection = field.relationTo as string

  // Named in the admin's language: the selection is the same in every content locale.
  const locale = LOCALE_CODES.includes(i18n.language) ? i18n.language : DEFAULT_LOCALE
  const categories = useCategories(collection, locale)
  const columns = useMemo(() => buildCategoryColumns(categories ?? []), [categories])
  const selected = useMemo(() => new Set((value ?? []).map(idOf)), [value])

  let body: React.ReactNode
  if (categories === undefined) body = <p className="category-picker__note">{t('categories:loading')}</p>
  else if (categories === null) body = <p className="category-picker__note">{t('categories:loadFailed')}</p>
  else if (columns.length === 0) body = <p className="category-picker__note">{t('categories:empty')}</p>
  else
    body = (
      <div className="category-picker__columns">
        {columns.map((groups, index) => (
          <div className="category-picker__column" key={index}>
            {groups.map((group) => {
              const count = group.children.filter((child) => selected.has(String(child.id))).length
              return (
                <fieldset className="category-picker__group" key={group.id}>
                  <legend className="category-picker__group-name">
                    {group.name}
                    {count > 0 && (
                      <span className="category-picker__count">({count})</span>
                    )}
                  </legend>
                  {group.children.map((child) => (
                    <CheckboxInput
                      checked={selected.has(String(child.id))}
                      className="category-picker__option"
                      id={`${path}-${child.id}`}
                      key={child.id}
                      label={child.name}
                      name={`${path}-${child.id}`}
                      onToggle={() => setValue(toggleCategory(columns, value ?? [], child.id))}
                      readOnly={readOnly}
                    />
                  ))}
                </fieldset>
              )
            })}
          </div>
        ))}
      </div>
    )

  return (
    <div className={['field-type', 'category-picker', showError && 'error'].filter(Boolean).join(' ')}>
      <div className="category-picker__header">
        <FieldLabel label={field.label} localized={field.localized} path={path} required={field.required} />
        <a
          className="category-picker__edit"
          href={`${admin}/collections/${collection}`}
          rel="noopener noreferrer"
          target="_blank"
        >
          {t('categories:edit')}
        </a>
      </div>
      <FieldError path={path} showError={showError} />
      {body}
      <FieldDescription description={field.admin?.description} path={path} />
    </div>
  )
}
