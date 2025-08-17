import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
    app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        brokers: ['kafka:9092'],
        clientId: 'antifraud-service',
      },
      consumer: {
        groupId: 'antifraud-service-group',
      },
      producer: {
        allowAutoTopicCreation: true,
      },
      subscribe: {
        fromBeginning: true,
      }
    },
  });

  await app.startAllMicroservices();
  await app.listen(3001);
  
  const logger = new Logger('AntiFraudService');
  logger.log('AntiFraud service is running on port 3001');
}
bootstrap();