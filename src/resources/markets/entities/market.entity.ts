import { Market, $Enums, CampaignStatus } from "@prisma/client";

export class MarketEntity implements Market {
    supplier: string;
    bon_entree_magazin_url: string;
    bordereau_vente_url: string;
    company_id: string;
    created_at: Date;
    description: string;
    end_date: Date;
    id: string;
    location: string;
    market_number: number;
    market_type: string;
    start_date: Date;
    updated_at: Date;
    status: $Enums.CampaignStatus;
    code: string;
    product_quantity: number;
    campaign_id: string;
    type_of_market: $Enums.MarketType;
    price_of_theday: number;
    accompanying_url: string;
    transmission_url: string;
    provider: string;
}
