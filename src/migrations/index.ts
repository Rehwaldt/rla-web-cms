import * as migration_20261019_132856_initial from './20261019_132856_initial';
import * as migration_20261023_101048_jobs_offices from './20261023_101048_jobs_offices';
import * as migration_20261023_110058_mines_shared_title from './20261023_110058_mines_shared_title';
import * as migration_20261023_110102_mines_drop_status from './20261023_110102_mines_drop_status';
import * as migration_20261023_110107_mines_import from './20261023_110107_mines_import';

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
    name: '20261023_110107_mines_import'
  },
];
