import { postgresAdapter } from '@payloadcms/db-postgres'
import { nestedDocsPlugin } from '@payloadcms/plugin-nested-docs'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { de } from '@payloadcms/translations/languages/de'
import { en } from '@payloadcms/translations/languages/en'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { translations } from './i18n/translations'
import { DEFAULT_LOCALE, LOCALES } from './locales'
import { migrations } from './migrations'

import { Users } from './collections/Users'
import { Media } from './collections/Media'

import { Projects } from './collections/projects/Projects'
import { ProjectCategories } from './collections/projects/ProjectCategories'
import { Topics } from './collections/Topics'

import { News } from './collections/News'
import { NewsCategories } from './collections/NewsCategories'
import { Awards } from './collections/Awards'
import { Publications } from './collections/Publications'
import { PublicationCategories } from './collections/PublicationCategories'
import { Pages } from './collections/Pages'

import { Employees } from './collections/Employees'
import { Expertise } from './collections/Expertise'

import { Offices } from './collections/Offices'
import { Jobs } from './collections/Jobs'

import { Excursions } from './collections/Excursions'
import { Mines } from './collections/Mines'
import { MineFeatures } from './collections/MineFeatures'

import { ProjectGallery } from './globals/ProjectGallery'

import { searchEndpoint } from './search/endpoint'
import { withSearchIndexHooks } from './search/indexer'
import { SearchIndex } from './search/SearchIndex'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    // Editors asked for light mode only; this also hides the theme switch in account settings.
    theme: 'light',
    importMap: {
      baseDir: path.resolve(dirname),
    },
    // Navigation and dashboard show the sections of the user's workspace (src/workspaces.ts).
    components: {
      Nav: '@/components/cms/Workspaces/Nav#WorkspaceNav',
    },
    dashboard: {
      widgets: [
        {
          slug: 'workspace-collections',
          label: { en: 'Collections of the workspace', de: 'Sammlungen des Arbeitsbereichs' },
          Component: '@/components/cms/Workspaces/CollectionCards#WorkspaceCollectionCards',
          minWidth: 'full',
        },
      ],
      defaultLayout: [{ widgetSlug: 'workspace-collections', width: 'full' }],
    },
  },
  // The order here is the order of the admin navigation, within and across groups ("All"
  // workspace); a workspace orders its own sections. The searchable ones keep the site search's
  // index current (src/search).
  collections: withSearchIndexHooks([
    Projects,
    ProjectCategories,
    Pages,
    News,
    NewsCategories,
    Excursions,
    Topics,
    Awards,
    Publications,
    PublicationCategories,
    Employees,
    Expertise,
    Offices,
    Jobs,
    Mines,
    MineFeatures,
    Media,
    Users,
    SearchIndex,
  ]),
  globals: [ProjectGallery],
  endpoints: [searchEndpoint],
  // The admin speaks English and German: the browser's language picks one, users can switch in
  // their account settings, and anyone else gets German. Content locales are separate (below).
  i18n: {
    supportedLanguages: { en, de },
    fallbackLanguage: 'de',
    translations,
  },
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  localization: {
    locales: LOCALES,
    defaultLocale: DEFAULT_LOCALE,
    fallback: true,
  },
  // `pnpm dev` pushes schema changes straight into the dev database. Production never pushes:
  // it runs the migrations in `src/migrations` on startup, so every schema change needs a
  // `pnpm payload migrate:create <name>` before it ships.
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
    prodMigrations: migrations,
  }),
  sharp,
  plugins: [
    nestedDocsPlugin({
      collections: ['project-categories', 'expertise'],
      generateLabel: (_docs, doc) => String(doc.name ?? ''),
    }),
  ],
})
