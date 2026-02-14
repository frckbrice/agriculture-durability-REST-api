import { $Enums, Campaign } from '@prisma/client';

export class CompanyCampaign implements Campaign {
  created_at: Date;
  description: string;
  end_date: Date;
  id: string;
  name: string;
  start_date: Date;
  updated_at: Date;
  status: $Enums.CampaignStatus;
}
