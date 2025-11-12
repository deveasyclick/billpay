import { ApiProperty } from '@nestjs/swagger';
import { BillCategory } from '@prisma/client';
import { ApiResponseDto } from 'src/common/dto/response.dto';

class CreatePaymentDto {
  @ApiProperty({
    description: 'meter no, phone number, smarcard no, etc.',
  })
  customerId: string;

  @ApiProperty({
    description: 'AIRTIME, DATA, TV, ELECTRICITY, GAMING',
  })
  category: BillCategory;

  @ApiProperty()
  amount: number; // in naira

  @ApiProperty()
  billingItemId: string; // e.g., 'MTN-DATA-1000'

  @ApiProperty({
    description: 'plan/package for electricity, data or tv',
  })
  plan?: string; // e.g., 'airtime-data-1gb', 'postppaid'
}

class CreatePaymentResponse {
  @ApiProperty()
  paymentReference: string;

  @ApiProperty()
  id: string;

  @ApiProperty()
  amount: number;

  @ApiProperty()
  customerId: string;

  @ApiProperty()
  internalCode: string;
}

class CreatePaymentResponseDto extends ApiResponseDto<CreatePaymentResponse> {}

export { CreatePaymentDto, CreatePaymentResponseDto };
