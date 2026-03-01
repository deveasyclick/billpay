import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import {
  BillCategory,
  Payment,
  PaymentStatus,
  Prisma,
  Providers,
} from '@prisma/client';
import { InterSwitchService } from 'src/integration/interswitch/interswitch.service';
import type { Customer, PayResponse } from 'src/integration/interswitch/types';
import { VTPassService } from 'src/integration/vtpass/vtpass.service';
import { PaymentService } from 'src/modules/payment/payment.service';
import { BillRepository } from 'src/modules/bills/bill.repository';
import type { PayBillDTO } from 'src/modules/bills/dtos/payment';
import { ValidateCustomerDTO } from 'src/modules/bills/dtos/validate-customer';
import { BillPaymentProviderFactory } from './providers/bill-payment-provider.factory';

@Injectable()
export class BillsService {
  private readonly logger = new Logger(BillsService.name);
  constructor(
    private readonly billRepo: BillRepository,
    private readonly providerFactory: BillPaymentProviderFactory,
    private readonly interswitchService: InterSwitchService,
    private readonly vtpassService: VTPassService,
    private readonly paymentService: PaymentService,
  ) {}

  // async onModuleInit() {
  //   await this.syncPlansToDB();
  // }

  public async processBillPayment({
    billingItemId,
    paymentReference,
    provider,
  }: PayBillDTO): Promise<PayResponse> {
    const billItem = await this.billRepo.findItemById(billingItemId);
    if (!billItem) {
      throw new NotFoundException('Billing item not found!');
    }
    const providers = await this.billRepo.findActiveProviders();
    const providerToUse = provider ?? billItem.provider.name;
    const isValidProvider = providers.find((p) => p.name === providerToUse);
    if (!isValidProvider) {
      throw new BadRequestException(
        `provider ${provider} or ${billItem.provider.name} is not a valid provider for this transaction`,
      );
    }

    // Step 1: find payment object
    const payment = await this.paymentService.findPayment({
      reference: paymentReference,
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    // Step 2: enforce state machine rules
    switch (payment.status) {
      case PaymentStatus.SUCCESS:
        throw new ConflictException('Payment already processed, cannot retry.');
      case PaymentStatus.FAILED:
        throw new ConflictException('Payment already failed, cannot retry.');
      case PaymentStatus.PROCESSING:
      case PaymentStatus.PENDING:
        // continue with processing
        break;
    }

    const fallbackProvider = providers.find(
      (p) => p.name !== providerToUse,
    )?.name;
    const providersToTry = [providerToUse].concat(
      fallbackProvider ? fallbackProvider : [],
    );
    return this.tryProviders(providersToTry, payment, billItem.internalCode);
  }

  private async tryProviders<T>(
    providers: Providers[],
    payment: Payment,
    internalCode,
  ) {
    const items = await this.billRepo.findItemsByInternalCode(internalCode);
    let lastError: any;

    for (const provider of providers) {
      const item = items.find((item) => item.provider.name === provider);
      if (!item) {
        this.logger.warn(
          `Provider ${provider} item not found, skipping bill payment...`,
        );
        lastError = new Error(`Provider ${provider} item not found`);
        continue;
      }

      try {
        this.logger.log(`Attempting payment via ${provider}...`);
        const result = await this.handleBillPayment(item, payment);
        this.logger.log(`✅ Payment successful via ${provider}`);
        return result;
      } catch (err) {
        lastError = err.response?.data ?? err;
        this.logger.warn(`❌ Provider ${provider} failed`, lastError);
      }
    }

    // If we got here, all providers failed
    throw new InternalServerErrorException({
      message: lastError,
      details: lastError,
    });
  }

  private async handleBillPayment(
    item: Prisma.BillingItemGetPayload<{
      include: { provider: true; category: true; biller: true };
    }>,
    payment: Payment,
  ): Promise<PayResponse> {
    this.logger.log(`Attempting payment via ${item.provider.name}...`, {
      paymentCode: item.paymentCode!,
      amount: payment.amount,
      reference: payment.reference,
      biller: item.biller.name,
      category: payment.category,
      plan: payment.plan,
    });

    const providerInstance = this.providerFactory.getProvider(
      item.provider.name,
    );
    return providerInstance.executePayment(item, payment);
  }

  public async findItemById(id: string) {
    return this.billRepo.findItemById(id);
  }

  public async getBillingItems(providerName?: string) {
    const providers = await this.billRepo.findActiveProviders();
    const vtpassProvider = providers.find((p) => p.name === Providers.VTPASS);
    const interswitchProvider = providers.find(
      (p) => p.name === Providers.INTERSWITCH,
    );
    if (!interswitchProvider || !vtpassProvider) {
      throw new BadRequestException('Providers not found');
    }

    if (providerName) {
      let provider = interswitchProvider;
      if (providerName === Providers.VTPASS) {
        provider = vtpassProvider;
      }
      if (!provider) {
        throw new BadRequestException('Provider not found');
      }
      // Fallback to interswitch if provider not found
      return this.billRepo.findItemsByProvider(provider.id);
    }

    return this.billRepo.findItemsByProvider(vtpassProvider.id);
  }

  // TODO: create a script to run this. Currently running it inside onModuleInit. Must run once on app startup
  // TODO: Fix duplicates
  public async syncPlansToDB() {
    // First, ensure providers and categories exist (seed if necessary)
    await this.ensureProvidersAndCategories();

    const [categories, providers] = await Promise.all([
      this.billRepo.findCategories(),
      this.billRepo.findActiveProviders(),
    ]);
    const interswitchProvider = providers.find(
      (p) => p.name === Providers.INTERSWITCH,
    );
    const vtpassProvider = providers.find((p) => p.name === Providers.VTPASS);

    if (!interswitchProvider || !vtpassProvider) {
      this.logger.log('providers not found', { providers });
      throw new Error('Providers not found');
    }
    const interswitchPlans = await this.interswitchService.findPlans();
    const vtPassPlans = await this.vtpassService.getPlans();
    const uniqueBillers = Array.from(
      new Map<string, { name: string; billerId: string }>([
        ...vtPassPlans.map(
          (b) =>
            [b.billerId, { name: b.billerName, billerId: b.billerId }] as const,
        ),
        ...interswitchPlans.map(
          (b) =>
            [b.billerId, { name: b.billerName, billerId: b.billerId }] as const,
        ),
      ]).values(),
    );

    const existingBillers = await this.billRepo.findBillersByIds(
      uniqueBillers.map((b) => b.billerId),
    );

    const existingIds = new Set(existingBillers.map((b) => b.billerId));
    const newBillers = uniqueBillers.filter(
      (b) => !existingIds.has(b.billerId),
    );

    // --- 3️⃣ Insert missing billers in bulk ---
    if (newBillers.length > 0) {
      await this.billRepo.createManyBillers(newBillers);
    }
    // --- 4️⃣ Retrieve all billers for mapping ---
    const allBillers = await this.billRepo.findAllBillers();
    let items: any = [];
    for (const i of interswitchPlans) {
      items.push({
        internalCode: i.internalCode,
        name: i.name,
        paymentCode: i.paymentCode,
        categoryId: categories.find((c) => c.name === i.category)?.id!,
        billerId: allBillers.find((b) => b.billerId === i.billerId)!.id,
        amount: i.amount,
        amountType: i.amountType,
        active: true,
      });
    }

    await this.billRepo.bulkUpsertItems(interswitchProvider.id, items);

    this.logger.log(`${items.length} interswitch items synced successfully`);

    this.logger.log('Syncing vtpass items');

    let vtpassItems: any = [];
    for (const i of vtPassPlans) {
      vtpassItems.push({
        internalCode: i.internalCode,
        name: i.name,
        paymentCode: i.paymentCode,
        categoryId: categories.find((c) => c.name === i.category)?.id!,
        billerId: allBillers.find((b) => b.billerId === i.billerId)!.id,
        amount: i.amount,
        amountType: i.amountType,
        active: true,
        image: i.image,
      });
    }

    await this.billRepo.bulkUpsertItems(vtpassProvider.id, vtpassItems);
    this.logger.log(`${vtpassItems.length} vtpass items synced successfully`);
  }

  private async ensureProvidersAndCategories() {
    this.logger.log('Ensuring providers and categories exist in database');

    const providersData = [
      { name: Providers.INTERSWITCH, isActive: true },
      { name: Providers.VTPASS, isActive: true },
    ];

    const categoriesData = [
      { name: BillCategory.AIRTIME, dynamic: false },
      { name: BillCategory.ELECTRICITY, dynamic: false },
      { name: BillCategory.GAMING, dynamic: false },
      { name: BillCategory.DATA, dynamic: true },
      { name: BillCategory.TV, dynamic: true },
    ];

    await Promise.all([
      this.billRepo.upsertProviders(providersData),
      this.billRepo.upsertCategories(categoriesData),
    ]);

    this.logger.log('Providers and categories seeded successfully');
  }

  public async validateCustomer({
    customerId,
    paymentCode,
    provider,
    type,
  }: ValidateCustomerDTO): Promise<Customer> {
    const providerInstance = this.providerFactory.getProvider(
      (provider as Providers) ?? Providers.INTERSWITCH,
    );
    return providerInstance.validateCustomer(customerId, paymentCode, type);
  }
}
