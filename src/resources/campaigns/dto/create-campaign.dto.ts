export class CreateCampaignDto {
  /**
   * example: description: " some campaign innovation description"
   */
  description: string;
  /**
   *example  end_date: 2023-01-01
   */
  end_date: Date;
  /**
   *  example: name= "2023-2024" .
   *  Note this could change later to name = april 2024
   */
  name: string;
  /**
   * example: start_date: 2023-12-31
   */
  start_date: Date;
  /**
   * example. status: OPEN | CLOSED
   */
  status: string;
}
