import { Controller} from '@nestjs/common';
import { AntiFraudService } from './antifraud.service';
import { EventPattern, Payload } from '@nestjs/microservices';


@Controller('antiFraud')
export class AntiFraudController {
  constructor(private readonly service: AntiFraudService) {}

  @EventPattern('transaction')
  updateStatus(@Payload() data: any) {
    // Handle array format: [id, accountExternalDebit, accountExternalCredit, value, user_id]
    if (Array.isArray(data)) {
      const transactionData = {
        id: data[0],
        accountExternalDebit: data[1],
        accountExternalCredit: data[2],
        value: data[3],
        user_id: data[4]
      };
      return this.service.validateTransaction(transactionData);
    } else {
      console.error('Bad Data', data);
      return;
    }
  }
}