// import { HttpService } from "@nestjs/axios";
import {
  Injectable,
  InternalServerErrorException,
  NotImplementedException,
} from '@nestjs/common';
import { AxiosResponse } from 'axios';
import { filter, Observable } from 'rxjs';
import { FetchService } from 'nestjs-fetch';
import { LoggerService } from 'src/global/logger/logger.service';

// create a subscription in paypal
@Injectable()
export class PaymentSubscriptionService {
  // base = 'https://api-m.sandbox.paypal.com';
  baseUrl = process.env.PAYMENT_API;
  CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
  CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
  LOCAL_API_URL = process.env.NEXT_PUBLIC_LOCAL_API_URL;
  private logger = new LoggerService(PaymentSubscriptionService.name);
  constructor(private readonly fetch: FetchService) { }

  // set basic auth ID
  auth: string = Buffer.from(
    this.CLIENT_ID + ':' + this.CLIENT_SECRET,
  ).toString('base64');
  //  create subscription payload.
  setSubscriptionPayload(subscriptionPlanId: string) {
    let subscriptionPayload = {
      plan_id: `${subscriptionPlanId}`,
      application_context: {
        brand_name: 'sendwisetool',
        local: 'en_US',
        user_action: 'SUBSCRIBE_NOW',
        payment_method: {
          payer_selected: 'PAYPAL',
          payee_preferred: 'IMMEDIATE_PAYMENT_REQUIRED',
        },
        return_url: `${this.LOCAL_API_URL}/subscription/successPayPalPayment`,
        cancel_url: `${this.LOCAL_API_URL}/subscription/cancelPayPalPayment`,
      },
    };

    return subscriptionPayload;
  }

  // create subscription
  async subscribeToPlan(subscriptionPlanId: string) {
    try {
      const subscriptSession = await this.fetch.post(
        '/v1/billing/subscriptions',
        {
          body: JSON.stringify(this.setSubscriptionPayload(subscriptionPlanId)),
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Basic ' + this.auth,
          },
        },
      );

      return await subscriptSession.json();
    } catch (error) {
      this.logger.log(
        `Error while creating subscription \n\n ${error}`,
        PaymentSubscriptionService.name,
      );
      throw new InternalServerErrorException(
        `Error while creating subscription `,
      );
    }
  }

  // get subscription details for paypal
  async getPaypalSubscriptionDetails(subscriptionId: string) {
    try {
      const subcriptDetails = this.fetch.get(
        `/v1/billing/subscriptions/${subscriptionId}`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Basic ' + this.auth,
          },
        },
      );
      return await (await subcriptDetails).json();
    } catch (error) {
      this.logger.error(
        `Error while fetching subscription details \n\n ${error}`,
        PaymentSubscriptionService.name,
      );
      throw new NotImplementedException(
        `Error while fetching subscription details `,
      );
    }
  }

  // get subscription details for nokash
  async getNokashSubscriptionDetails(transactionId: string) {
    console.log("\n\n Check payment status for id \n\n", transactionId);

    try {
      const response = await fetch(`${this.baseUrl}/310/status-request?transaction_id=${transactionId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transaction_id: transactionId,
        }),
      });

      return await response.json();
    } catch (error) {
      console.error('Failed to check payment status:', error);
      throw error;
    }
  }

  // unsubscribe to a plan
  async unsubscribeToPlan(subscriptionId: string) {
    // this is Mock:
    // TODO: adds a reason to unsubscribe from frontend.
    const payload = {
      reason: 'Not satisfied with the service',
    };
    try {
      const unsubResponse = this.fetch.post(
        '/v1/billing/subscriptions/' + subscriptionId + '/cancel',
        {
          body: JSON.stringify(payload),
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Basic ' + this.auth,
          },
        },
      );

      return await (await unsubResponse).json();
    } catch (error) {
      this.logger.error(
        `Error while cancelling subscription \n\n ${error}`,
        PaymentSubscriptionService.name,
      );
      throw new NotImplementedException(`Error while cancelling subscription `);
    }
  }

  async changPlan(subscription_id: string, plan_id: string) {
    try {
      // upgrade the plan
      const upgradeSubscriptionPlan = await this.fetch.post(
        `/v1/billing/subscriptions/${subscription_id}/revise`,
        {
          body: JSON.stringify({ plan_id: plan_id }),
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Basic ' + this.auth,
          },
        },
      );

      return await upgradeSubscriptionPlan.json();
    } catch (error) {
      this.logger.error(
        `Error while upgrading subscription \n\n ${error}`,
        PaymentSubscriptionService.name,
      );
      throw new NotImplementedException(` Error while upgrading subscription `);
    }
  }
}
