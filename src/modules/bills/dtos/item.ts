import { ApiProperty } from '@nestjs/swagger';
import { ApiResponseDto } from 'src/common/dto/response.dto';

class GetItems {
  @ApiProperty({
    description: 'Unique identifier for this bill item',
  })
  id: string;

  @ApiProperty({
    description: 'Biller service name',
    example: 'DATA',
  })
  service: string;

  @ApiProperty({
    description: 'Biller name',
    example: 'MTN Data Bundles',
  })
  providerName: string;

  @ApiProperty({
    description: 'Biller display name',
    example: '1GB (valid for 1 month) #1',
  })
  displayName: string;

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
    description: 'Biller is amount fixed',
    example: true,
  })
  isAmountFixed: boolean;

  @ApiProperty({
    description: 'Biller metadata',
    example: [
      {
        providerName: 'interswitch',
        paymentCode: '4444',
        consumerIdField: 'Meter No',
        billerId: 'BILLER1234',
        billerCategoryId: 'BILLER5678',
      },
    ],
  })
  providerMeta: {
    providerName: string;
    paymentCode: string;
    consumerIdField: string;
    billerId: string;
    billerCategoryId: string;
  }[];

  @ApiProperty({
    description: 'Biller is active',
    example: true,
  })
  active: boolean;
}

export class GetBillerItemsResponseDto extends ApiResponseDto<GetItems[]> {}
