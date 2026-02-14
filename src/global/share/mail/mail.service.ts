import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { LoggerService } from 'src/global/logger/logger.service';


interface MailOptions {
  toEmail: string;
  from: string;
  subject: string;
  text: string;
  html: string;
}

@Injectable()
export class MailServiceEvent {
  private readonly logger = new LoggerService(MailServiceEvent.name);
  constructor(private readonly mailerService: MailerService) { }

  async senMail({
    toEmail,
    subject,
    text,
  }: Partial<MailOptions>): Promise<any> {
    return this.mailerService
      .sendMail({
        to: toEmail, // list of receivers
        from: 'noreply@sendwisetool.com', // sender address
        subject, // Subject line
        text, // plaintext body
        //  html: '<b>welcome</b>', // HTML body content
      })
      .then((resp) => {
        this.logger.log(` mail sent to ${toEmail}`, MailServiceEvent.name);
        return resp.response;
      })
      .catch((err) => {
        this.logger.error(
          `mail service event :error sending mail \n\n ${err}`,
          MailServiceEvent.name,
        );

      });
  }
}
