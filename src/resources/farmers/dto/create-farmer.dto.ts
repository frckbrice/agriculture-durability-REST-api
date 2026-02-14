export class CreateFarmerDto {
    /**
     * example: company_id : '1234567890ABCDEF'
     */
    company_id: string;
    /**
    * example: farmer_name : 'atango'
    */
    farmer_name: string;
    /**
     * example: farmer_contact : 'atango'
     */
    farmer_contact: string;

    /**
     * example: farmer_ID_card_number : '1425365789'
     */
    farmer_ID_card_number: string;
    /**
     * example: inspection_date : '2024-10-01T12:00:00Z'
     */
    inspection_date: string;
    /**
     * example: village : 'nlang'
     */
    village: string;
    /**
     * example: certification_year : '2023'
     */
    certification_year: string;
    /**
     * example: inspector_name : 'malam'
     */
    inspector_name: string;
    /**
     * example: inspector_contact : '+23765892415'
     */
    inspector_contact: string;
    /**
     * example: weed_application : 'atango'
     */
    weed_application: string;
    /**
     * example: farmer_name : 'atango'
     */
    weed_application_quantity: number;
    /**
     * example: pesticide_used : 'phy-14'
     */
    pesticide_used: string;
    /**
     * example: pesticide_quantity : 15 bags/year
     */
    pesticide_quantity: number;
    /**
     * example: farmer_photos : ['https://image1.png', https://image2.png]
     */
    farmer_photos: string[]
}
