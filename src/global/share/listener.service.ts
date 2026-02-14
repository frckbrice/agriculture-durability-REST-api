import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { localEvents } from './events';
// import { MailService } from 'src/mail/mail.service'
import { PrismaService } from 'src/adapters/config/prisma.service';
import { MailerService } from '@nestjs-modules/mailer';
import { CompanyType } from 'src/resources/companies/entities/company.entity';
import { LoggerService } from 'src/global/logger/logger.service';
import { MailServiceEvent } from './mail/mail.service';
import { Request } from 'express';
import { Role, User, UserStatus } from '@prisma/client';

@Injectable()
export class ListenerService {
  counter: number = 1;
  private logger = new LoggerService(ListenerService.name);
  constructor(
    private readonly mailerService: MailerService,
    private prismaService: PrismaService,
    private sendMailService: MailServiceEvent,
  ) { }



  @OnEvent(localEvents.paymentSuccess)
  async handleUnsubscribePaymentLogic(payload: any, retry: number = 0) {
    // TODO: send email to Customer company
    this.logger.log('handleUnsubscribePaymentLogic', JSON.stringify(payload));

    try {

      const company = await this.prismaService.company.findUnique({
        where: { id: payload.company_id },
      });

      if (company) {
        const res = await this.sendMailService.senMail({
          toEmail: company?.email,
          subject: `SUCCESSFULL SUBSCRIPTION TO SENWISETOOL ✔`,
          text: 'Thanks for subscribing to our plateform. You can now enjoy all the features of our platform, based on your subscription plan.',
        });
        if (res) {
          // TODO: send email to Customer company
          this.logger.log(
            'Company created \n\n ' + JSON.stringify(payload),
            ListenerService.name,
          );
          return;
        }
      }
    } catch (error) {
      if (retry < 3)
        this.handleUnsubscribePaymentLogic(payload, retry + 1);
      this.logger.error(error, ListenerService.name);
      throw new Error('Failed to send email');
    }
  }

  @OnEvent(localEvents.paymentCanceled)
  async handleFailedPaymentLogic(payload: any, retry: number = 0) {
    // TODO: send email to Customer company
    this.logger.log('handle payment falilure logic', JSON.stringify(payload));

    try {

      const company = await this.prismaService.company.findUnique({
        where: { id: payload.company_id },
      });

      if (company) {
        const res = await this.sendMailService.senMail({
          toEmail: company?.email,
          subject: `FAILURE OF SUBSCRIPTION TO SENWISETOOL ✔`,
          text: 'Sorry your subscription to senwisetool platform failed. Please try again',
        });

        return this.logger.log(
          'Company created \n\n ' + JSON.stringify(payload),
          ListenerService.name,
        );
      }
    } catch (error) {
      if (retry < 3)
        this.handleFailedPaymentLogic(payload, retry + 1);
      this.logger.error(error, ListenerService.name);
      throw new Error('Failed to send email');
    }
  }
  // company created
  @OnEvent(localEvents.companyCreated)
  async handleCompanyCreated(payload: CompanyType, retry: number = 0) {
    try {
      const res = await this.sendMailService.senMail({
        toEmail: payload.email,
        subject: `${payload.name} COMPANY CREATED IN SENWISETOOL PLATEFORM ✔`,
        text: 'Thanks for joining us. We are glad you are member of senwisetool plateform. You can now enjoy all the features of our platform.',
      });
      if (res) {
        // TODO: send email to Customer company
        this.logger.log(
          'Company created \n\n ' + JSON.stringify(payload),
          ListenerService.name,
        );
        return;
      }
    } catch (error) {
      if (retry < 4)
        this.handleCompanyCreated(payload, retry--);
      this.logger.error(error, ListenerService.name);
      throw new Error('Failed to send email');
    }
  }

  // To update the current user and add him to current user state. 
  @OnEvent(localEvents.userCreated)
  async updateRequestCurrentUserPayload(
    payload: Partial<User>,
    req: Request & {
      user: Partial<User>;
    },
  ) {
    const user = {
      id: payload.id,
      first_name: <string>payload.first_name,
      email: payload.email,
      role: <Role>payload.role,
      status: <UserStatus>payload.status,
      company_id: <string>payload.company_id,
    };

    return (req['user'] = user);
  }
}
