export class CreateTrainingDto {
  /**
   * example "1jssbbjsbjsbjs21878dd817dd87sd"
   */
  company_id: string;
  /**
   * example "2022-01-01T00:00:00.000Z"
   */

  end_date: Date;
  /**
   * example location : douala
   */
  location: string;
  /**
   * example ["Module 1", "Module 2"]
   */
  modules: string[];
  /**
   * example "https://senima.com/wp-content/uploads/2022/01/report.pdf"
   */
  report_url: string;
  /**
   * example "2022-01-01T00:00:00.000Z"
   */
  start_date: Date;
  /**
   * example "Training Title"
   */
  title: string;
  /**
   * example ["1jssbbjsbjsbjs221878dd817dd87sd"]
   */
  trainer_proof_of_competency: string[];
  /**
   * example ["1jssbbjsbjsbjs221878dd817dd87sd"]
   */
  training_attendance_sheet_url: string[];
  /**
   * example ["https://senima.com/wp-content/uploads/2022/01/gold.png"]
   */
  training_picture_url: string[];
}
