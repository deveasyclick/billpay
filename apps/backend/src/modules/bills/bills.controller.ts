import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { BillsService } from './bills.service';
import { PayBillDTO, PayBillResponseDTO } from './dtos/payment';
import { GetBillerItemsResponseDto } from './dtos/item';

@Controller('bills')
@ApiTags('Bills')
export class BillsController {
  constructor(private readonly billsService: BillsService) {}

  @Post('pay')
  @ApiOperation({ summary: 'Pay any bill (airtime, data, TV, electricity)' })
  @ApiBody({ type: PayBillDTO })
  @ApiOkResponse({ type: PayBillResponseDTO })
  async payBill(@Body() dto: PayBillDTO): Promise<PayBillResponseDTO> {
    const data = await this.billsService.processBillPayment(dto);
    return {
      statusCode: 200,
      message: 'Success',
      data: {
        customerId: dto.customerId,
        amount: dto.amount,
        requestReference: dto.requestReference,
        paymentCode: dto.paymentCode,
        transactionRef: data.pay.TransactionRef,
      },
    };
  }

  @Get('items')
  @ApiOperation({ summary: 'Get all bill items' })
  @ApiOkResponse({ type: GetBillerItemsResponseDto })
  async getItems(): Promise<GetBillerItemsResponseDto> {
    return {
      statusCode: 200,
      message: 'Success',
      data: await this.billsService.fetchAllPlans(),
    };
  }
}
