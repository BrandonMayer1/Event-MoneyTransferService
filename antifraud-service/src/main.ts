import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.KAFKA,
      options: {
        client: {
          clientId: 'antifraud-service',
          brokers: ['localhost:9092'],
        },
        consumer: {
          groupId: 'antifraud-consumer',
          allowAutoTopicCreation: true,
        },
        run: {
          autoCommit: true,
        },
      },
    },
  );
  await app.listen();
  logger.log('Antifraud service is running and listening for messages...');
}
bootstrap();
