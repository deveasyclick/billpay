import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Min, IsNumber } from 'class-validator';
import { ApiResponseDto } from 'src/common/dto/response.dto';

export class PayBillDTO {
  @ApiProperty({
    description:
      'Unique customer identifier (e.g. phone number, meter number, decoder number, etc.)',
    example: '08012345678',
  })
  @IsNotEmpty()
  @IsString()
  customerId: string;

  @ApiProperty({
    description: 'Amount in Naira',
    example: 500,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(50)
  amount: number;

  @ApiProperty({
    description: 'Unique request reference for this transaction',
    example: '81nzn1277',
  })
  @IsNotEmpty()
  @IsString()
  requestReference: string;

  @ApiProperty({
    description:
      'Payment code for the specific biller product (e.g. MTN Airtime 100, DSTV Compact, Ikeja Prepaid)',
    example: '4444',
  })
  @IsNotEmpty()
  @IsString()
  paymentCode: string;
}

class PayBillResponse {
  @ApiProperty()
  customerId: string;

  @ApiProperty()
  amount: number;

  @ApiProperty()
  requestReference: string;

  @ApiProperty()
  paymentCode: string;

  @ApiProperty()
  transactionRef: string;
}

export class PayBillResponseDTO extends ApiResponseDto<PayBillResponse> {}
