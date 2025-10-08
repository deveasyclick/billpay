import { Body, Controller, Post } from '@nestjs/common';
import {
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  CreatePaymentDto,
  CreatePaymentResponseDto,
} from './dtos/create-payment';
import { PaymentService } from './payment.service';

@ApiTags('Payments')
@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('')
  @ApiOperation({
    summary: 'Create a new payment object',
    description:
      'Initializes a payment by creating a object with a unique request reference. The reference will use when collecting payment from user on the frontend.',
  })
  @ApiBody({ type: CreatePaymentDto })
  @ApiOkResponse({
    type: CreatePaymentResponseDto,
    description: 'Payment record created successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid payment parameters' })
  public async createPayment(
    @Body() body: CreatePaymentDto,
  ): Promise<CreatePaymentResponseDto> {
    const { record } = await this.paymentService.createPayment(body);

    // Step 3: Return info to the frontend
    return {
      statusCode: 200,
      message: 'Payment initialized. Redirect customer to checkout.',
      data: record,
    };
  }
}
