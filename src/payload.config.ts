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

import { Users } from './collections/Users'
import { Media } from './collections/Media'

import { Projects } from './collections/projects/Projects'
import { ProjectCategories } from './collections/projects/ProjectCategories'
import { Topics } from './collections/projects/Topics'

import { News } from './collections/News'
import { Awards } from './collections/Awards'
import { Publications } from './collections/Publications'
import { PublicationCategories } from './collections/PublicationCategories'
import { Jobs } from './collections/Jobs'
import { Pages } from './collections/Pages'

import { Employees } from './collections/Employees'
import { Offices } from './collections/Offices'

import { Mines } from './collections/Mines'
import { MineFeatures } from './collections/MineFeatures'

import { ProjectGallery } from './globals/ProjectGallery'

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
  },
  // The order here is the order of the admin navigation, within and across groups.
  collections: [
    Projects,
    ProjectCategories,
    Pages,
    News,
    Topics,
    Awards,
    Publications,
    PublicationCategories,
    Employees,
    Offices,
    Jobs,
    Mines,
    MineFeatures,
    Media,
    Users,
  ],
  globals: [ProjectGallery],
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
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
  }),
  sharp,
  plugins: [
    nestedDocsPlugin({
      collections: ['project-categories'],
      generateLabel: (_docs, doc) => String(doc.name ?? ''),
    }),
  ],
})
