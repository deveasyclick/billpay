import { Injectable, BadRequestException } from '@nestjs/common';
import { Providers } from '@prisma/client';
import { InterswitchProvider } from './interswitch.provider';
import { VTPassProvider } from './vtpass.provider';
import type { IBillPaymentProvider } from 'src/common/interfaces/bill-payment-provider.interface';

@Injectable()
export class BillPaymentProviderFactory {
  constructor(
    private readonly interswitchProvider: InterswitchProvider,
    private readonly vtpassProvider: VTPassProvider,
  ) {}

  getProvider(providerName: Providers): IBillPaymentProvider {
    switch (providerName) {
      case Providers.INTERSWITCH:
        return this.interswitchProvider;
      case Providers.VTPASS:
        return this.vtpassProvider;
      default:
        throw new BadRequestException(`Unknown provider: ${providerName}`);
    }
  }
}
