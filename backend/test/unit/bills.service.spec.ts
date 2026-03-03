import { Test, TestingModule } from '@nestjs/testing';
import { BillsService } from 'src/modules/bills/bills.service';
import { BillRepository } from 'src/modules/bills/bill.repository';
import { InterSwitchService } from 'src/integration/interswitch/interswitch.service';
import { VTPassService } from 'src/integration/vtpass/vtpass.service';
import { BillPaymentProviderFactory } from 'src/modules/bills/providers/bill-payment-provider.factory';
import { PaymentService } from 'src/modules/payment/payment.service';

describe('BillsService (Unit)', () => {
  let service: BillsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BillsService,
        {
          provide: BillRepository,
          useValue: {},
        },
        {
          provide: BillPaymentProviderFactory,
          useValue: {},
        },
        {
          provide: InterSwitchService,
          useValue: {},
        },
        {
          provide: VTPassService,
          useValue: {},
        },
        {
          provide: PaymentService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<BillsService>(BillsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
