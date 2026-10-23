import * as migration_20261019_132856_initial from './20261019_132856_initial';
import * as migration_20261023_101048_jobs_offices from './20261023_101048_jobs_offices';

export const migrations = [
  {
    up: migration_20261019_132856_initial.up,
    down: migration_20261019_132856_initial.down,
    name: '20261019_132856_initial',
  },
  {
    up: migration_20261023_101048_jobs_offices.up,
    down: migration_20261023_101048_jobs_offices.down,
    name: '20261023_101048_jobs_offices'
  },
];
