// Note: this dto is used only in swagger docs. all the validations are made by prisma.
export class CreateCompanyDto {
  /**
   * company address: "123 Main St"
   */
  address: string;
  /**
   * company city: "New York"
   */
  city: string;
  /**
   * company_paypal_email: "example@company_paypal_email.com"
   */
  company_paypal_email: string;

  /**
   * company country: "US"
   */
  country: string;
  /**
   * company description: "company specialized in ..."
   */
  description: string;

  /**
   * company email: "example@company_email.com"
   */
  email: string;
  /**
   * company logo: "https://example.com/logo.png"
   */
  logo: string;
  /**
   * company name: "Example Company"
   */
  name: string;

  /**
   * payment_mode: "paypal"
   */
  payment_mode: string;
  /**
   * paypal_id: "example_paypal_id"
   */
  paypal_id: string;
  /**
   * phone_number: "+1 123-456-7890"
   */
  phone_number: string;
  /**
   * sector_of_activity: "Agriculture"
   */
  sector_of_activity: string;
  /**
   * slug: "example-slug"
   */
  slug: string;
  /**
   * website: "https://example.com"
   */
  website: string | null;
  /**
   * state: "mbalmayo"
   */
  state: string;

  /**
 * head_office_email: "mbalmayo@example.com"
 */
  head_office_email: string

}
