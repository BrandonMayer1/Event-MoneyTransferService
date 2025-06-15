// src/anti-fraud/anti-fraud.module.ts
import { Module } from '@nestjs/common';
import { AntiFraudService } from './antifraud.service';
import { KafkaService } from './kafka/kafka.service';

@Module({
  providers: [AntiFraudService, KafkaService],
})
export class AppModule {}