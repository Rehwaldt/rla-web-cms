import fs from 'fs'
import path from 'path'

// Collects everything the importer couldn't map cleanly, grouped by category, so it can be
// fixed by hand instead of being guessed.

type Issue = { count: number; details: Set<string> }

export class Report {
  private readonly issues = new Map<string, Issue>()
  private readonly stats = new Map<string, number>()

  add(category: string, detail: string): void {
    // Identical details (e.g. the same flow parsed once per language) are recorded once.
    const issue = this.issues.get(category) ?? { count: 0, details: new Set<string>() }
    if (issue.details.has(detail)) return
    issue.count++
    issue.details.add(detail)
    this.issues.set(category, issue)
  }

  count(stat: string, by = 1): void {
    this.stats.set(stat, (this.stats.get(stat) ?? 0) + by)
  }

  summary(): string {
    const lines = ['Stats:']
    for (const [stat, value] of [...this.stats].sort()) lines.push(`  ${stat}: ${value}`)
    lines.push('Issues:')
    for (const [category, { count }] of [...this.issues].sort()) lines.push(`  ${category}: ${count}`)
    return lines.join('\n')
  }

  write(dir: string, name: string): string {
    fs.mkdirSync(dir, { recursive: true })
    const file = path.join(dir, `${name}.md`)
    const sections = [...this.issues]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([category, { count, details }]) =>
        [`## ${category} (${count})`, '', ...[...details].map((detail) => `- ${detail}`)].join('\n'),
      )
    const stats = [...this.stats].sort().map(([stat, value]) => `- ${stat}: ${value}`)
    fs.writeFileSync(file, [`# ${name}`, '', '## Stats', '', ...stats, '', ...sections, ''].join('\n'))
    return file
  }
}
