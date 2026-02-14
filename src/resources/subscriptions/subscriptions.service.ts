import {
  BadRequestException,
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  NotImplementedException,
} from '@nestjs/common';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PaymentSubscriptionService } from './subscribe.service.dao';
import { LoggerService } from 'src/global/logger/logger.service';
import { localEvents } from 'src/global/share/events';
import { PrismaService } from 'src/adapters/config/prisma.service';
import { CurrentPlanIds } from 'src/global/utils/current-plan-ids';
import {
  CompanyStatus,
  Prisma,
  Subscription,
  SubscriptionStatus,
} from '@prisma/client';
import * as moment from 'moment-timezone';
import { addMonths, subWeeks } from 'date-fns';
import { toZonedTime, fromZonedTime, } from 'date-fns-tz';

import { SubscriptionEntity, SuccesspaymentType } from './entities/subscription.entity';

const timeZone = 'Africa/Douala'; // Set your default time zone
// Get the current time in the specified time zone
const now = toZonedTime(new Date(), timeZone);


@Injectable()
export class SubscriptionsService {
  private readonly logger = new LoggerService(SubscriptionsService.name);

  constructor(
    private eventEmitter: EventEmitter2,
    private payalService: PaymentSubscriptionService,
    private prismaService: PrismaService,
    private currentplanIds: CurrentPlanIds,
  ) { }

  /**
   * Find all active subscriptions that are expiring in the next two months.
   * This is useful for sending reminder notifications to customers.
   *
   * @returns A list of Subscription objects that are expiring in the next two months
   */


  async getSubscriptionsExpireInNextTwoMonths() {
    const now = new Date(); // Current date and time
    const twoMonthsFromNow = moment().add(2, 'months').toDate(); // Date two months from now

    const subscriptions = await this.prismaService.subscription.findMany({
      where: {
        end_date: {
          gte: now, // Subscriptions that end after the current date
          lte: twoMonthsFromNow, // Subscriptions that end within the next two months
        },
        status: SubscriptionStatus.ACTIVE, // Only consider active subscriptions
      },
      include: {
        company: true, // Include the associated company details
      },
    });

    return {
      data: subscriptions,
      message: 'Subscriptions expiring in the next two months fetched successfully',
      status: 200,
    };
  }

  // this operation is done in the client by the paypal SDK.
  async subscribeToPlanService(createSubscriptionDto: CreateSubscriptionDto) {
    this.logger.log(
      `launched subscription to plan id: ${createSubscriptionDto.plan_id}`,
    );

    // validate plan id
    if (
      !this.currentplanIds.PLAN_ID.some(
        (value) => <string>value.id === createSubscriptionDto.plan_id,
      )
    ) {
      throw new Error(`plan id ${createSubscriptionDto.plan_id} not found`);
    }

    try {
      const result = await this.payalService.subscribeToPlan(
        createSubscriptionDto.plan_id,
      );

      if (!result)
        return {
          data: null,
          status: 400,
          message: `Failed to create subscription`,
        };

      return {
        data: result,
        status: 201,
        message: `Subscription created successfully`,
      };
    } catch (error) {
      this.logger.error(
        `Error while creating subscription ${error}`,
        SubscriptionsService.name,
      );
      throw new NotImplementedException();
    }
  }

  // find all the subscriptions for the sake of checking the expired time.

  async findAll() {
    try {
      const data = await this.prismaService.subscription.findMany();
      if (data.length)
        return {
          status: HttpStatus.OK,
          message: 'All subscriptions fetched successfully',
          data,
          total: data.length,
        };
      else
        return {
          status: HttpStatus.NOT_FOUND,
          message: 'No subscriptions found ',
          data: [],
          total: 0,
        };
    } catch (error) {
      this.logger.error(
        `Error while fetching subscriptions \n\n ${error}`,
        SubscriptionsService.name,
      );
      throw new HttpException(
        `Error while fetching subscriptions `,
        HttpStatus.NOT_FOUND,
      );
    }
  }

