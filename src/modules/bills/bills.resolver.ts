import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { Logger, InternalServerErrorException } from '@nestjs/common';
import { BillsService } from './bills.service';
import { GetBillerItemsGraphQlResponseDto } from './dtos/item.dto.graphql';
import {
  PayBillGraphQlResponseDTO,
  type PayBillGraphQLDTO,
} from './dtos/payment.dto.graphql';

@Resolver()
export class BillsResolver {
  private readonly logger = new Logger(BillsResolver.name);

  constructor(private readonly billsService: BillsService) {}

  @Mutation(() => PayBillGraphQlResponseDTO, { name: 'payBill' })
  public async payBill(
    @Args('input') dto: PayBillGraphQLDTO,
  ): Promise<PayBillGraphQlResponseDTO> {
    try {
      const res = await this.billsService.processBillPayment(dto);

      return {
        statusCode: 200,
        message: 'Success',
        data: {
          customerId: dto.customerId,
          amount: dto.amount,
          requestReference: dto.requestReference,
          paymentCode: dto.paymentCode,
          transactionRef: res.data.TransactionRef ?? '',
        },
      };
    } catch (err) {
      this.logger.error('error ', err?.response?.data ?? err);
      throw new InternalServerErrorException('Payment failed');
    }
  }

  @Query(() => GetBillerItemsGraphQlResponseDto, { name: 'getBillItems' })
  public async getItems(): Promise<GetBillerItemsGraphQlResponseDto> {
    return {
      statusCode: 200,
      message: 'Success',
      data: await this.billsService.fetchAllPlans(),
    };
  }
}
