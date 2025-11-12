import { ApiProperty } from '@nestjs/swagger';
import type { Biller, BillingProvider } from '@prisma/client';
import { ApiResponseDto } from 'src/common/dto/response.dto';

class GetBillingItems {
  @ApiProperty({
    description: 'Unique identifier for this bill item',
  })
  id: string;

  @ApiProperty({
    description: 'Biller amount',
    example: 500,
  })
  amount: number;

  @ApiProperty({
    description: 'Biller amount type',
    example: 0,
  })
  amountType: number;

  @ApiProperty({
    description: 'Biller name',
    example: 0,
  })
  biller: Biller;

  @ApiProperty()
  provider: BillingProvider;

  @ApiProperty()
  name: string;

  @ApiProperty()
  internalCode: string;

  @ApiProperty()
  category: string;

  @ApiProperty()
  paymentCode: string;
}

export class GetBillingItemsResponseDto extends ApiResponseDto<
  GetBillingItems[]
> {}