  // find all the subscription between interval dates
  async getSubscriptionsExpireInNextTwoMonthsOrThreeWeeksAfterExpiration() {
    const now = moment().utc();

    try {
      const data = await this.prismaService.subscription.findMany({
        where: {
          OR: [
            // Subscriptions ending within the next 2 months
            {
              end_date: {
                gte: now.toDate(),
                lte: now.clone().add(2, 'months').toDate(),
              },
            },
            // Subscriptions that ended within the last 3 weeks (grace period)
            {
              end_date: {
                gte: now.clone().subtract(3, 'weeks').toDate(),
                lt: now.toDate(),
              },
            },
          ],
          status: SubscriptionStatus.ACTIVE,
        },
        orderBy: {
          end_date: 'asc',
        },
        include: {
          company: true,
        },
      });
      console.log('inside subscriptions service : ', data);
      if (data.length)
        return {
          data,
          status: HttpStatus.OK,
          message: `Subscription that expire in next two months or three weeks after expiration.`,
        };
      else
        return {
          data: [],
          status: HttpStatus.BAD_REQUEST,
          message: `Failed to fetch subscription that expire in next two months or three weeks after expiration.`,
        };
    } catch (error) {
      this.logger.error(
        `Error while fetching subscriptions expire in next two months or three weeks after expiration \n\n ${error}`,
        SubscriptionsService.name,
      );
      throw new NotImplementedException(
        `Error while fetching subscriptions expire in next two months or three weeks after expiration`,
      );
    }
  }

  async upgradeSubscriptionPlan(
    subscription_id: string,
    updateSubscriptionDto: UpdateSubscriptionDto,
  ) {
    try {
      // validate plan id
      if (
        !this.currentplanIds.PLAN_ID.some(
          (value) => <string>value.id === updateSubscriptionDto.plan_id,
        )
      ) {
        throw new Error(`plan id ${updateSubscriptionDto.plan_id} not found`);
      }

      const result = await this.payalService.changPlan(
        subscription_id,
        <string>updateSubscriptionDto.plan_id,
      );
      if (result) {
        // update the subscription to set the new price plan
        const data = await this.updateCompanySubscription(subscription_id, {
          plan_id: <string>updateSubscriptionDto.plan_id,
        });

        if (data)
          return {
            data: result,
            status: HttpStatus.CREATED,
            message: `Subscription plan upgraded successfully.`,
          };
        else
          return {
            data: null,
            status: HttpStatus.NOT_MODIFIED,
            message: `Failed to upgrade subscription plan. to Database`,
          };
      } else
        return {
          data: null,
          status: HttpStatus.NOT_MODIFIED,
          message: `Failed to upgrade subscription plan.`,
        };
    } catch (error) {
      this.logger.error(
        `Error while upgrading subscription plan \n\n ${error}`,
        SubscriptionsService.name,
      );
      throw new HttpException(
        `Error while upgrading subscription plan `,
        HttpStatus.NOT_MODIFIED,
      );
    }
  }

  remove(subscription_id: string) {
    return `This action removes a #${subscription_id} subscription`;
  }

  // cancel payment

  cancelPayPalPayment(subscriptionPayload: any, company_id: string) {
    this.logger.log('paypal payment cancelled', SubscriptionsService.name);
    console.log(subscriptionPayload);

    if (!company_id) {
      throw new BadRequestException("Company ID is required and cannot be undefined.");
    }

    if (!subscriptionPayload?.id) {
      throw new BadRequestException("Payment ID is required and cannot be undefined.");
    }
    // TODO: write listener fot this event to send message to user for cnfirmation
    this.eventEmitter.emit(localEvents.paymentCanceled, subscriptionPayload);
  }

