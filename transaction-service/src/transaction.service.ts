// src/transaction/transaction.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { KafkaService } from './kafka/kafka.service';

@Injectable()
export class TransactionService {
  private readonly logger = new Logger(TransactionService.name);

  constructor(
    private dataSource: DataSource,
    private kafkaService: KafkaService,
  ) {}
//When starts it listens to see if any transaction is updated by the antifraud
  async onModuleInit() {
    await this.kafkaService.subscribe(
      'transaction.status.updated',
      this.updateStatus.bind(this) 
    );
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

    const result = await this.dataSource.query(
      `INSERT INTO transactions (accountexternaldebit, accountexternalcredit, transfertypeid, value, status)
       VALUES ($1, $2, $3, $4, 'pending')
       RETURNING *`,
      [accountexternaldebit, accountexternalcredit, transfertypeid, value]
    );

    const transaction = result[0];

    await this.kafkaService.emit('transaction.created', {
      id: transaction.id,
      accountExternalDebit: accountexternaldebit,
      accountExternalCredit: accountexternalcredit,
      value,
    });

    this.logger.log('Transaction created and sent to Kafka');
    return transaction;
  }
//Updates transaction status in supabase via SQL
  async updateTransactionStatus(id: string, status: string) {
    const [updated] = await this.dataSource.query(
      `UPDATE transactions SET status = $1 WHERE id = $2 RETURNING *`,
      [status, id]
    );
    return updated;
  }
}