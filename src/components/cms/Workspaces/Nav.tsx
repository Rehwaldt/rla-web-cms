import { DefaultNavClient, NavHamburger, NavWrapper } from '@payloadcms/next/client'
import { Logout } from '@payloadcms/ui'
import type { PayloadRequest, ServerProps } from 'payload'

import { getNavPreferences, getWorkspace, getWorkspaceSections } from './sections'
import { WorkspaceSwitcher } from './WorkspaceSwitcher'

// Payload's navigation (DefaultNav in @payloadcms/next) with the workspace switcher on top and
// only the workspace's sections below. Built from the same parts; the config's beforeNav,
// afterNav, nav links and settings menu slots aren't rendered, since this project uses none.
export async function WorkspaceNav({
  permissions,
  req,
  visibleEntities,
}: ServerProps & { req?: PayloadRequest }) {
  if (!req || !permissions || !visibleEntities) return null
  const [workspace, { own, shared }, navPreferences] = await Promise.all([
    getWorkspace(req),
    getWorkspaceSections(req, permissions, visibleEntities),
    getNavPreferences(req),
  ])

  return (
    <NavWrapper baseClass="nav">
      <nav className="nav__wrap">
        <WorkspaceSwitcher workspace={workspace} />
        <DefaultNavClient groups={own} navPreferences={navPreferences as never} />
        {/* Pinned to the bottom, so they stay in place whichever workspace is open. */}
        <div className="workspace-nav__shared">
          <DefaultNavClient groups={shared} navPreferences={navPreferences as never} />
        </div>
        <div className="nav__controls">
          <Logout />
        </div>
      </nav>
      <div className="nav__header">
        <div className="nav__header-content">
          <NavHamburger baseClass="nav" />
        </div>
      </div>
    </NavWrapper>
  )
}
