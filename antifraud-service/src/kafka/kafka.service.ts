import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { Kafka, Producer, Consumer } from 'kafkajs';

@Injectable()
export class KafkaService implements OnModuleInit, OnModuleDestroy {
  private kafka: Kafka;
  private producer: Producer;
  private consumer: Consumer;
  private readonly logger = new Logger(KafkaService.name);

  
//makes the producer and consumers
  constructor() {
    this.kafka = new Kafka({
      clientId: 'service',
      brokers: ['localhost:9092'],
    });
    this.producer = this.kafka.producer();
    this.consumer = this.kafka.consumer({ 
      groupId: 'anti-fraud-group'  // For status updates
    });
  }


//connects to consumer/producer on connections
  async onModuleInit() {
    await this.producer.connect();
    await this.consumer.connect();
  }


//Emits to Kafka
  async emit(topic: string, message: any) {
    await this.producer.send({
      topic,
      messages: [{ 
        key: message.id, 
        value: JSON.stringify(message) 
      }],
    });
  }


//Subscribes to topic 
  async subscribe(topic: string, callback: (message: any) => void) {
    this.logger.log(`Subscribing to topic: ${topic}`);
    if (!this.consumer) {
      throw new Error('Consumer not initialized');
    }
    
    await this.consumer.subscribe({ topic, fromBeginning: true });
    await this.consumer.run({
      eachMessage: async ({ message }) => {
        try {
          if(message.value != null)
          callback(JSON.parse(message.value.toString()));
        } catch (err) {
          this.logger.error(`Error processing message from ${topic}`, err);
        }
      },
    });
  }

  async onModuleDestroy() {
    try {
      await this.consumer?.disconnect();
      await this.producer?.disconnect();
    } catch (error) {
      console.error('Error disconnecting Kafka client:', error);
    }
  }
}