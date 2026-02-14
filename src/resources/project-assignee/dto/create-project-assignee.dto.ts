export class CreateProjectAssigneeDto {

    /**
     * example, agentCode: "1234"
     */
    agentCode: string;
    /**
     * example, projectCodes: ["1234", "4d7d"]
     */
    projectCodes: string[];
    /**
    * example, fullName: atangana
    */
    fullName: string
}
