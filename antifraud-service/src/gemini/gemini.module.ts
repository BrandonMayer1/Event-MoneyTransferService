import { Module } from '@nestjs/common';
import { GeminiController } from './gemini.controller';
import { GeminiService } from './gemini.service';
import { VectorDBService } from '../qdrant/vector-db.service';

@Module({
  controllers: [GeminiController],
  providers: [GeminiService, VectorDBService],
  exports: [GeminiService]
})
export class GeminiModule {}
