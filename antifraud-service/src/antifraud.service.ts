import { Injectable, Logger, Inject, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { MessagePattern, Payload, ClientKafka } from '@nestjs/microservices';

@Injectable()
export class AntiFraudService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(AntiFraudService.name);

  constructor(
    @Inject('KAFKA_SERVICE') private readonly kafkaClient: ClientKafka,
  ) {}

  async onModuleInit() {
    this.logger.log('Connecting to Kafka...');
    await this.kafkaClient.connect();
    this.logger.log('Subscribing to transaction.created topic...');
    this.kafkaClient.subscribeToResponseOf('transaction.created');
  }

  @MessagePattern('transaction.created')
  async validateTransaction(@Payload() message: any) {
    this.logger.log(`✅ Received transaction: ${JSON.stringify(message)}`);

    const transaction = message.value || message;
    const status = transaction.value < 1000 ? 'approved' : 'rejected';

    this.logger.log(
      `Transaction ${transaction.id} validated: ${status} (Value: ${transaction.value})`
    );

    await this.kafkaClient.emit('transaction.status.updated', {
      id: transaction.id,
      status,
      processedAt: new Date().toISOString(),
    });
  }

  async onModuleDestroy() {
    await this.kafkaClient.close();
  }
}
