import { Kafka, Producer, Consumer, logLevel } from 'kafkajs';
import config from '../../config/config';

const brokers = config.kafka?.brokers;

if (!brokers || brokers.length === 0) {
  // eslint-disable-next-line no-console
  console.warn('Kafka brokers are not configured (KAFKA_BROKERS). Acharya Kafka integration will be disabled.');
}

const kafka = brokers && brokers.length > 0
  ? new Kafka({
      clientId: 'the-chirpy-acharya',
      brokers,
      logLevel: logLevel.ERROR,
    })
  : null;

export const acharyaExecuteTopic = config.kafka?.acharyaExecuteTopic || 'acharya-execute';

let producer: Producer | null = null;

export const getAcharyaProducer = async (): Promise<Producer | null> => {
  if (!kafka) return null;
  if (!producer) {
    producer = kafka.producer();
    await producer.connect();
  }
  return producer;
};

export const createAcharyaConsumer = async (groupId: string): Promise<Consumer | null> => {
  if (!kafka) return null;
  const consumer = kafka.consumer({ groupId });
  await consumer.connect();
  await consumer.subscribe({ topic: acharyaExecuteTopic, fromBeginning: false });
  return consumer;
};
