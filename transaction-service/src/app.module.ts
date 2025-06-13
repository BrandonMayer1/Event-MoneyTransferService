import { Module } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { TransactionController } from './transaction.controller';
import { KafkaService } from './kafka/kafka.service';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

@Module({
  controllers: [TransactionController],
  providers: [
    TransactionService,
    KafkaService,
    {
      provide: DataSource,
      useFactory: () =>
        new DataSource({
          type: 'postgres',
          url: process.env.DATABASE_URL,
        }).initialize(),
    },
  ],
})
export class AppModule {}
