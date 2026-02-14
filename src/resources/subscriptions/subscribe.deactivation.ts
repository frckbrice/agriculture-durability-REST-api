

import { Injectable } from '@nestjs/common';
import { Cron, CronExpression, SchedulerRegistry } from '@nestjs/schedule';
import {
  $Enums,
  Company,
  CompanyStatus,
  Prisma,
  SubscriptionStatus,
} from '@prisma/client';
import * as moment from 'moment-timezone';
import { PrismaService } from 'src/adapters/config/prisma.service';
import { SubscriptionEntity } from './entities/subscription.entity';
import { SubscriptionsService } from './subscriptions.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { localEvents } from 'src/global/share/events';
import { LoggerService } from 'src/global/logger/logger.service';
import { CronJob } from 'cron';
// import { weeks } from '@nestjs/throttler';
// import { CronJob } from '@nestjs/schedule';
import { addDays, addWeeks, isAfter, isBefore } from 'date-fns';

moment.tz.setDefault('Africa/Douala');
type CompanySubscription = {
  company: {
    id: string;
    timezone: string;
  };
} & {
  id: string;
  plan_id: string;
  company_id: string;
  start_date: Date;
  end_date: Date;
  status: $Enums.SubscriptionStatus;
  updated_at: Date;
};
@Injectable()
export class SubscriptionManagementService {
  private logger = new LoggerService(SubscriptionManagementService.name);

  constructor(
    private prismaService: PrismaService,
    private subscriptionService: SubscriptionsService,
    private eventEmitter: EventEmitter2,
    private schedulerRegistry: SchedulerRegistry,
  ) { }

  @Cron(CronExpression.EVERY_5_SECONDS, {
    name: 'check_subscriptions',
    timeZone: 'Africa/Douala',
  })
  async checkSubscriptions() {
    console.log('Running subscription check cron job...');


    const subscriptions = (
      await this.subscriptionService.getSubscriptionsExpireInNextTwoMonthsOrThreeWeeksAfterExpiration()
    ).data;
    console.log('subscriptions: start ', subscriptions);
    for (const subscription of subscriptions) {
      await this.checkSubscriptionStatus(subscription);
    }
  }

  private async checkSubscriptionStatus(subscription: CompanySubscription) {
    const user_time_zone = subscription.company?.timezone || 'UTC';
    const now = moment().tz(user_time_zone);

    const end_date = moment(subscription.end_date).tz(user_time_zone);
    const grace_end_date = moment(end_date).add(3, 'weeks');

    if (this.shouldSendNotification(subscription, now)) {
      this.logger.log(
        `Subscription ${subscription.id} has should be notified`,
        SubscriptionManagementService.name,
      );
      await this.sendNotificationForSoonExpiration(subscription);
    }

    if (now.isAfter(grace_end_date)) {
      this.logger.log(
        `Subscription ${subscription.id} definitly expired`,
        SubscriptionManagementService.name,
      );
      await this.deactivateAccount(subscription);
    }

    if (now.isAfter(end_date) && now.isBefore(grace_end_date)) {
      this.logger.log(
        `Subscription ${subscription.id} passes in grace period`,
        SubscriptionManagementService.name,
      );
      await this.startGracePeriod(subscription);
    }
  }

  private async deactivateAccount(subscription: CompanySubscription) {
    await this.prismaService.$transaction(async () => {
      await this.subscriptionService.updateCompanySubscription(
        subscription.id,
        {
          status: SubscriptionStatus.EXPIRED,
          payment_id: null
        },
      );

      await this.prismaService.company.update({
        where: { id: subscription.company_id },
        data: {
          payment_id: null,
          status: CompanyStatus.EXPIRED,
        },
      });
    });
    this.logger.log(
      `Subscription account No: ${subscription.id} has been deactivated`,
      SubscriptionManagementService.name,
    );
    await this.notifyDeactivation(subscription.company_id);
  }

  private async startGracePeriod(subscription: CompanySubscription) {
    const grace_end_date = moment(subscription.end_date)
      .add(3, 'weeks')
      .toDate();
    await this.subscriptionService.updateCompanySubscription(subscription.id, {
      status: SubscriptionStatus.GRACE_PERIOD,
      grace_period_end: grace_end_date,
    });

    await this.notifyGracePeriodStart(subscription.company_id);
  }


  private shouldSendNotification(subscription: any, now: any): boolean {
    const twoMonthsBeforeEnd = addDays(new Date(subscription.end_date), -60);
    const graceEndDate = addWeeks(new Date(subscription.end_date), 3);

    return (
      (isAfter(now, twoMonthsBeforeEnd) &&
        isBefore(now, new Date(subscription.end_date))) ||
      (isAfter(now, new Date(subscription.end_date)) &&
        isBefore(now, graceEndDate))
    );
  }

  private async sendNotificationForSoonExpiration(
    subscription: CompanySubscription,
  ) {
    this.logger.log(
      `Sending notification to company ${subscription.company_id}`,
      SubscriptionManagementService.name,
    );
    this.eventEmitter.emit(
      localEvents.subscriptionRenewalReminder,
      subscription,
    );

    await this.subscriptionService.updateCompanySubscription(subscription.id, {
      last_notification_date: moment().toDate() ?? new Date(Date.now()),
    });
  }

  // notify company for account deactivation
  private async notifyDeactivation(companyId: string) {
    const company = await this.prismaService.company.findUnique({
      where: { id: companyId },
    });
    if (!company) return;

    this.logger.log(
      `Notifying company ${companyId} about account deactivation`,
      SubscriptionManagementService.name,
    );
    this.eventEmitter.emit(localEvents.accountDeactivated, company);
  }

  // notify the company for grace period
  private async notifyGracePeriodStart(companyId: string) {
    const company = await this.prismaService.company.findUnique({
      where: { id: companyId },
    });
    if (!company) return;

    this.logger.log(
      `Notifying company ${companyId} about grace period start`,
      SubscriptionManagementService.name,
    );
    this.eventEmitter.emit(localEvents.gracePeriodStarted, company);
  }
}