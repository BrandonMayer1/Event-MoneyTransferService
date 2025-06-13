// src/kafka/kafka.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { Kafka } from 'kafkajs';

@Injectable()
export class KafkaService implements OnModuleInit {
  private kafka;
  private producer;

  async onModuleInit() {
    this.kafka = new Kafka({
      clientId: 'transaction-service',
      brokers: ['localhost:9092'],
    });

    this.producer = this.kafka.producer();
    await this.producer.connect();
  }

  async emit(topic: string, message: any) {
    await this.producer.send({
      topic,
      messages: [
        {
          value: JSON.stringify(message),
        },
      ],
    });
  }
}
