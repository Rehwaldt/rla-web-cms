import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'

import { News } from './collections/News'
import { Awards } from './collections/Awards'
import { Publications } from './collections/Publications'
import { PublicationCategories } from './collections/PublicationCategories'
import { Jobs } from './collections/Jobs'
import { Themes } from './collections/Themes'
import { Employees } from './collections/Employee'
import { OfficeLocations } from './collections/OfficeLocation'

import { Projects } from './collections/projects/Projects'
import { ProjectCategories } from './collections/projects/ProjectCategories'

import { Mines } from './collections/Mines'
import { MineFeatures } from './collections/MineFeatures'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [
    Users,
    Media,
    News,
    Awards,
    Publications,
    PublicationCategories,
    Jobs,
    Themes,
    Employees,
    OfficeLocations,
    Mines,
    MineFeatures,
    Projects,
    ProjectCategories,
  ],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  localization: {
    locales: [
      {
        label: 'Deutsch',
        code: 'de',
      },
      {
        label: 'English',
        code: 'en',
      },
    ],
    defaultLocale: 'de',
    fallback: true,
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
  }),
  sharp,
  plugins: [],
})
