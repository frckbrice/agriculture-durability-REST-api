import { Role, UserStatus } from '@prisma/client';

// Note : all the validations are made by prisma. So this is for swagger docs onlly.
export class CreateUserDto {
  /**
   * @example "John@description.com"
   */

  email: string;

  /**
   * @example "John123654DFDFDFDFAaashi"
   */
  password: string;

  /**
   * @example "doe"
   */

  firstName: string;

  /**
   * @example "John"
   */

  lastName: string;

  /**
   * @example "ADG"
   */

  role: Role;

  /**
   * @example "9e6b3782-3c6f-4961-a986-48372f88a154"
   */

  company_id: string;

  /**
   * @example "+237 600001122 or 600001122."
   */

  phone_number: string;

  /**
   * @example "maebrie2017."
   */

  username: string;

  /**
   * @example "+237 600001122 or 600001122."
   */

  status: UserStatus;

  /**
   * example company_1:1526654ds4ds5ds55
   */

  /**
   * example https://*
   */
  famer_attached_contract_url: string | null;

  /**
   *  example first_name: John
   *  */
  first_name: string;

  /**
   * example last_name: doe
   */
  last_name: string | null;

  /**
   * example phone_number: +237 600001122
   */

  /**
   * example profile_urls: https://*
   */
  profileUrls: string | null;

  /**
   * example id: 9e6b3782-3c6f-4961-a986-48372f88a154
   */
  id: string;

  /**
   * example updated_at: 2022-06-01
   */
  updated_at: Date;

  /**
   * example created_at: 2022-06-01
   */
  created_at: Date;
}
