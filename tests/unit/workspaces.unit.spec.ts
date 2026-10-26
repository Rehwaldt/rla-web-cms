// @vitest-environment node
import { describe, expect, it } from 'vitest'
import type { SanitizedConfig } from 'payload'
import configPromise from '@/payload.config'
import { GROUPS } from '@/i18n/groups'
import {
  ALL_SECTIONS,
  DEFAULT_WORKSPACE,
  resolveWorkspace,
  SHARED_SECTIONS,
  WORKSPACES,
  workspaceSections,
  type Section,
} from '@/workspaces'

const sections = Object.keys(GROUPS) as Section[]
const label = (section: Section) => GROUPS[section].en
const groups = (...labels: string[]) => labels.map((name) => ({ label: name }))

describe('workspaces', () => {
  it('file every navigation section in a workspace or as shared', () => {
    const filed = new Set([...WORKSPACES.flatMap((w) => w.sections), ...SHARED_SECTIONS])
    expect(sections.filter((section) => !filed.has(section))).toEqual([])
  })

  it('file every collection and global under a section of src/i18n/groups.ts', async () => {
    const config: SanitizedConfig = await configPromise
    const known = new Set(sections.map(label))
    const entities = [...config.collections, ...config.globals].filter(
      (entity) => entity.admin.hidden !== true,
    )
    const unfiled = entities
      .filter(({ admin }) => !admin.group || !known.has((admin.group as { en: string }).en))
      .map(({ slug }) => slug)
    expect(unfiled).toEqual([])
  })

  it('keep shared sections out of the workspaces', () => {
    for (const workspace of WORKSPACES) {
      expect(workspace.sections.filter((s) => SHARED_SECTIONS.includes(s))).toEqual([])
    }
  })

  it('show the workspace sections in its order, then unfiled ones, then shared ones', () => {
    const all = groups('Projects', 'Content', 'Brand new', 'Media', 'Minescapes', 'Admin')
    expect(workspaceSections(all, 'minescapes', label).map((g) => g.label)).toEqual([
      'Minescapes',
      'Media',
      'Brand new',
      'Admin',
    ])
  })

  it('show everything, in the given order, for "All"', () => {
    const all = groups('Projects', 'Minescapes', 'Admin')
    expect(workspaceSections(all, ALL_SECTIONS, label)).toEqual(all)
  })

  it('fall back to the default workspace for an unknown or missing preference', () => {
    expect(resolveWorkspace(undefined)).toBe(DEFAULT_WORKSPACE)
    expect(resolveWorkspace('retired')).toBe(DEFAULT_WORKSPACE)
    expect(resolveWorkspace('minescapes')).toBe('minescapes')
    expect(resolveWorkspace(ALL_SECTIONS)).toBe(ALL_SECTIONS)
  })
})
