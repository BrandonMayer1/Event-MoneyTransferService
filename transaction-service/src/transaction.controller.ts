import { Controller, Post, Body, Patch, Param } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { EventPattern, Payload } from '@nestjs/microservices';

@Controller('transactions')
export class TransactionController {
  constructor(private readonly service: TransactionService) {}

  @Post()
  create(@Body() body) {
    return this.service.createTransaction(body);
  }

  @EventPattern('transaction.updated')
  updateStatus(@Payload() data: { id: string; status: string }) {
    return this.service.updateTransactionStatus(data.id, data.status);
  }

}
