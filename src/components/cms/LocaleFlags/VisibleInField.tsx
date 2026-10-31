'use client'

import { getTranslation } from '@payloadcms/translations'
import type { SelectFieldClientProps } from 'payload'
import {
  CheckboxInput,
  FieldDescription,
  FieldError,
  FieldLabel,
  useField,
  useTranslation,
} from '@payloadcms/ui'
import React from 'react'
import './localeFlags.css'

// The "Listed in" field (visibleInField) as one flagged checkbox per language instead of a
// dropdown: four options fit on screen, and every language's state shows without a click. The
// value stays the select's list of locale codes, in the options' order.

export const VisibleInField: React.FC<SelectFieldClientProps> = ({
  field,
  path: pathFromProps,
  readOnly: readOnlyFromProps,
}) => {
  const { i18n } = useTranslation()
  const { disabled, path, setValue, showError, value } = useField<string[] | null>({
    potentiallyStalePath: pathFromProps,
  })
  const readOnly = Boolean(readOnlyFromProps || disabled)
  const selected = new Set(value ?? [])
  const options = field.options.map((option) =>
    typeof option === 'string' ? { label: option, value: option } : option,
  )

  const toggle = (code: string) =>
    setValue(
      options
        .map((option) => option.value)
        .filter((other) => (other === code ? !selected.has(code) : selected.has(other))),
    )

  return (
    <div className={['field-type', 'visible-in', showError && 'error'].filter(Boolean).join(' ')}>
      <FieldLabel label={field.label} path={path} required={field.required} />
      <FieldError path={path} showError={showError} />
      <div className="visible-in__options">
        {options.map(({ label, value: code }) => {
          const id = `${path}-${code}`
          return (
            <CheckboxInput
              checked={selected.has(code)}
              id={id}
              key={code}
              Label={
                <label className="field-label visible-in__label" htmlFor={id}>
                  <span className="locale-flag" data-locale={code} />
                  {getTranslation(label, i18n)}
                </label>
              }
              onToggle={() => toggle(code)}
              readOnly={readOnly}
            />
          )
        })}
      </div>
      <FieldDescription description={field.admin?.description} path={path} />
    </div>
  )
}
