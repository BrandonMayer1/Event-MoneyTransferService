// src/anti-fraud/anti-fraud.service.ts
import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { KafkaService } from './kafka/kafka.service';

@Injectable()
export class AntiFraudService implements OnModuleInit {
  private readonly logger = new Logger(AntiFraudService.name);

  constructor(private readonly kafkaService: KafkaService) {}
//Subscribes to transaction.created
  async onModuleInit() {
    await this.kafkaService.subscribe(
      'transaction.created',
      this.validateTransaction.bind(this) // Ensure proper 'this' binding
    );
  }

  private async validateTransaction(transaction: { 
    id: string; 
    value: number 
  }) {
    const status = transaction.value < 1000 ? 'approved' : 'rejected';
    
    this.logger.log(
      `Transaction ${transaction.id} validated: ${status} (Value: ${transaction.value})`
    );

    await this.kafkaService.emit('transaction.status.updated', {
      id: transaction.id,
      status,
      processedAt: new Date().toISOString()
    });
  }
}