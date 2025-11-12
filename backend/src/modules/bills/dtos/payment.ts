import { ApiProperty } from '@nestjs/swagger';
import { Providers } from '@prisma/client';
import {
  IsNotEmpty,
  IsString,
  Min,
  IsNumber,
  IsOptional,
} from 'class-validator';
import { ApiResponseDto } from 'src/common/dto/response.dto';

export class PayBillDTO {
  @ApiProperty({
    description: 'Unique request reference for this transaction',
    example: '81nzn1277',
  })
  @IsNotEmpty()
  @IsString()
  paymentReference: string;

  @ApiProperty({
    description: 'internal code of the bill',
    example: 'jhash127818',
  })
  @IsNotEmpty()
  @IsString()
  billingItemId: string;

  @ApiProperty({
    description: 'provider to be used for this transaction',
    example: 'VTPASS or INTERSWITCH',
  })
  @IsNotEmpty()
  @IsOptional()
  provider?: Providers;
}

class PayBillResponse {
  @ApiProperty()
  amount: number;

  @ApiProperty()
  paymentRef: string;

  @ApiProperty()
  metadata: Record<string, any>;

  @ApiProperty()
  status: string;
}

export class PayBillResponseDTO extends ApiResponseDto<PayBillResponse> {}
