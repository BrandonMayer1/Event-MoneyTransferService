import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { KafkaService } from './kafka/kafka.service';
import { GeminiService } from './gemini/gemini.service';

@Injectable()
export class AntiFraudService implements OnModuleInit {
  private readonly logger = new Logger(AntiFraudService.name);

  constructor(
    private readonly kafkaService: KafkaService,
    private readonly geminiService: GeminiService
  ) {}


//Subscribes to transaction.created
  async onModuleInit() {
    await this.kafkaService.subscribe(
      'transaction.created',
      this.validateTransaction.bind(this) 
    );
  }


  //Validates transaction
  private async validateTransaction(transaction: { 
    id: string; 
    value: number 
  }) {
    const isUnderThousand = await this.geminiService.checkUnderThousand(transaction.value);
    const status = isUnderThousand ? 'REJECTED' : 'APPROVED'; //Checker VIA AI if over 1000
    
    this.logger.log(
      `Transaction ${transaction.id} validated: ${status} (Value: ${transaction.value})`
    );

    await this.kafkaService.emit('transaction.status.updated', {
      id: transaction.id,
      status,
      processedAt: new Date().toISOString()
    });
  }

  async onModuleDestroy() {
    this.logger.log('Cleaning up transaction service...');
    // The Kafka consumer will be automatically disconnected by the KafkaService
  }
}