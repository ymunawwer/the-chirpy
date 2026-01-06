import mongoose from 'mongoose';
import config from '../config/config';
import logger from '../modules/logger/logger';
import { executeDueEvents } from '../modules/eventExecutor/eventExecutor.service';

const INTERVAL_MS = 60_000; // 1 minute

const start = async () => {
  try {
    await mongoose.connect(config.mongoose.url);
    logger.info('Events worker connected to MongoDB');

    setInterval(async () => {
      try {
        const { success, failed } = await executeDueEvents(new Date());
        if (success.length || failed.length) {
          logger.info(
            `Events worker: executed ${success.length} event(s), ${failed.length} failed`
          );
        }
      } catch (err) {
        logger.error(`Events worker tick failed: ${(err as Error).message}`);
      }
    }, INTERVAL_MS);

    logger.info('Events worker started and scheduling loop initialized');
  } catch (err) {
    logger.error(`Events worker failed to start: ${(err as Error).message}`);
    process.exit(1);
  }
};

start();
