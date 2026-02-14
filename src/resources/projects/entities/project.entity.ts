import { $Enums, Prisma, Project } from '@prisma/client';

export class ProjectEntity implements Project {
  id: string;
  type: $Enums.TypeProject;
  company_id: string;
  campaign_id: string
  title: string;
  description: string;
  sector_activity: string;
  country: string;

  status: $Enums.ProjectStatus;
  region: string;
  city: string;
  start_date: Date;
  end_date: Date;
  project_structure: Prisma.JsonValue;
  another_logo: string | null;
  code: string;

  archived_at: Date;
  draft_at: Date;
  created_at: Date;
  deleted_at: Date;
  slug: string;
  updated_at: Date;
  deployed_at: Date;

}
