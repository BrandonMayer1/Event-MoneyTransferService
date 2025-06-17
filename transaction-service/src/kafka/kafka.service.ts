// src/kafka/kafka.service.ts
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Kafka, Producer, Consumer } from 'kafkajs';

@Injectable()
export class KafkaService implements OnModuleInit, OnModuleDestroy {
  private kafka: Kafka;
  private producer: Producer;
  private consumer: Consumer;


//Makes a consumer and a producer
  constructor() {
    this.kafka = new Kafka({
      clientId: 'service',  // Unique client ID
      brokers: ['localhost:9092'],
    });
    this.producer = this.kafka.producer();
    this.consumer = this.kafka.consumer({ 
      groupId: 'approval-consumer'  // For status updates
    });
  }
//When the module starts it connects to both the conusmer and producer
  async onModuleInit() {

    await this.producer.connect();
    await this.consumer.connect();
  }
//Emits to Kafka
  async emit(topic: string, message: any) {
    await this.producer.send({
      topic,
      messages: [{ value: JSON.stringify(message) }],
    });
  }
//Subscribes to kafka
  async subscribe(topic: string, callback: (message: any) => void) {
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