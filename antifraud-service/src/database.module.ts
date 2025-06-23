import { Module } from '@nestjs/common';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

@Module({
  providers: [
    {
      provide: DataSource,
      useFactory: () =>
        new DataSource({
          type: 'postgres',
          url: process.env.DATABASE_URL,
        }).initialize(),
    },
  ],
  exports: [DataSource],
})
export class DatabaseModule {}
