import { JsonValue } from "@prisma/client/runtime/library";

export class InspectionDatum {

    project_id: string;

    collected_by: string;

    project_data: JsonValue;

    created_at: Date;

    updated_at: Date;
}
