import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { DatabaseModule } from './database.module'; 
import { TransactionController } from './transaction.controller';
import { TransactionService } from './transaction.service';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'TRANSACTION_KAFKA_CLIENT',
        transport: Transport.KAFKA,
        options: {
          client: {
            brokers: ['localhost:9092'],
          },
          producer: {
            allowAutoTopicCreation: true,
          },
          consumer: {
            groupId: 'transaction-service-group',
          }
        },
      },
    ]),
    
    DatabaseModule,
  ],
  controllers: [TransactionController],
  providers: [TransactionService],
  exports: [],
})
export class AppModule {}