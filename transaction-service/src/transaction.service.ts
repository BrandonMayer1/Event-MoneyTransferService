import { DataSource } from 'typeorm';
import { Injectable, OnModuleInit, OnModuleDestroy, Logger, Inject, InternalServerErrorException } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';

@Injectable()
export class TransactionService implements OnModuleInit, OnModuleDestroy{
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
  

  //Creats transaction in the Supabase while also emitting to Kafka on transaction.created
  async createTransaction(data: {accountexternaldebit: string; accountexternalcredit: string; transfertypeid: number; value: number; user_id: string;}) {
    const { accountexternaldebit, accountexternalcredit, transfertypeid, value, user_id } = data;

    try {
      const result = await this.dataSource.query(
        `INSERT INTO transactions (accountexternaldebit, accountexternalcredit, transfertypeid, value, status, user_id, created_at)
         VALUES ($1, $2, $3, $4, 'pending', $5, NOW())
         RETURNING *`,
        [accountexternaldebit, accountexternalcredit, transfertypeid, value, user_id]
      );

      const transaction = result[0];

      const kafkaData = {
        id: transaction.id,
        accountExternalDebit: accountexternaldebit,
        accountExternalCredit: accountexternalcredit,
        value,
        user_id,
      };

      this.logger.log(`Sending to Kafka: ${JSON.stringify(kafkaData)}`);
      
      await this.clientKafka.emit('transaction', [transaction.id, accountexternaldebit, accountexternalcredit, value, user_id]);

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
    this.logger.log(`Transaction ${id} update logged and updated as ${status} in database`);
    return updated;
  }


  async onModuleDestroy() {
    this.logger.log('Cleaning up transaction service...');
    try {
      await this.clientKafka.close();
      this.logger.log('Kafka client disconnected successfully');
    } catch (error) {
      this.logger.error('Error disconnecting Kafka client:', error);
    }
  }
}