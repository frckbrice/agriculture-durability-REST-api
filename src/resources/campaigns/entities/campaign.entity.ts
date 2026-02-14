import { $Enums, Campaign } from '@prisma/client';

export class CampaignType implements Campaign {

  created_at: Date;
  description: string;
  end_date: Date;
  id: string;
  name: string;
  start_date: Date;
  status: $Enums.CampaignStatus;
  updated_at: Date;

}
