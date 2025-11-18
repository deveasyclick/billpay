import {
  BadRequestException,
  ConflictException,
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import {
  AttemptStatus,
  BillCategory,
  Payment,
  PaymentStatus,
  Prisma,
  Providers,
} from '@prisma/client';
import { VTPassPayPayload } from 'src/common/types/vtpass';
import { InterSwitchService } from 'src/integration/interswitch/interswitch.service';
import type { Customer, PayResponse } from 'src/integration/interswitch/types';
import { VTPassService } from 'src/integration/vtpass/vtpass.service';
import { PaymentService } from '../payment/payment.service';
import { QueueService } from '../queue/queue.service';
import { BillRepository } from './bill.repository';
import type { PayBillDTO } from './dtos/payment';
import { ValidateCustomerDTO } from './dtos/validate-customer';

@Injectable()
export class BillsService {
  private readonly logger = new Logger(BillsService.name);
  constructor(
    private readonly interswitchService: InterSwitchService,
    @Inject(forwardRef(() => PaymentService))
    private readonly paymentService: PaymentService,
    private readonly billRepo: BillRepository,
    private readonly vtpassService: VTPassService,
    private readonly queueService: QueueService,
  ) {}

  // async onModuleInit() {
  //   await this.syncPlansToDB();
  // }

  private buildVtpassPayload(
    category: BillCategory,
    payment: Pick<Payment, 'reference' | 'customerId' | 'amount' | 'plan'>,
    item: Prisma.BillingItemGetPayload<{
      include: { provider: true; category; biller };
    }>,
  ): VTPassPayPayload {
    const defaultPhoneNumber = '+2348111111111';
    switch (category) {
      case 'AIRTIME':
        return {
          request_id: payment.reference,
          serviceID: item.biller.billerId,
          phone: payment.customerId,
          amount: Number(payment.amount),
        };

      case 'DATA':
        return {
          request_id: payment.reference,
          serviceID: item.biller.billerId,
          phone: payment.customerId,
          variation_code: item.paymentCode!,
          billersCode: defaultPhoneNumber,
        };

      case 'TV':
        return {
          request_id: payment.reference,
          serviceID: item.biller.billerId,
          phone: defaultPhoneNumber,
          variation_code: item.paymentCode!,
          billersCode: payment.customerId,
          subscription_type: 'change',
        };

      case 'ELECTRICITY':
        return {
          request_id: payment.reference,
          serviceID: item.biller.billerId,
          phone: defaultPhoneNumber,
          variation_code: payment.plan!,
          billersCode: payment.customerId,
          amount: Number(payment.amount),
        };

      default:
        throw new BadRequestException(`Unsupported bill category: ${category}`);
    }
  }

  private async payWithVtpass(
    item: Prisma.BillingItemGetPayload<{
      include: { provider: true; category; biller };
    }>,
    payment: Pick<
      Payment,
      'reference' | 'amount' | 'id' | 'customerId' | 'plan'
    >,
  ): Promise<PayResponse> {
    const { category, provider, biller, ...rest } = item;
    const attempt = await this.paymentService.createPaymentAttempt({
      providerId: provider.id,
      requestPayload: JSON.stringify({
        amount: payment.amount,
        billersCode: rest.paymentCode,
        billingItemId: rest.id,
      }),
      paymentId: payment.id,
    });

    try {
      const vtpassPayload: VTPassPayPayload = this.buildVtpassPayload(
        category.name,
        payment,
        item,
      );

      let tx = await this.vtpassService.pay(vtpassPayload);
      await this.paymentService.updatePaymentAttempt(attempt.id, {
        status: AttemptStatus.PENDING_CONFIRMATION,
        responsePayload: JSON.stringify(tx),
      });

      // 🕒 Retry loop for getTransaction
      const maxRetries = 3; // total retries
      const delayMs = 3000; // 3 seconds per retry

      for (let attemptCount = 0; attemptCount < maxRetries; attemptCount++) {
        try {
          if (tx.status === 'delivered') {
            await this.paymentService.updatePaymentAttempt(attempt.id, {
              status: AttemptStatus.SUCCESS,
              responsePayload: JSON.stringify(tx),
            });
            return {
              paymentRef: payment.reference,
              amount: Number(tx.amount),
              status: PaymentStatus.SUCCESS,
              metadata: { rechargePin: (tx as any).extras },
            };
          }

          if (tx.status === 'failed') {
            await this.paymentService.updatePaymentAttempt(attempt.id, {
              status: PaymentStatus.FAILED,
              responsePayload: JSON.stringify(tx),
            });
            throw new Error('vtpass payment attempt failed');
          }

          // Only retry if still pending
          if (tx.status === 'pending') {
            if (attemptCount < maxRetries - 1) {
              await new Promise((resolve) => setTimeout(resolve, delayMs));
              tx = await this.vtpassService.getTransaction(payment.reference);
              continue;
            }
          }

          // Exit loop if status is not pending
          break;
        } catch (err) {
          this.logger.error('Error while trying to confirm payment', err);
        }
      }

      // Keep the status as pending_confirmation if transaction status is unknown so we can retry later
      await this.queueService.addReconciliationJob({
        paymentRef: payment.reference,
        attemptId: attempt.id,
        itemId: item.id,
      });
      return {
        paymentRef: payment.reference,
        amount: Number(payment.amount),
        status: PaymentStatus.PENDING,
        metadata: {
          status: tx.status,
          message: 'Transaction pending confirmation',
        },
      };
    } catch (e) {
      await this.paymentService.updatePaymentAttempt(attempt.id, {
        status: PaymentStatus.FAILED,
        errorMessage: JSON.stringify(e),
      });
      throw e;
    }
  }

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
      const item = items.find((item) => item.name === provider);
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

    if (item.provider.name === Providers.INTERSWITCH) {
      return this.payWithInterswitch(item, payment);
    }

    if (item.provider.name === Providers.VTPASS) {
      return this.payWithVtpass(item, payment);
    }
    throw new BadRequestException(`Unknown provider: ${item.provider.name}`);
  }

  private async payWithInterswitch(
    item: Prisma.BillingItemGetPayload<{
      include: { provider: true; category; biller };
    }>,
    payment: Pick<
      Payment,
      'reference' | 'amount' | 'id' | 'customerId' | 'plan'
    >,
  ): Promise<PayResponse> {
    const { category, provider, biller, ...rest } = item;
    // Step 1: Create payment attempt
    const attempt = await this.paymentService.createPaymentAttempt({
      providerId: provider.id,
      requestPayload: JSON.stringify({
        amount: payment.amount,
        billersCode: rest.paymentCode,
        billingItemId: rest.id,
      }),
      paymentId: payment.id,
    });

    try {
      // Step 3: call provider pay()
      let payResp = await this.interswitchService.pay({
        customerId: payment.customerId,
        paymentCode: item.paymentCode!,
        amount: Number(payment.amount),
        requestReference: payment.reference,
      });
      await this.paymentService.updatePaymentAttempt(attempt.id, {
        status: AttemptStatus.PENDING_CONFIRMATION,
        responsePayload: JSON.stringify(payResp),
      });

      // 🕒 Retry loop for getTransaction
      const maxRetries = 5; // total retries
      const delayMs = 3000; // 3 seconds per retry

      for (let attemptCount = 0; attemptCount < maxRetries; attemptCount++) {
        try {
          if (payResp.ResponseCodeGrouping === 'SUCCESSFUL') {
            await this.paymentService.updatePaymentAttempt(attempt.id, {
              status: AttemptStatus.SUCCESS,
              responsePayload: JSON.stringify(payResp),
            });

            return {
              paymentRef: payment.reference,
              amount: Number(payResp.ApprovedAmount),
              status: PaymentStatus.SUCCESS,
              metadata: payResp.AdditionalInfo,
            };
          }

          if (payResp.ResponseCodeGrouping === PaymentStatus.FAILED) {
            await this.paymentService.updatePaymentAttempt(attempt.id, {
              status: PaymentStatus.FAILED,
              responsePayload: JSON.stringify(payResp),
            });
            throw new Error('interswitch payment attempt failed');
          }

          // Only retry if still pending
          if (payResp.ResponseCodeGrouping === PaymentStatus.PENDING) {
            if (attemptCount < maxRetries - 1) {
              await new Promise((resolve) => setTimeout(resolve, delayMs));
              const confirmedTx =
                await this.interswitchService.confirmTransaction(
                  payment.reference,
                );
              payResp = {
                TransactionRef: confirmedTx.TransactionRef,
                ApprovedAmount: confirmedTx.Amount,
                AdditionalInfo: confirmedTx.BillPayment,
                ResponseCode: confirmedTx.ResponseCode,
                ResponseCodeGrouping: confirmedTx.ResponseCodeGrouping as
                  | 'SUCCESSFUL'
                  | 'FAILED'
                  | 'PENDING',
                ResponseDescription: '',
              };
              continue;
            }
          }

          // Exit loop if status is not pending
          break;
        } catch (err) {
          // confirm transaction throws error if transaction not found
          if (
            err.response?.data?.ResponseCodeGrouping === PaymentStatus.FAILED
          ) {
            await this.paymentService.updatePaymentAttempt(attempt.id, {
              status: PaymentStatus.FAILED,
              responsePayload: JSON.stringify(payResp),
            });
            throw new Error('interswitch payment attempt failed');
          }

          this.logger.error(
            'Interswitch payment confirmation failed',
            err?.response?.data ?? err,
          );
        }
      }

      // Keep the status as pending_confirmation if transaction status is unknown so we can retry later
      await this.queueService.addReconciliationJob({
        paymentRef: payment.reference,
        attemptId: attempt.id,
        itemId: item.id,
      });
      return {
        paymentRef: payment.reference,
        amount: Number(payment.amount),
        status: PaymentStatus.PENDING,
        metadata: {
          status: payResp.ResponseCodeGrouping,
          message: 'Transaction pending confirmation',
        },
      };
    } catch (err) {
      await this.paymentService.updatePaymentAttempt(attempt.id, {
        status: PaymentStatus.FAILED,
      });
      throw err;
    }
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
    if (provider === Providers.VTPASS) {
      const response = await this.vtpassService.validateCustomer({
        billersCode: customerId,
        serviceID: paymentCode,
        ...(type && { type }),
      });
      return {
        TerminalId: '',
        BillerId: 0,
        PaymentCode: paymentCode,
        CustomerId: customerId,
        FullName: response.Customer_Name,
        Amount: response.commission_details.amount ?? 0,
        AmountType: 0,
        AmountTypeDescription: '',
        Surcharge: 0,
        ResponseCode: '000',
      };
    }

    const response = await this.interswitchService.validateCustomer(
      customerId,
      paymentCode,
    );
    return response.Customers?.[0] ?? {};
  }
}
