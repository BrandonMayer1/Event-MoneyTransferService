import { Injectable, OnModuleInit, OnModuleDestroy, Logger, Inject } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { GeminiService } from './gemini/gemini.service';

@Injectable()
export class AntiFraudService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(AntiFraudService.name);

  constructor(
    @Inject('TRANSACTION_KAFKA_CLIENT') private readonly clientKafka: ClientKafka,
    private readonly geminiService: GeminiService
  ) {}


  async onModuleInit() {
    try {
      await this.clientKafka.connect();
      this.logger.log('Connected to Kafka');
    } catch (error) {
      this.logger.error('Failed to connect to Kafka:', error);
      throw error;
    }
  }


  //Validates transaction
  async validateTransaction(transaction: { 
    id: string; 
    accountExternalDebit: string;
    accountExternalCredit: string;
    value: number 
  }) {
    console.log('AntiFraud Service received transaction:', JSON.stringify(transaction));
    
    const isUnderThousand = await this.geminiService.checkUnderThousand(transaction.value);
    const status = isUnderThousand ? 'REJECTED' : 'APPROVED'; //Checker VIA AI if over 1000
    
    this.logger.log(
      `Transaction ${transaction.id} validated: ${status} (Value: ${transaction.value})`
    );

    await this.clientKafka.emit('transaction.updated', {
      id: transaction.id,
      status
    });
  }

  async onModuleDestroy() {
    this.logger.log('Cleaning up antifraud service...');
    try {
      await this.clientKafka.close();
      this.logger.log('Kafka client disconnected successfully');
    } catch (error) {
      this.logger.error('Error disconnecting Kafka client:', error);
    }
  }
}