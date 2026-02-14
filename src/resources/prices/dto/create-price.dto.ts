import { Prisma, PlanStatus } from '@prisma/client';

export class CreatePriceDto {
  /**
   * plan_id: "P-8BL55559UG9018049N3GNKVQ"
   */
  id: string;

  /**
   * plan_name: "Bronze"
   */
  plan_name: string;

  /**
   * active: true
   */
  active: boolean;

  /**
   * status: "on"
   */
  status: PlanStatus;

  /**
   * description: "The Bronze plan offers access to one of the two chapters one and two"
   */
  description: string;

  /**
   * currency: "USD"
   */
  currency: string;

  /**
   * price: "1800"
   */
  price: string;

  /**
   * billing_cycle: every 1 year
   */
  billing_cycle: string;

  /**
   * price_type: "fixed pricing"
   */
  price_type: string;

  /**
   * number_of_billing_cycles: illimited
   */
  number_of_billing_cycles: number;

  /**
   * auto_renewal: false
   */
  auto_renewal: boolean;

  /**
   * cancellation_policy: "No refunds"
   */
  cancellation_policy: string;
}
