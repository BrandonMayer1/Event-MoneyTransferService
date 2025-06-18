import { Module } from '@nestjs/common';
import { AntiFraudService } from './antifraud.service';
import { KafkaService } from './kafka/kafka.service';
import { GeminiModule } from './gemini/gemini.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [GeminiModule, ConfigModule.forRoot({isGlobal:true})],
  providers: [AntiFraudService, KafkaService],
})
export class AppModule {}