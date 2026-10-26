import * as migration_20261019_132856_initial from './20261019_132856_initial';
import * as migration_20261023_101048_jobs_offices from './20261023_101048_jobs_offices';
import * as migration_20261023_110058_mines_shared_title from './20261023_110058_mines_shared_title';
import * as migration_20261023_110102_mines_drop_status from './20261023_110102_mines_drop_status';
import * as migration_20261023_110107_mines_import from './20261023_110107_mines_import';
import * as migration_20261023_125833_excursions from './20261023_125833_excursions';
import * as migration_20261026_092652_flow_image_caption from './20261026_092652_flow_image_caption';
import * as migration_20261026_100309_featured_news from './20261026_100309_featured_news';
import * as migration_20261026_100629_drop_flow_news_references from './20261026_100629_drop_flow_news_references';
import * as migration_20261026_101440_featured_projects from './20261026_101440_featured_projects';
import * as migration_20261026_105221_news_images_and_categories from './20261026_105221_news_images_and_categories';
import * as migration_20261026_105245_drop_news_image from './20261026_105245_drop_news_image';
import * as migration_20261026_165113_media_caption from './20261026_165113_media_caption';
import * as migration_20261026_183223_search_index from './20261026_183223_search_index';

export const migrations = [
  {
    up: migration_20261019_132856_initial.up,
    down: migration_20261019_132856_initial.down,
    name: '20261019_132856_initial',
  },
  {
    up: migration_20261023_101048_jobs_offices.up,
    down: migration_20261023_101048_jobs_offices.down,
    name: '20261023_101048_jobs_offices',
  },
  {
    up: migration_20261023_110058_mines_shared_title.up,
    down: migration_20261023_110058_mines_shared_title.down,
    name: '20261023_110058_mines_shared_title',
  },
  {
    up: migration_20261023_110102_mines_drop_status.up,
    down: migration_20261023_110102_mines_drop_status.down,
    name: '20261023_110102_mines_drop_status',
  },
  {
    up: migration_20261023_110107_mines_import.up,
    down: migration_20261023_110107_mines_import.down,
    name: '20261023_110107_mines_import',
  },
  {
    up: migration_20261023_125833_excursions.up,
    down: migration_20261023_125833_excursions.down,
    name: '20261023_125833_excursions',
  },
  {
    up: migration_20261026_092652_flow_image_caption.up,
    down: migration_20261026_092652_flow_image_caption.down,
    name: '20261026_092652_flow_image_caption',
  },
  {
    up: migration_20261026_100309_featured_news.up,
    down: migration_20261026_100309_featured_news.down,
    name: '20261026_100309_featured_news',
  },
  {
    up: migration_20261026_100629_drop_flow_news_references.up,
    down: migration_20261026_100629_drop_flow_news_references.down,
    name: '20261026_100629_drop_flow_news_references',
  },
  {
    up: migration_20261026_101440_featured_projects.up,
    down: migration_20261026_101440_featured_projects.down,
    name: '20261026_101440_featured_projects',
  },
  {
    up: migration_20261026_105221_news_images_and_categories.up,
    down: migration_20261026_105221_news_images_and_categories.down,
    name: '20261026_105221_news_images_and_categories',
  },
  {
    up: migration_20261026_105245_drop_news_image.up,
    down: migration_20261026_105245_drop_news_image.down,
    name: '20261026_105245_drop_news_image',
  },
  {
    up: migration_20261026_165113_media_caption.up,
    down: migration_20261026_165113_media_caption.down,
    name: '20261026_165113_media_caption',
  },
  {
    up: migration_20261026_183223_search_index.up,
    down: migration_20261026_183223_search_index.down,
    name: '20261026_183223_search_index'
  },
];
