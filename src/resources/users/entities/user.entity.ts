import { Exclude } from 'class-transformer';
import { $Enums, User } from '@prisma/client';
export class UserType implements User {
  id: string;
  name: string;
  email: string;
  @Exclude()
  password: string;
  company_id: string;
  created_at: Date;
  famer_attached_contract_url: string | null;
  first_name: string;
  last_name: string | null;
  phone_number: string | null;
  profileUrls: string | null;
  role: $Enums.Role;
  status: $Enums.UserStatus;
  updated_at: Date;
  username: string | null;
}
