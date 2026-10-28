// Statuses of a project, the same for every project type: is the work on it still running? The
// schema (src/collections/projects/Projects.ts) and the importer (src/migration/plan/projects.ts)
// both read them from here. The intranet's statuses (planning, under construction, paused,
// cancelled) join them once its projects are migrated; until then "ongoing" covers all of them.

export const PROJECT_STATUSES = [
  { label: { en: 'Completed', de: 'Abgeschlossen' }, value: 'completed' },
  { label: { en: 'Ongoing', de: 'Laufend' }, value: 'ongoing' },
] as const

export type ProjectStatus = (typeof PROJECT_STATUSES)[number]['value']
