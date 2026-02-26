import knex, { Knex } from 'knex';
import { config } from '../../config';
import { logger } from '../../common/utils/logger';

let db: Knex;

export function getDb(): Knex {
  if (!db) {
    db = knex({
      client: 'pg',
      connection: {
        host: config.db.host,
        port: config.db.port,
        database: config.db.database,
        user: config.db.user,
        password: config.db.password,
      },
      pool: {
        min: config.db.pool.min,
        max: config.db.pool.max,
      },
      migrations: {
        directory: __dirname + '/migrations',
        tableName: 'knex_migrations',
        loadExtensions: ['.js'],
      },
      seeds: {
        directory: __dirname + '/seeds',
      },
    });

    logger.info('Database connection pool created');
  }
  return db;
}

export async function closeDb(): Promise<void> {
  if (db) {
    await db.destroy();
    logger.info('Database connection pool destroyed');
  }
}
