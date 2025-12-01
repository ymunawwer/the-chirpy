import mongoose from 'mongoose';
import config from '../config/config';
import logger from '../modules/logger/logger';
import { createAcharyaConsumer } from '../modules/acharya/acharya.kafka';
import { executeWorkflow } from '../modules/acharya/acharya.service';

const start = async () => {
  try {
    await mongoose.connect(config.mongoose.url);
    logger.info('Acharya worker connected to MongoDB');

    const consumer = await createAcharyaConsumer('acharya-execute-group');

    if (!consumer) {
      logger.warn('Kafka is not configured; Acharya worker will not consume messages');
      return;
    }

    await consumer.run({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      eachMessage: async (args: any) => {
        const { message } = args;
        if (!message?.value) return;
        try {
          const payload = JSON.parse(message.value.toString()) as {
            to: string;
            data?: string;
            agentId: string;
            logId?: string;
          };
          await executeWorkflow(payload as any);
        } catch (err) {
          logger.error(`Failed to process Acharya message: ${(err as Error).message}`);
        }
      },
    });

    logger.info('Acharya worker started and listening for messages');
  } catch (err) {
    logger.error(`Acharya worker failed to start: ${(err as Error).message}`);
    process.exit(1);
  }
};

start();
