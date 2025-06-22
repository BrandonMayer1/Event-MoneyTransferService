// src/transaction/transaction.service.ts
import { DataSource } from 'typeorm';
import { Injectable, OnModuleInit, Logger, Inject, InternalServerErrorException } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';

@Injectable()
export class TransactionService implements OnModuleInit{
  private readonly logger = new Logger(TransactionService.name,);

  constructor(
    private dataSource: DataSource,
    @Inject('TRANSACTION_KAFKA_CLIENT') private readonly clientKafka: ClientKafka
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
  

  //Update status which updates in Supabase
  private async updateStatus(transaction: { 
    id: string; 
    status: string 
  }) {
    this.logger.log('Transaction update recieved');
    await this.updateTransactionStatus(transaction.id, transaction.status);
  }


//Creats transaction in the Supabase while also emitting to Kafka on transaction.created
  async createTransaction(data: {accountexternaldebit: string; accountexternalcredit: string; transfertypeid: number; value: number;}) {
    const { accountexternaldebit, accountexternalcredit, transfertypeid, value } = data;

    try {
      const result = await this.dataSource.query(
        `INSERT INTO transactions (accountexternaldebit, accountexternalcredit, transfertypeid, value, status)
         VALUES ($1, $2, $3, $4, 'pending')
         RETURNING *`,
        [accountexternaldebit, accountexternalcredit, transfertypeid, value]
      );

      const transaction = result[0];

      await this.clientKafka.emit('transaction.created', {
        id: transaction.id,
        accountExternalDebit: accountexternaldebit,
        accountExternalCredit: accountexternalcredit,
        value,
      });

      this.logger.log('Transaction created and sent to Kafka');
      return transaction;
    } catch (error) {
      this.logger.error('Failed to create transaction:', error);
      throw new InternalServerErrorException('Failed to create transaction');
    }
  }


//Updates transaction status in supabase via SQL
  async updateTransactionStatus(id: string, status: string) {
    const [updated] = await this.dataSource.query(
      `UPDATE transactions SET status = $1 WHERE id = $2 RETURNING *`,
      [status, id]
    );
    return updated;
  }


  async onModuleDestroy() {
    this.logger.log('Cleaning up transaction service...');
    // The Kafka consumer will be automatically disconnected by the KafkaService
  }
}