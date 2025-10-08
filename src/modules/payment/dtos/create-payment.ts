import { ApiProperty } from '@nestjs/swagger';
import { ApiResponseDto } from 'src/common/dto/response.dto';

class CreatePaymentDto {
  customerId: string;
  amount: number; // in naira
  paymentCode: string; // e.g., 'MTN-DATA-1000'
  metadata?: Record<string, any>;
}

class CreatePaymentResponse {
  @ApiProperty()
  requestReference: string;

  @ApiProperty()
  id: string;

  @ApiProperty()
  amount: number;

  @ApiProperty()
  customerId: string;

  @ApiProperty()
  paymentCode: string;
}

class CreatePaymentResponseDto extends ApiResponseDto<CreatePaymentResponse> {}

export { CreatePaymentDto, CreatePaymentResponseDto };
