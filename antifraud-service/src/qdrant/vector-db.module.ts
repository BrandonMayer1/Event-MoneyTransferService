// src/vector-db/vector-db.module.ts
import { Module } from '@nestjs/common';
import { VectorDBService } from './vector-db.service';

@Module({
  providers: [VectorDBService],
  exports: [VectorDBService],
})
export class VectorDBModule {}
