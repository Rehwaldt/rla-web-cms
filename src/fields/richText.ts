import type { CodeField, Field, FieldHook, PayloadRequest, RichTextField } from 'payload'
import {
  FixedToolbarFeature,
  LinkFeature,
  lexicalEditor,
  lexicalHTMLField,
  type SerializedLinkNode,
} from '@payloadcms/richtext-lexical'
import { LinkHTMLConverterAsync } from '@payloadcms/richtext-lexical/html-async'

type Node = { type?: string; children?: Node[] }

// Website paths of internally linked projects, filled for each read just before the HTML is
// generated (the converter itself has no access to the database).
const projectHrefs = new WeakMap<object, string>()

const internalProjectLinks = (node: Node | undefined): SerializedLinkNode[] =>
  !node
    ? []
    : [
        ...(node.type === 'link' && (node as SerializedLinkNode).fields?.linkType === 'internal'
          ? [node as SerializedLinkNode]
          : []),
        ...(node.children ?? []).flatMap(internalProjectLinks),
      ]

/**
 * Looks up the code of every project the rich text links to. The website's URL for a project is
 * /p/{code}; it adds the language itself. Links to projects the reader may not see go nowhere.
 */
async function resolveProjectHrefs(data: { root?: Node } | null | undefined, req: PayloadRequest) {
  const links = internalProjectLinks(data?.root).filter((link) => link.fields.doc?.relationTo === 'projects')
  if (links.length === 0) return
  const idOf = (link: SerializedLinkNode) => {
    const value = link.fields.doc!.value
    return typeof value === 'object' ? (value as { id: number | string }).id : value
  }
  const { docs } = await req.payload.find({
    collection: 'projects',
    where: { id: { in: [...new Set(links.map(idOf))] } },
    select: { code: true },
    depth: 0,
    pagination: false,
    overrideAccess: false,
    req,
  })
  const codes = new Map(docs.map((project) => [String(project.id), project.code]))
  for (const link of links) {
    const code = codes.get(String(idOf(link)))
    projectHrefs.set(link, code ? `/p/${encodeURIComponent(code)}` : '#')
  }
}

const htmlField = (name: string): CodeField => {
  // typed as the generic Field, but it is always a code field
  const field = lexicalHTMLField({
    htmlFieldName: `${name}Html`,
    lexicalFieldName: name,
    converters: ({ defaultConverters }) => ({
      ...defaultConverters,
      ...LinkHTMLConverterAsync({ internalDocToHref: ({ linkNode }) => projectHrefs.get(linkNode) ?? '#' }),
    }),
  }) as CodeField
  const [toHtml] = field.hooks!.afterRead! as FieldHook[]
  return {
    ...field,
    virtual: true,
    hooks: {
      ...field.hooks,
      afterRead: [
        async (args) => {
          await resolveProjectHrefs(args.siblingData?.[name], args.req)
          return toHtml(args)
        },
      ],
    },
  }
}

// Localized rich text with the fixed toolbar — the editor setup every content field uses — plus
// a read-only `{name}Html` twin with the same content as HTML, for the PHP website, which has no
// Lexical renderer. The twin is virtual: computed on read from the sibling field in the requested
// locale (fallback included), never stored. Internal links point at projects only. Spread the
// result into a fields array.
export const richTextField = (
  name: string,
  label: RichTextField['label'],
  overrides: Partial<Omit<RichTextField, 'type' | 'name' | 'label'>> = {},
): Field[] => [
  {
    name,
    label,
    type: 'richText',
    localized: true,
    editor: lexicalEditor({
      features: ({ defaultFeatures }) => [
        ...defaultFeatures.map((feature) =>
          feature.key === 'link' ? LinkFeature({ enabledCollections: ['projects'] }) : feature,
        ),
        FixedToolbarFeature(),
      ],
    }),
    ...overrides,
  },
  htmlField(name),
]
