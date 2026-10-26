import { getTranslation } from '@payloadcms/translations'
import { getNavGroups } from '@payloadcms/ui/shared'
import type { PayloadRequest, SanitizedPermissions, VisibleEntities } from 'payload'
import { PREFERENCE_KEYS } from 'payload/shared'
import { cache } from 'react'

import { GROUPS } from '@/i18n/groups'
import { resolveWorkspace, WORKSPACE_PREFERENCE, workspaceSections } from '@/workspaces'

// A preference of the signed-in user, as Payload's own navigation reads its collapsed sections.
const getPreference = cache(async (req: PayloadRequest, key: string): Promise<unknown> => {
  if (!req.user) return undefined
  const { docs } = await req.payload.find({
    collection: 'payload-preferences',
    depth: 0,
    limit: 1,
    pagination: false,
    req,
    where: {
      key: { equals: key },
      'user.relationTo': { equals: req.user.collection },
      'user.value': { equals: req.user.id },
    },
  })
  return docs[0]?.value
})

export const getWorkspace = async (req: PayloadRequest) =>
  resolveWorkspace(await getPreference(req, WORKSPACE_PREFERENCE))

export const getNavPreferences = (req: PayloadRequest) => getPreference(req, PREFERENCE_KEYS.NAV)

// The navigation sections of the user's workspace, as Payload's navigation groups: its own, and
// the shared ones every workspace shows at the bottom.
export async function getWorkspaceSections(
  req: PayloadRequest,
  permissions: SanitizedPermissions,
  visibleEntities: VisibleEntities,
) {
  const groups = getNavGroups(permissions, visibleEntities, req.payload.config, req.i18n)
  return workspaceSections(groups, await getWorkspace(req), (section) =>
    getTranslation(GROUPS[section], req.i18n),
  )
}
