import { Module } from '@nestjs/common';
import { ListenerService } from './listener.service';
import { MailModule } from './mail/mail.module';

@Module({
  imports: [MailModule],
  controllers: [],
  providers: [
    // ShareService,
    ListenerService,
  ],
})
export class ShareModule {}
