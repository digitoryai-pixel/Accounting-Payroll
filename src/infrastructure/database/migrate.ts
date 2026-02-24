import { getDb, closeDb } from './connection';
import { logger } from '../../common/utils/logger';

async function migrate() {
  const db = getDb();
  try {
    logger.info('Running database migrations...');
    await db.migrate.latest();
    logger.info('Migrations completed successfully');
  } catch (error) {
    logger.error('Migration failed', { error });
    throw error;
  } finally {
    await closeDb();
  }
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
