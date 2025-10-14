import { InputType, Field, Int, ObjectType } from '@nestjs/graphql';
import { IsNotEmpty, IsString, Min, IsNumber } from 'class-validator';

// --------------------
// Input DTO for payBill
// --------------------
@InputType()
export class PayBillGraphQLDTO {
  @Field({
    description:
      'Unique customer identifier (e.g. phone number, meter number, decoder number, etc.)',
  })
  @IsNotEmpty()
  @IsString()
  customerId: string;

  @Field(() => Int, { description: 'Amount in Naira' })
  @IsNotEmpty()
  @IsNumber()
  @Min(50)
  amount: number;

  @Field({ description: 'Unique request reference for this transaction' })
  @IsNotEmpty()
  @IsString()
  requestReference: string;

  @Field({
    description:
      'Payment code for the specific biller product (e.g. MTN Airtime 100, DSTV Compact, Ikeja Prepaid)',
  })
  @IsNotEmpty()
  @IsString()
  paymentCode: string;
}

// --------------------
// Response Data
// --------------------
@ObjectType()
export class PayBillGraphQlResponse {
  @Field()
  customerId: string;

  @Field(() => Int)
  amount: number;

  @Field()
  requestReference: string;

  @Field()
  paymentCode: string;

  @Field()
  transactionRef: string;
}

// --------------------
// Response Wrapper
// --------------------
@ObjectType()
export class PayBillGraphQlResponseDTO {
  @Field(() => Int)
  statusCode: number;

  @Field()
  message: string;

  @Field(() => PayBillGraphQlResponse)
  data: PayBillGraphQlResponse;
}
