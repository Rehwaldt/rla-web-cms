import { getTranslation } from '@payloadcms/translations'
import { Button, Card } from '@payloadcms/ui'
import { getVisibleEntities } from '@payloadcms/ui/shared'
import { EntityType, getAccessResults } from 'payload'
import type { WidgetServerProps } from 'payload'
import { formatAdminURL } from 'payload/shared'

import { getWorkspaceSections } from './sections'

// Payload's "collections" dashboard widget (CollectionCards in @payloadcms/ui), limited to the
// sections of the user's workspace. Reuses its markup and styles; leaves out its lock badge on
// globals.
export async function WorkspaceCollectionCards({ req }: WidgetServerProps) {
  const { i18n } = req
  const adminRoute = req.payload.config.routes.admin
  const permissions = await getAccessResults({ req })
  const { own, shared } = await getWorkspaceSections(req, permissions, getVisibleEntities({ req }))
  const sections = [...own, ...shared]

  return (
    <div className="collections">
      <div className="collections__wrap">
        {sections.map(({ entities, label }) => (
          <div className="collections__group" key={label}>
            <h2 className="collections__label">{label}</h2>
            <ul className="collections__card-list">
              {entities.map(({ slug, type, label: entityLabel }) => {
                const title = getTranslation(entityLabel, i18n)
                const isCollection = type === EntityType.collection
                const href = formatAdminURL({ adminRoute, path: `/${type}/${slug}` })
                const canCreate = isCollection && permissions.collections?.[slug]?.create

                return (
                  <li key={slug}>
                    <Card
                      actions={
                        canCreate ? (
                          <Button
                            aria-label={i18n.t('general:createNewLabel', { label: title })}
                            buttonStyle="icon-label"
                            el="link"
                            icon="plus"
                            iconStyle="with-border"
                            round
                            to={formatAdminURL({ adminRoute, path: `/collections/${slug}/create` })}
                          />
                        ) : undefined
                      }
                      buttonAriaLabel={i18n.t(
                        isCollection ? 'general:showAllLabel' : 'general:editLabel',
                        { label: title },
                      )}
                      href={href}
                      id={`card-${slug}`}
                      title={title}
                      titleAs="h3"
                    />
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}
