import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { KafkaService } from './kafka/kafka.service';

@Injectable()
export class TransactionService {
  constructor(
    private dataSource: DataSource,
    private kafkaService: KafkaService,
  ) {}

  async createTransaction(data: {
    accountExternalDebit: string;
    accountExternalCredit: string;
    transferTypeId: number;
    value: number;
  }) {
    const { accountExternalDebit, accountExternalCredit, transferTypeId, value } = data;

    const result = await this.dataSource.query(
      `INSERT INTO transactions 
        (account_external_debit, account_external_credit, transfer_type_id, value, status)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [accountExternalDebit, accountExternalCredit, transferTypeId, value, 'pending'],
    );

    const transaction = result[0];

    // Emit event
    await this.kafkaService.emit('transaction.created', {
      id: transaction.id,
      accountExternalDebit,
      accountExternalCredit,
      value,
    });

    return transaction;
  }

  async updateTransactionStatus(id: string, status: string) {
    const result = await this.dataSource.query(
      `UPDATE transactions SET status = $1 WHERE id = $2 RETURNING *`,
      [status, id],
    );
  
    const updatedTransaction = result[0];
  
  
    return updatedTransaction;
  }
  
}