  // success payment
  async successPayPalPayment(company_id: string, payment: SuccesspaymentType) {
    this.logger.log('\n\n Paypal payment subscription processing ...', JSON.stringify(payment));

    if (!company_id) {
      throw new BadRequestException("Company ID is required and cannot be undefined.");
    }

    if (!payment?.id) {
      throw new BadRequestException("Payment ID is required and cannot be undefined.");
    }

    try {

      /**
       * this is a design decision to check if the subscription exists.
       * if the subscription exists, it will not create a new one.
       */
      try {
        const existingSubscription = await this.prismaService.subscription.findUnique({
          where: { payment_id: payment.id },
        });

        if (existingSubscription) {
          return {
            data: existingSubscription,
            status: HttpStatus.OK,
            message: `This company has an ongoing active subscription! this can not be renew before the ending date`,
          };
        }
      } catch (error) {
        this.logger.error(error, SubscriptionsService.name);
        throw error;
      }

      // Check if company exists
      const company = await this.prismaService.company.findUnique({
        where: { id: company_id },
        select: { status: true },
      });

      if (!company) {
        throw new NotFoundException("Company not found.");
      }

      // Check if the company already has an active subscription
      const existingSubscription = await this.prismaService.subscription.findFirst({
        where: {
          company_id, // Fixed: Use company_id instead of id
          status: SubscriptionStatus.ACTIVE,
          end_date: { gte: new Date() }, // Check if end_date is in the future
        },
        include: {
          price: {
            select: {
              plan_name: true
            }
          }
        }
      });

      if (existingSubscription || company.status === 'ACTIVE') {
        return {
          data: existingSubscription,
          status: HttpStatus.OK,
          message: `This company has an ongoing active subscription! this can not be renew before the ending date`,
        };
      }

      // Create a new subscription with a transaction
      const newSubscription = await this.prismaService.$transaction(async (tx) => {
        const newSubscription = await tx.subscription.create({
          data: {
            company_id,
            plan_id: payment?.current_price_id as string,
            status: SubscriptionStatus.ACTIVE,
            start_date: new Date(),
            end_date: this.addOneYear(new Date()),
            payment_mode: 'MOBILE MONEY',
            payment_id: payment?.id,
          },
        });

        await tx.company.update({
          where: { id: company_id },
          data: {
            status: CompanyStatus.ACTIVE,
            payment_id: payment?.id,
            payment_mode: newSubscription?.payment_mode,
            payment_phone_number: payment?.phone
          },
        });
        this.eventEmitter.emit(localEvents.paymentSuccess, newSubscription);
        return newSubscription;
      })


      return {
        data: newSubscription,
        status: HttpStatus.CREATED,
        message: `Subscription successfully created for the company`,
      };

    } catch (error) {
      this.logger.error(
        `Error while creating a subscription for company with id ${company_id} \n\n ${error}`,
        SubscriptionsService.name,
      );
      throw new HttpException(
        `Error while creating a subscription for company with id ${company_id}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  addOneYear(start_date: Date) {
    // Clone the start_date
    const end_date = new Date(start_date);

    // Get current year
    const currentYear = end_date.getFullYear();

    // Add one year
    end_date.setFullYear(currentYear + 1);

    // Check if we are dealing with February 29
    if (start_date.getDate() === 29 && start_date.getMonth() === 1) { // February is month 1
      // Check if the new year is a leap year
      if (end_date.getMonth() !== 1) { // If the new date is not in February
        // Set to February 28 of the next year
        end_date.setDate(28);
      }
    }

    return end_date;
  }


  // Helper method to check if a subscription is valid and active
  async isSubscriptionValid(companyId: string): Promise<boolean> {
    const now = new Date();

    const activeSubscription = await this.prismaService.subscription.findFirst({
      where: {
        company_id: companyId,
        status: SubscriptionStatus.ACTIVE,
        start_date: { lte: now },
        OR: [
          { end_date: { gte: now } },
          { grace_period_end: { gte: now } }
        ]
      }
    });

    return !!activeSubscription;
  }

  // Helper method to get subscription details
  async getSubscriptionDetails(companyId: string) {
    return await this.prismaService.subscription.findFirst({
      where: {
        company_id: companyId,
        status: SubscriptionStatus.ACTIVE
      }
    });
  }

  // get the subscription for a company
  async getCompanySubscription(company_id: string) {
    try {
      const data = await this.prismaService.subscription.findFirst({
        where: {
          company_id: company_id,
        },
        select: {
          id: true,
          plan_id: true, // TODO: make a migration for prisma.
          status: true,
          company: {
            select: {
              payment_id: true,
              status: true,
            },
          },
        },
      });
      if (data?.id)
        return {
          data,
          status: HttpStatus.OK,
          message: `Subscription fetched successfully`,
        };
      else {
        return {
          data: null,
          status: HttpStatus.NOT_FOUND,
          message: `Cannot find Subscription not found`,
        }
      }
    } catch (error) {
      this.logger.error(
        `failed to fetch subscription for company ${company_id}`,
        SubscriptionsService.name,
      );

      throw new NotFoundException(
        `failed to fetch subscription for company ${company_id}`,
      );
    }
  }

  // unsubscribe a company
  async unsubscribeCompany({
    subscription_id,
    company_id,
  }: {
    subscription_id: string;
    company_id: string;
  }) {
    try {
      const result = await this.payalService.unsubscribeToPlan(subscription_id);

      // TODO: handle logic to update the subscription status of a company
      if (result.data.status === '204') {
        // according to paypal docs, a status of 204 here is consider successfully unsubscribed

        const data = await this.updateCompanySubscription(subscription_id, {
          status: SubscriptionStatus.CANCELLED,
        });
        if (data) {
          // TODO: write listener for this event to send message to user for cnfirmation
          this.eventEmitter.emit(localEvents.unsubscribeToPlan, {
            subscription_id,
            company_id,
          });
          return {
            data,
            status: HttpStatus.NO_CONTENT,
            message: `Subscription cancelled successfully`,
          };
        }
        return {
          status: HttpStatus.NOT_MODIFIED,
          data: null,
          message: `failed to unsubscribe company ${company_id}`,
        };
      }

      //  TODO: check if this requires a sending message
      else
        return {
          status: HttpStatus.NOT_MODIFIED,
          data: null,
          message: `failed to unsubscribe company ${company_id}`,
        };
      // TODO: send email to company for notification
    } catch (error) {
      this.logger.error(
        `failed to unsubscribe company ${company_id}`,
        SubscriptionsService.name,
      );
      throw new HttpException(
        `failed to unsubscribe company ${company_id}`,
        HttpStatus.NOT_MODIFIED,
      );
    }
  }

  // store subscription details
  async storeSubscriptionDetails(subscriptionDetails: any, company_id: string) {
    // TODO: store subscription details
    const end_date = moment(subscriptionDetails.start_date)
      .add(1, 'year')
      .toDate();
    try {
      // TODO:: if data, persists them in database subscription model
      const data = await this.prismaService.$transaction(async (tx) => {
        //  create a subscription
        const subscription = await tx.subscription.create({
          data: {
            id: subscriptionDetails?.id, // this is the same ID as the one in nokash platforms
            plan_id: subscriptionDetails?.current_price_id,
            status:
              subscriptionDetails?.status === 'SUCCESS' ? SubscriptionStatus.ACTIVE : SubscriptionStatus.INACTIVE,
            start_date: new Date().toISOString(),
            end_date: end_date,
            company_id,
            payment_id: subscriptionDetails?.id,
            payment_mode: 'MOBILE MONEY'
          },
        });

        // update the company
        await tx.company.update({
          where: {
            id: company_id,
          },
          data: {
            payment_phone_number: subscriptionDetails?.phone, // the phone number of the company owner used to PAY a subscription
            payment_id: subscriptionDetails?.id,  //
            status: CompanyStatus.ACTIVE, // set it to active because he has subscribe to a plan.
          },
        });
        // TODO: handle the sending message logig for the below event...
        this.eventEmitter.emit(localEvents.paymentSuccess, subscription);

        return subscription;
      });

      if (data)
        return {
          status: HttpStatus.CREATED,
          message: `Subscription created successfully`,
          data: data,
        };
      else
        return {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: `Failed to create subscription`,
          data: null,
        };
    } catch (error) {
      this.logger.error(
        `failed to unsubscribe company ${company_id} \n\n ${error}`,
        SubscriptionsService.name,
      );
      throw new InternalServerErrorException(
        `failed to unsubscribe company ${company_id}`,
      );
    }
  }

  async updateCompanySubscription(
    subscription_id: string,
    subscriptionDetails: Partial<Subscription>,
  ) {
    try {
      const updatedSubscription = await this.prismaService.subscription.update({
        where: { id: subscription_id },
        data: subscriptionDetails,
      });

      if (!updatedSubscription)
        return {
          status: HttpStatus.NOT_MODIFIED,
          message: `Failed to update subscription`,
          data: null,
        };
      return {
        status: HttpStatus.OK,
        message: `Subscription updated successfully`,
        data: updatedSubscription,
      };

    } catch (error) {
      this.logger.error(
        `failed to update subscription with id ${subscription_id} \n\n ${error}`,
        SubscriptionsService.name,
      );
      throw new HttpException(
        `failed to update subscription with id ${subscription_id}`,
        HttpStatus.NOT_MODIFIED,
      );
    }
  }

  // get current company last valid subscription
  async getLastValidSubscription(company_id: string) {

    try {
      return await this.prismaService.subscription.findFirst({
        where: {
          AND: [
            { company_id, },
            { status: SubscriptionStatus.ACTIVE },
          ]

        },
        select: {
          plan_id: true,
        },
        orderBy: {
          created_at: 'desc',
        },
      });
    } catch (error) {
      this.logger.error(`Error  while  getting subscription \n\n ${error}`);
    }
  }
}

/** RC/YAO/2017/M/172
 * TODO: use a worker thread for this operation: 
 * 1. create a worker service file
 * 2. listen to message frm the main thread
 * 3. read all subscription fullflling the condition ~ 2months for expire date and within grace period 
 * 4. make specified checking and update subscription status
 * 5. return the result 
 */