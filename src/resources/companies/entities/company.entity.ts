import { $Enums, Company } from '@prisma/client';
export class CompanyType implements Company {
  name: string;

  country: string;

  email: string;

  logo: string;

  payment_mode: string;

  company_paypal_email: string;

  payment_id: string | null;

  sector_of_activity: string;
  payment_phone_number: string | null;

  address: string;

  city: string;

  description: string;

  phone_number: string;

  status: $Enums.CompanyStatus | null;

  state: string;
  website: string | null;

  created_at: Date;
  id: string;
  slug: string | null;
  timezone: string;
  updated_at: Date;
  head_office_email: string
  region: string;
  company_bucket: string | null;
}
