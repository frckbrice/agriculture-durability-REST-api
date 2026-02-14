import { ProjectStatus, TypeProject } from '@prisma/client';
import { JsonValue } from '@prisma/client/runtime/library';
import { IsDate, IsEnum, IsJSON, IsNotEmpty, IsString } from 'class-validator';
import { ProjectEntity } from '../entities/project.entity';

export class CreateProjectDto implements Partial<ProjectEntity> {
  /**
   * example: dongamantung-project
   *
   */
  @IsString()
  @IsNotEmpty()
  title: string;

  /**
 * example: INTERNAL_INSPECTION
 */

  @IsEnum([
    TypeProject.INITIAL_INSPECTION,
    TypeProject.INTERNAL_INSPECTION,
    TypeProject.AUTO_EVALUATION,
    TypeProject.MAPPING,
  ])
  @IsNotEmpty()
  type: TypeProject;
  /**
   * @example "d8a2b2b8-67ea-4d74-b548-15909c04ccb2"
   */
  @IsString()
  @IsNotEmpty()
  campaign_id: string;

  /**
 * @example "d8a2b2b8-67ea-4d74-b548-15909c04ccb2"
 */
  @IsString()
  @IsNotEmpty()
  company_id: string;

  /**
   * example: dongamantung-project concern the collection of data on cocoa farms for farmer of dungamantung subdivision
   */
  @IsString()
  @IsNotEmpty()
  description: string;



  /**
    * @example  region: "bamenda"
    */
  country: string

  /**
  * example:ARCHIVED
  */
  @IsEnum([
    ProjectStatus.ACTIVE,
    ProjectStatus.ARCHIVED,
    ProjectStatus.DELETED,
    ProjectStatus.DRAFT,
  ])
  @IsNotEmpty()
  status: ProjectStatus;

  /**
  * @example  region: "bamenda"
  */
  region: string

  /**
  * @example  city: "bamenda"
  */
  city: string;


  /**
   * example start_date: 28-06-12T12:12:000z
   */
  @IsDate()
  @IsNotEmpty()
  start_date: Date;

  /**
   * example end_date: 28-06-2024T12:12:000z
   */
  @IsDate()
  @IsNotEmpty()
  end_date: Date;


  /**
   * example project_structure: {}
   */
  project_structure: JsonValue;

  /**
     * example another_logo: https://github.com/logo.png or local logo 
     */
  another_logo: string;

  /**
   * example code: COCOA
   */
  code: string;

  /**
   * example:COCOA
   */
  @IsString()
  sector_activity: string;

}
