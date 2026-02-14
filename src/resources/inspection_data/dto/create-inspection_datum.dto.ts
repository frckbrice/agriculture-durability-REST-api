import { JsonValue } from "@prisma/client/runtime/library";
import { IsNotEmpty, IsString } from "class-validator";

export class CreateInspectionDatumDto {
    /**
     * example: project_id: "jdfhdhfskdfhsdshfklsdksdsd"
     */
    @IsNotEmpty()
    @IsString()
    project_id: string;

    /**
     * example: collected_by: "John Doe"
     */
    collected_by: string;

    /**
     * example: project_data: "{"farmer_name": "henry", "farm_ID_Cart": "12345", ...}"
     */
    project_data: JsonValue;
}
