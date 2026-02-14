import { $Enums, Subscription } from '@prisma/client';
import { isString, isNotEmpty, IsString, IsNotEmpty } from 'class-validator';

export class CreateSubscriptionDto {
  /**
   * example plan_id: P-7Z754QH5RSJFBK
   */
  @IsString()
  @IsNotEmpty()
  plan_id: string;
  /**
   * example company_id: company_1:1526654ds4ds5ds55
   */
  @IsString()
  @IsNotEmpty()
  company_id: string;

  /**
   * example start_date : 2022-01-01T00:00:00Z
   */

  start_date: Date;
  /**
   * example end_date : 2022-01-01T00:00:00Z
   */
  end_date: Date;
  /**
   * example status:  "ACTIVE" | "INACTIVE" | "CANCELLED" | "SUSPENDED" | "APPROVAL_PENDING" | "EXPIRED"
   */
  status: $Enums.SubscriptionStatus;
  /**
   * example timeZone : "America/New_York"
   */
  timeZone: string;
  /**
   * example payment_mode : "paypal"
   */
  payment_mode: string;
  /**
   * example lastNotification : "2022-01-01T00:00:00Z"
   */
}
