import {
  Body,
  Controller,
  Get,
  InternalServerErrorException,
  Logger,
  Post,
} from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { BillsService } from './bills.service';
import { PayBillDTO, PayBillResponseDTO } from './dtos/payment';
import { GetBillerItemsResponseDto } from './dtos/item';

@Controller('bills')
@ApiTags('Bills')
export class BillsController {
  private readonly logger = new Logger(BillsController.name);
  constructor(private readonly billsService: BillsService) {}

  @Post('pay')
  @ApiOperation({ summary: 'Pay any bill (airtime, data, TV, electricity)' })
  @ApiBody({ type: PayBillDTO })
  @ApiOkResponse({ type: PayBillResponseDTO })
  async payBill(@Body() dto: PayBillDTO): Promise<PayBillResponseDTO> {
    try {
      const res = await this.billsService.processBillPayment(dto);
      return {
        statusCode: 200,
        message: 'Success',
        data: res,
      };
    } catch (err) {
      this.logger.error('error ', err?.response?.data ?? err);
      throw new InternalServerErrorException('Payment failed');
    }
  }
}
