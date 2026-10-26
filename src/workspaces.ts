import { GROUPS } from '@/i18n/groups'

// Workspaces of the admin (see CONTEXT.md): each shows only the navigation sections one kind of
// work needs, in its own order, in the navigation and on the dashboard. They don't restrict
// access; links, relationship fields and URLs still open everything (docs/adr/0001).

export type Section = keyof typeof GROUPS

export type Workspace = {
  slug: string
  label: { en: string; de: string }
  sections: Section[]
}

export const WORKSPACES: Workspace[] = [
  {
    slug: 'website',
    label: { en: 'Website', de: 'Website' },
    sections: ['projects', 'content', 'news', 'publications', 'office'],
  },
  {
    slug: 'minescapes',
    label: { en: 'Minescapes', de: 'Minescapes' },
    sections: ['minescapes', 'excursions'],
  },
]

// Shown at the bottom of every workspace.
export const SHARED_SECTIONS: Section[] = ['media', 'admin']

// The last switcher option: every section, in the config's order.
export const ALL_SECTIONS = 'all'

export const DEFAULT_WORKSPACE = 'website'

// Key of the payload-preferences entry that holds a user's current workspace.
export const WORKSPACE_PREFERENCE = 'workspace'

// A stored preference may name a workspace that no longer exists.
export const resolveWorkspace = (stored: unknown): string =>
  stored === ALL_SECTIONS || WORKSPACES.some(({ slug }) => slug === stored)
    ? (stored as string)
    : DEFAULT_WORKSPACE

// Narrows Payload's navigation groups, which carry the translated section name as label, to a
// workspace: its own sections, and the shared ones, which every workspace (All included) shows
// at the bottom. A section no workspace lists shows up in all of them, so nothing goes missing
// before it is filed (tests/unit/workspaces.unit.spec.ts fails meanwhile).
export function workspaceSections<G extends { label: string }>(
  groups: G[],
  workspace: string,
  sectionLabel: (section: Section) => string,
): { own: G[]; shared: G[] } {
  const labels = (sections: Section[]) => sections.map(sectionLabel)
  const withLabel = (label: string) => groups.filter((group) => group.label === label)
  const sharedLabels = new Set(labels(SHARED_SECTIONS))
  const shared = labels(SHARED_SECTIONS).flatMap(withLabel)

  const current = WORKSPACES.find(({ slug }) => slug === workspace)
  if (!current) return { own: groups.filter(({ label }) => !sharedLabels.has(label)), shared }

  const filed = new Set([...WORKSPACES.flatMap(({ sections }) => labels(sections)), ...sharedLabels])
  return {
    own: [
      ...labels(current.sections).flatMap(withLabel),
      ...groups.filter(({ label }) => !filed.has(label)),
    ],
    shared,
  }
}
