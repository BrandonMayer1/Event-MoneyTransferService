import { Module } from '@nestjs/common';
import { AntiFraudService } from './antifraud.service';
import { GeminiModule } from './gemini/gemini.module';
import { ConfigModule } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AntiFraudController } from './antifraud.controller';
import { DatabaseModule } from './database.module';

@Module({
  imports: [
    GeminiModule, 
    ConfigModule.forRoot({isGlobal:true}),
    DatabaseModule,
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
            groupId: 'antifraud-service-group',
          }
        },
      },
    ]),

  ],
  controllers: [AntiFraudController],
  providers: [AntiFraudService],
  exports: [],
})
export class AppModule {}