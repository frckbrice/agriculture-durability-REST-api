import { BillingCycle, PlanStatus, Price_plan, ProductName } from '@prisma/client';
export class Price implements Price_plan {
  active: boolean;
  billing_cycle: BillingCycle;
  currency: string;
  description: string;
  id: string;
  number_of_billing_cycles: string;
  price: string;
  price_type: string;
  product_name: ProductName;
  plan_name: string;
  status: PlanStatus;
  auto_renewal: boolean;
  cancellation_policy: string[];
  created_at: Date;
  updated_at: Date;
}
