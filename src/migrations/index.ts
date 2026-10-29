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
import * as migration_20261027_093710_fill_search_index from './20261027_093710_fill_search_index';
import * as migration_20261028_115541_drop_dark_controls from './20261028_115541_drop_dark_controls';
import * as migration_20261028_130559_project_status from './20261028_130559_project_status';
import * as migration_20261028_132908_drop_ongoing from './20261028_132908_drop_ongoing';
import * as migration_20261028_140538_published_in from './20261028_140538_published_in';
import * as migration_20261028_140604_drop_journal_and_book from './20261028_140604_drop_journal_and_book';
import * as migration_20261028_154216_employee_names from './20261028_154216_employee_names';
import * as migration_20261028_161714_page_timeline_into_content from './20261028_161714_page_timeline_into_content';
import * as migration_20261028_162950_drop_page_timeline from './20261028_162950_drop_page_timeline';
import * as migration_20261029_102100_employee_dates from './20261029_102100_employee_dates';
import * as migration_20261029_111720_drop_joined_year from './20261029_111720_drop_joined_year';
import * as migration_20261029_134843_employee_code from './20261029_134843_employee_code';
import * as migration_20261029_151659_expertise_and_qualifications from './20261029_151659_expertise_and_qualifications';
import * as migration_20261029_152636_drop_qualification from './20261029_152636_drop_qualification';
import * as migration_20261029_154324_employee_external from './20261029_154324_employee_external';

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
    name: '20261026_183223_search_index',
  },
  {
    up: migration_20261027_093710_fill_search_index.up,
    down: migration_20261027_093710_fill_search_index.down,
    name: '20261027_093710_fill_search_index',
  },
  {
    up: migration_20261028_115541_drop_dark_controls.up,
    down: migration_20261028_115541_drop_dark_controls.down,
    name: '20261028_115541_drop_dark_controls',
  },
  {
    up: migration_20261028_130559_project_status.up,
    down: migration_20261028_130559_project_status.down,
    name: '20261028_130559_project_status',
  },
  {
    up: migration_20261028_132908_drop_ongoing.up,
    down: migration_20261028_132908_drop_ongoing.down,
    name: '20261028_132908_drop_ongoing',
  },
  {
    up: migration_20261028_140538_published_in.up,
    down: migration_20261028_140538_published_in.down,
    name: '20261028_140538_published_in',
  },
  {
    up: migration_20261028_140604_drop_journal_and_book.up,
    down: migration_20261028_140604_drop_journal_and_book.down,
    name: '20261028_140604_drop_journal_and_book',
  },
  {
    up: migration_20261028_154216_employee_names.up,
    down: migration_20261028_154216_employee_names.down,
    name: '20261028_154216_employee_names',
  },
  {
    up: migration_20261028_161714_page_timeline_into_content.up,
    down: migration_20261028_161714_page_timeline_into_content.down,
    name: '20261028_161714_page_timeline_into_content',
  },
  {
    up: migration_20261028_162950_drop_page_timeline.up,
    down: migration_20261028_162950_drop_page_timeline.down,
    name: '20261028_162950_drop_page_timeline',
  },
  {
    up: migration_20261029_102100_employee_dates.up,
    down: migration_20261029_102100_employee_dates.down,
    name: '20261029_102100_employee_dates',
  },
  {
    up: migration_20261029_111720_drop_joined_year.up,
    down: migration_20261029_111720_drop_joined_year.down,
    name: '20261029_111720_drop_joined_year',
  },
  {
    up: migration_20261029_134843_employee_code.up,
    down: migration_20261029_134843_employee_code.down,
    name: '20261029_134843_employee_code',
  },
  {
    up: migration_20261029_151659_expertise_and_qualifications.up,
    down: migration_20261029_151659_expertise_and_qualifications.down,
    name: '20261029_151659_expertise_and_qualifications',
  },
  {
    up: migration_20261029_152636_drop_qualification.up,
    down: migration_20261029_152636_drop_qualification.down,
    name: '20261029_152636_drop_qualification',
  },
  {
    up: migration_20261029_154324_employee_external.up,
    down: migration_20261029_154324_employee_external.down,
    name: '20261029_154324_employee_external'
  },
];
