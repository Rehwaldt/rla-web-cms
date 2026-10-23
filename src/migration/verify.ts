import 'dotenv/config'
import { getPayload } from 'payload'
import configPromise from '../payload.config'

// Spot-checks an import: counts, anonymous visibility, and one fully populated sample project.
//   pnpm tsx src/migration/verify.ts [projectCode]
async function main() {
  const payload = await getPayload({ config: await configPromise })
  const code = process.argv[2] ?? 'BUG'

  const collections = ['projects', 'topics', 'news', 'awards', 'publications', 'jobs', 'pages', 'employees', 'offices', 'media', 'mines', 'mine-features'] as const
  for (const collection of collections) {
    const all = await payload.count({ collection, overrideAccess: true })
    const anonymous = await payload.count({ collection, overrideAccess: false })
    console.log(`${collection}: ${all.totalDocs} total, ${anonymous.totalDocs} visible to anonymous visitors`)
  }

  for (const locale of ['de', 'en'] as const) {
    const { docs } = await payload.find({
      collection: 'projects',
      where: { code: { equals: code } },
      locale,
      depth: 1,
      overrideAccess: false,
    })
    const project = docs[0] as unknown as Record<string, unknown> | undefined
    if (!project) {
      console.log(`\nProject ${code} [${locale}]: not found`)
      continue
    }
    const flow = (project.flow as { blockType: string; title?: string }[]) ?? []
    console.log(`\nProject ${code} [${locale}]:`, {
      name: project.name,
      type: project.type,
      completionYear: project.completionYear,
      place: project.place,
      country: project.country,
      categories: (project.categories as { name: string }[]).map((c) => c.name),
      heroImage: (project.heroImage as { url?: string } | null)?.url,
      flow: flow.map((block) => block.blockType + (block.title ? `("${block.title}")` : '')).join(', '),
      links: (project.links as { kind: string; label?: string; url?: string }[])?.map((l) => `${l.kind}:${l.label ?? l.url}`),
      similar: (project.similarProjects as { code?: string }[])?.map((p) => p.code),
      listedAsSimilarBy: ((project.listedAsSimilarBy as { docs?: { code?: string }[] })?.docs ?? []).map((p) => p.code),
      visibleIn: project.visibleIn,
    })
  }

  const gallery = await payload.findGlobal({ slug: 'project-gallery', locale: 'de', depth: 0 })
  console.log(`\nGallery [de]: ${(gallery.projects as unknown[] | undefined)?.length ?? 0} projects`)

  const categories = await payload.find({ collection: 'project-categories', depth: 0, limit: 3, sort: '_order' })
  console.log('Categories:', categories.docs.map((c) => `${c.name} (column ${c.menuColumn ?? '-'}, parent ${c.parent ?? '-'})`))
  process.exit(0)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
