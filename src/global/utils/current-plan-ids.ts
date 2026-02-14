import { Injectable } from '@nestjs/common';

// the default scope here is singleton
@Injectable()
export class CurrentPlanIds {
  private PAYPAL_BRONZE_PLAN_ID = process.env.PAYPAL_BRONZE_PLAN_ID;
  private PAYPAL_SILVER_PLAN_ID = process.env.PAYPAL_SILVER_PLAN_ID;
  private PAYPAL_GOLD_PLAN_ID = process.env.PAYPAL_GOLD_PLAN_ID;

  // TODO: update this later to respect good OOP principles.
  // this is just for the sake of demo.
  PLAN_ID = [
    {
      name: 'bronze',
      id: this.PAYPAL_BRONZE_PLAN_ID,
    },
    {
      name: 'silver',
      id: this.PAYPAL_SILVER_PLAN_ID,
    },
    {
      name: 'gold',
      id: this.PAYPAL_GOLD_PLAN_ID,
    },
  ];

  async getPlanName({ plan_id }: { plan_id: string }) {
    return this.PLAN_ID.find(plans => plans.id === plan_id)?.name;
  }

  // we use includes method in prevision of adding new products like bi-annual gold, bi-annual silver, etc.
  async getPlanId({ plan_name }: { plan_name: string }) {
    return this.PLAN_ID.find(plan => plan.name.includes(plan_name))?.id;
  }
}
