import { ObjectType, Field, Int, Float } from '@nestjs/graphql';

// --------------------
// Nested metadata type
// --------------------
@ObjectType()
export class ProviderMeta {
  @Field()
  providerName: string;

  @Field()
  paymentCode: string;

  @Field()
  consumerIdField: string;

  @Field()
  billerId: string;

  @Field()
  billerCategoryId: string;
}

// --------------------
// Bill item type
// --------------------
@ObjectType()
export class GetItems {
  @Field()
  id: string;

  @Field()
  service: string;

  @Field()
  providerName: string;

  @Field()
  displayName: string;

  @Field(() => Float)
  amount: number;

  @Field(() => Int)
  amountType: number;

  @Field()
  isAmountFixed: boolean;

  @Field(() => [ProviderMeta])
  providerMeta: ProviderMeta[];

  @Field()
  active: boolean;
}

// --------------------
// Response wrapper
// --------------------
@ObjectType()
export class GetBillerItemsGraphQlResponseDto {
  @Field(() => Int)
  statusCode: number;

  @Field()
  message: string;

  @Field(() => [GetItems])
  data: GetItems[];
}
