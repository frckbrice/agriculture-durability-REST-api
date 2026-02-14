import { Injectable, Logger } from '@nestjs/common';
import { RequestService } from './global/current-logged-in/request.service';

@Injectable()
export class AppService {
  getHello(): string {

    return 'Welcome To Agriculture-durability Server web app!';
  }
}
