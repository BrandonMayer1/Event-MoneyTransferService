import { Injectable, OnModuleInit, OnModuleDestroy, Logger, Inject } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { DataSource } from 'typeorm';
import { GeminiService } from './gemini/gemini.service';

@Injectable()
export class AntiFraudService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(AntiFraudService.name);

  constructor(
    @Inject('TRANSACTION_KAFKA_CLIENT') private readonly clientKafka: ClientKafka,
    private readonly dataSource: DataSource,
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
    value: number;
    user_id: string;
  }) {
    //Gets all users transactions
    console.log('AntiFraud Service received transaction:', JSON.stringify(transaction));
    const result = await this.dataSource.query(
      `SELECT id, accountexternaldebit, accountexternalcredit, transfertypeid, value, status, created_at
       FROM transactions
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [transaction.user_id]
    );
    const incomingTransaction = `User ${transaction.user_id} transferred $${transaction.value} with accounts ${transaction.accountExternalDebit} and ${transaction.accountExternalCredit}`;
    const isFlagged = await this.geminiService.antiFraudChecker(incomingTransaction);
    const status = isFlagged ? 'REJECTED' : 'APPROVED'; 

    //add to vectorized DB
    await this.geminiService.addTransactionToVectorDB(incomingTransaction, {
      user_id: transaction.user_id,
      accountexternaldebit: transaction.accountExternalDebit,
      accountexternalcredit: transaction.accountExternalCredit,
      value: transaction.value,
      status,
      original: incomingTransaction,
    });

    this.logger.log(
      `Transaction ${transaction.id} for user ${transaction.user_id} validated: ${status} (Value: ${transaction.value})`
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