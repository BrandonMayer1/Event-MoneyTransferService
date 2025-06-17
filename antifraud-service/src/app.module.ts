// src/anti-fraud/anti-fraud.module.ts
import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AntiFraudService } from './antifraud.service';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'KAFKA_SERVICE',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'antifraud-service',
            brokers: ['localhost:9092'],
          },
          consumer: {
            groupId: 'antifraud-consumer-v2',
          },
        },
      },
    ]),
  ],
  providers: [AntiFraudService],
})
export class AppModule {}