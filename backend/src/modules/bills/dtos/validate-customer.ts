import { Optional } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsString } from 'class-validator';
import { ApiResponseDto } from 'src/common/dto/response.dto';

export class ValidateCustomerDTO {
  @ApiProperty({
    description:
      'Unique customer identifier (e.g. phone number, meter number, decoder number, etc.)',
    example: '08012345678',
  })
  @IsNotEmpty()
  @IsString()
  customerId: string;

  @ApiProperty({
    description: 'Payment code or service id',
    example: '4444 or dstv79',
  })
  @IsNotEmpty()
  @IsString()
  paymentCode: string;

  @ApiProperty({
    description: 'type',
    example: 'prepaid or postpaid',
  })
  @Optional()
  @IsIn(['prepaid', 'postpaid', '', undefined])
  type?: string;

  @ApiProperty({
    description: 'provider',
    example: 'INTERSWITCH or VTPASS',
  })
  @IsNotEmpty()
  @IsIn(['INTERSWITCH', 'VTPASS'])
  provider: string;
}

class ValidateCustomerResponse {
  @ApiProperty()
  BillerId: number;

  @ApiProperty()
  PaymentCode: string;

  @ApiProperty()
  CustomerId: string;

  @ApiProperty()
  ResponseCode: string;

  @ApiProperty()
  FullName: string;

  @ApiProperty()
  Amount: number;

  @ApiProperty()
  AmountType: number;

  @ApiProperty()
  AmountTypeDescription: string;

  @ApiProperty()
  Surcharge: number;
}

export class ValidateCustomerResponseDTO extends ApiResponseDto<ValidateCustomerResponse> {}
