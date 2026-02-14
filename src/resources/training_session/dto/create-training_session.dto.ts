// Note: this is created for the purpose of swagger docs only
export class CreateTrainingSessionDto {
  /**
   * example "2jssbbjsbjsbjs21878dd817dd87sd"
   */
  email: string;
  /***
   * example participant_name: "Victor mayos"
   */
  first_name: string;
  /***
   * example participant_name: "mayos victor"
   */
  last_name: string;
  /**
   * example participant_phone: "+234 145 266 8845"
   */
  phone: string;
  /**
   * example participant_role: "Farmer, Trainer"
   */
  role: string;
  /**
   * example participant_signature: ""
   */
  signature: string;
  /**
   * example training_id: "2jssbbjsbjsbjs21878dd817dd87sd"
   */
  training_id: string;
}
