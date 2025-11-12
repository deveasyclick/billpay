import {
  Body,
  Controller,
  Get,
  InternalServerErrorException,
  Logger,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { BillsService } from './bills.service';
import { PayBillDTO, PayBillResponseDTO } from './dtos/payment';
import { GetBillingItemsResponseDto } from './dtos/item';
import { cast } from 'src/common/utils/cast';

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

  @Get('items')
  @ApiOperation({ summary: 'Get all billing items' })
  @ApiOkResponse({ type: GetBillingItemsResponseDto })
  @ApiQuery({ name: 'provider', required: false, type: String })
  private async getItems(
    @Query('provider') provider?: string,
  ): Promise<GetBillingItemsResponseDto> {
    const res = await this.billsService.getBillingItems(provider);
    return {
      statusCode: 200,
      message: 'Success',
      data: res.map((i) => ({
        id: i.id,
        amount: cast<number>(i.amount),
        amountType: i.amountType || 0,
        biller: i.biller,
        provider: i.provider,
        name: i.name,
        internalCode: i.internalCode,
        category: i.category.name,
        paymentCode: i.paymentCode!,
        image: i.image,
      })),
    };
  }
}
