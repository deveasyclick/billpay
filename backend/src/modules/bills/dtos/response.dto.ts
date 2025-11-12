import { ApiProperty } from '@nestjs/swagger';

export class PaymentItemDto {
  @ApiProperty() Id: string;
  @ApiProperty() Name: string;
  @ApiProperty() BillerName: string;
  @ApiProperty() ConsumerIdField: string;
  @ApiProperty() BillerType: string;
  @ApiProperty() ItemFee: string;
  @ApiProperty() Amount: string;
  @ApiProperty() BillerId: string;
  @ApiProperty() BillerCategoryId: string;
  @ApiProperty() CurrencyCode: string;
  @ApiProperty() CurrencySymbol: string;
  @ApiProperty() IsAmountFixed: boolean;
  @ApiProperty() PaymentCode: string;
  @ApiProperty() AmountType: number;
  @ApiProperty() PaydirectItemCode: string;
}

export class BaseResponseDto<T> {
  @ApiProperty({ example: 200 })
  statusCode: number;

  @ApiProperty({ example: 'Success' })
  message: string;
}

export class GetAirtimeProvidersResponseDto extends BaseResponseDto<
  PaymentItemDto[]
> {
  @ApiProperty({ type: [PaymentItemDto] })
  data: PaymentItemDto[];
}

export class GetDataPlansResponseDto extends BaseResponseDto<PaymentItemDto[]> {
  @ApiProperty({ type: [PaymentItemDto] })
  data: PaymentItemDto[];
}

export class GetTvPlansResponseDto extends BaseResponseDto<PaymentItemDto[]> {
  @ApiProperty({ type: [PaymentItemDto] })
  data: PaymentItemDto[];
}

export class GetElectricityProvidersResponseDto extends BaseResponseDto<
  PaymentItemDto[]
> {
  @ApiProperty({ type: [PaymentItemDto] })
  data: PaymentItemDto[];
}
