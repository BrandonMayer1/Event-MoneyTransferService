import { Injectable, OnModuleInit } from '@nestjs/common';
import { QdrantClient } from '@qdrant/js-client-rest';
import { v4 as uuid } from 'uuid';

@Injectable()
export class VectorDBService implements OnModuleInit {
  private client: QdrantClient;
  private readonly collection = 'transactions';

  constructor() {
    this.client = new QdrantClient({ url: 'http://localhost:6333' });
  }

  async onModuleInit() {
    await this.initCollection(768); 
  }

  async initCollection(vectorSize: number) {
    await this.client.recreateCollection(this.collection, {
      vectors: { size: vectorSize, distance: 'Cosine' },
    });
  }

  async upsertVector(vector: number[], payload: Record<string, any>) {
    const id = uuid();
    await this.client.upsert(this.collection, {
      points: [
        {
          id,
          vector,
          payload,
        },
      ],
    });
  }

  async search(vector: number[], limit = 5) {
    return await this.client.search(this.collection, {
      vector,
      limit,
      with_payload: true,
    });
  }
}