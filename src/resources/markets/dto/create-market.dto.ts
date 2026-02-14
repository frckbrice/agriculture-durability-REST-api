import { $Enums } from '@prisma/client';

export class CreateMarketDto {
    /**
     * example: bon_entree_magazin_url: 'https://bon_entree_magazin_url.com/exfr.pdf'
     */
    bon_entree_magazin_url: string;
    /**
     * example: bordereau_vente_url: 'https://bon_entree_magazin_url.com/exfr.pdf'
     */
    bordereau_vente_url: string;
    /**
     * example: company_id: 'kfdklfsdkfsdfbdvfksvbeiwwri'
     */
    company_id: string;
    /**
     * example:     created_at:"2024-02-10T10:23:000z"'
     */
    created_at: Date;
    /**
     * example:     description:"description of market"
     */
    description: string;
    /**
     * example:     end_date:"2024-02-10T10:23:000z"
     */
    end_date: Date;
    /**
     * example:     location:"nkambe"
     */
    location: string;
    /**
     * example:     market_number:"10"
     */
    market_number: number;
    /**
     * example:     market_type:"cocoa | bananas "
     */
    market_type: string;
    /**
     * example:     start_date:"2024-02-10T10:23:000z "
     */
    start_date: Date;
    /**
     * example:     start_date:"2024-02-10T10:23:000z "
     */
    updated_at: Date;
    /**
     * example:     status:"OPEN | CLOSED"
     */
    status: $Enums.CampaignStatus;
    /**
     * example:     code:"1523"
     */
    code: string;
    /**
     * example:     product_quantity:"400 bags"
     */
    product_quantity: number;
}
