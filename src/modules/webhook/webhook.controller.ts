import { Controller, Headers, Post, RawBody, Req } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiResponse } from '@nestjs/swagger';
import crypto from 'crypto';
import type { Request } from 'express';
import { WebhookService } from './webhook.service';
import type { InterswitchPaymentWebhookData } from 'src/common/types/webhook';
import {
  validateTransaction,
  validateTransactionV2,
} from '../bills/utils/validateTransaction';

@Controller('webhooks')
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

  @Post('interswitch')
  @ApiOperation({ summary: 'Handle interswitch payment webhook' })
  @ApiOkResponse({ type: ApiResponse })
  public async handleInterswitchPaymentWebhook(
    @Headers('X-Interswitch-Signature') signature: string,
    @Req() req: Request,
    @RawBody() rawBody: string,
  ) {
    const body = req.body as InterswitchPaymentWebhookData;
    console.log('webhook data', body);
    // validate signature
    const hash = crypto
      .createHmac('sha512', process.env.INTERSWITCH_WEBHOOK_SECRET!)
      .update(rawBody)
      .digest('hex');

    if (hash !== signature) {
      console.error('Invalid signature');
      return { status: 200, message: 'Invalid signature' };
    }

    // validating transaction and event status because transaction can be completed but may not be successful
    if (
      body.event !== 'TRANSACTION.COMPLETED' ||
      !validateTransactionV2(body.data.responseCode)
    ) {
      console.error('Transaction not completed');
      return { status: 200, message: 'Transction not completed' };
    }

    try {
      const pay = await this.webhookService.handleInterSwitchTransactions(body);
      console.log('Bill payment success', pay);
      return { status: 200, message: 'ok' };
    } catch (err) {
      console.error(
        'Error handling webhook',
        err?.response?.data ?? err.message,
      );
      return { status: 200, message: 'Error handling webhook' };
    }
  }
}
