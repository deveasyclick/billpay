import { HttpService } from '@nestjs/axios';
import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BillCategory, Providers } from '@prisma/client';
import type { BillerItemV2 } from 'src/common/types/billerItem';
import type {
  GetVTPassCategoryResponse,
  GetVTPassServiceResponse,
  GetVTPassVariationsResponse,
  VTPassCustomer,
  VTPassPayPayload,
  VTPassTransactionResponse,
  VTPassValidateCustomerResponse,
  VTPassVerifyCustomerPayload,
  VTPassVerifyMeterNoPayload,
} from 'src/common/types/vtpass';
import type { Config } from 'src/config/configuration';
import { STATIC_BILL_ITEMS } from './vtpass.constants';
import {
  getStaticInternalCode,
  isStaticCategory,
} from 'src/common/utils/getStaticInternalCode';
import { BillerNames } from 'src/common/constants/biller';

@Injectable()
export class VTPassService {
  constructor(
    private readonly config: ConfigService<Config>,
    private readonly httpService: HttpService,
  ) {}

  public async getCategories(): Promise<GetVTPassCategoryResponse> {
    const { data } =
      await this.httpService.axiosRef.get<GetVTPassCategoryResponse>(
        `${this.config.get('vtpassApiBaseUrl')!}/service-categories`,
      );
    if (!data?.response_description || data.response_description !== '000') {
      throw new BadRequestException({
        message: 'Failed to get categories',
        details: data.content,
      });
    }
    return data;
  }
  public async getServices(
    category: string,
  ): Promise<GetVTPassServiceResponse> {
    const { data } =
      await this.httpService.axiosRef.get<GetVTPassServiceResponse>(
        `${this.config.get('vtpassApiBaseUrl')!}/services?identifier=${category}`,
      );
    if (!data?.response_description || data.response_description !== '000') {
      throw new BadRequestException({
        message: 'Failed to get services',
        details: data.content,
      });
    }
    return data;
  }
  public async getServiceVariants(
    serviceId: string,
  ): Promise<GetVTPassVariationsResponse['content']['variations']> {
    const { data } =
      await this.httpService.axiosRef.get<GetVTPassVariationsResponse>(
        `${this.config.get(
          'vtpassApiBaseUrl',
        )!}/service-variations?serviceID=${serviceId}`,
      );
    if (!data?.response_description || data.response_description !== '000') {
      throw new BadRequestException({
        message: 'Failed to get service variations',
        details: data.content,
      });
    }
    return data.content.variations;
  }

  public async getPlans() {
    return (
      await Promise.all([this.getStaticPlans(), this.getDynamicPlans()])
    ).flat();
  }

  // TODO: Setup a cron job for this
  public async getDynamicPlans() {
    const dynamicServices = STATIC_BILL_ITEMS.filter(
      (item) =>
        item.category === BillCategory.DATA ||
        item.category === BillCategory.TV,
    );
    const results = await Promise.allSettled(
      dynamicServices.map(async (service) => {
        const provider = service.providers.find(
          (p) => p.name === Providers.VTPASS,
        );
        if (!provider) return [];

        const variations = await this.getServiceVariants(provider.billerId);
        return variations.map((variant) => ({
          internalCode: this.getInternalCode(
            service.name,
            service.category,
            variant.variation_amount,
          ),
          category: service.category,
          billerName: service.name,
          provider: provider.name,
          billerId: provider.billerId,
          paymentCode: variant.variation_code,
          name: variant.name,
          amount: Number(variant.variation_amount),
          amountType: 0,
          active: true,
          image: service.image,
        }));
      }),
    );

    const items = results
      .filter((r) => r.status === 'fulfilled')
      .flatMap((r) => r.value);
    return items;
  }

  private getStaticPlans() {
    const items: BillerItemV2[] = [];

    // Select only non-dynamic categories (e.g., airtime, electricity, etc.)
    const staticServices = STATIC_BILL_ITEMS.filter(
      (item) =>
        item.category !== BillCategory.DATA &&
        item.category !== BillCategory.TV,
    );

    for (const service of staticServices) {
      const provider = service.providers.find(
        (p) => p.name === Providers.VTPASS,
      );
      if (!provider) continue;

      items.push({
        internalCode: this.getInternalCode(service.name, service.category, 0),
        category: service.category,
        billerName: service.name,
        provider: provider.name,
        billerId: provider.billerId,
        paymentCode:
          service.category === BillCategory.ELECTRICITY
            ? 'prepaid'
            : provider.billerId,
        name: service.name,
        amount: 0, // Amount entered by user (e.g. airtime or electricity)
        amountType: 0, // 1 means variable amount (user-input)
        active: true,
        image: service.image,
      });
    }

    return items;
  }

  public async pay(
    payload: VTPassPayPayload,
  ): Promise<VTPassTransactionResponse['content']['transactions']> {
    const { data } =
      await this.httpService.axiosRef.post<VTPassTransactionResponse>(
        `${this.config.get('vtpassApiBaseUrl')!}/pay`,
        payload,
      );

    if (
      !data?.response_description ||
      (data.code !== '000' && data.code !== '099')
    ) {
      throw new BadRequestException({
        message: `Failed to buy ${payload.serviceID}`,
        description: data.response_description,
        details: JSON.stringify(data.content),
      });
    }
    return data.content.transactions;
  }

  public async getTransaction(
    requestId: string,
  ): Promise<VTPassTransactionResponse['content']['transactions']> {
    const { data } =
      await this.httpService.axiosRef.post<VTPassTransactionResponse>(
        `${this.config.get('vtpassApiBaseUrl')!}/requery`,
        {
          request_id: requestId,
        },
      );
    if (!data?.response_description || data.code !== '000') {
      throw new BadRequestException({
        message: 'Failed to get transaction',
        details: data.content,
      });
    }
    return data.content.transactions;
  }

  public async validateCustomer(
    payload: VTPassVerifyCustomerPayload | VTPassVerifyMeterNoPayload,
  ): Promise<VTPassCustomer> {
    const { data } =
      await this.httpService.axiosRef.post<VTPassValidateCustomerResponse>(
        `${this.config.get('vtpassApiBaseUrl')!}/merchant-verify`,
        payload,
      );
    if (data.code !== '000' || (data.content as { error: string }).error) {
      throw new BadRequestException({
        message: 'Failed to validate customer',
        description: data.response_description,
        details: JSON.stringify(data.content),
      });
    }
    return data.content as VTPassCustomer;
  }

  private getInternalCode(billerName: string, category: BillCategory, amount) {
    const name =
      BillerNames.find((name) => billerName.toLowerCase().includes(name)) ||
      billerName;

    if (isStaticCategory(category)) {
      return getStaticInternalCode(name, category);
    }
    // e.g: mtn-data-amount

    return `${name} ${category} ${Math.round(amount)}`
      .split(' ')
      .join('-')
      .toLowerCase();
  }
}
