import { Prisma } from "@prisma/client";

export class Receipt implements Prisma.ReceiptCreateInput {
    agent_name: string;
    agent_signature: string;
    created_at?: string | Date | undefined;
    currency: string;
    date: string | Date;
    farmer: Prisma.FarmerCreateNestedOneWithoutReceiptsInput;
    farmer_signature: string;
    gpsLocation: Prisma.NullTypes.JsonNull | Prisma.InputJsonValue;
    humidity: string;
    id?: string | undefined;
    market: Prisma.MarketCreateNestedOneWithoutReceiptsInput;
    net_weight: number;
    price_per_kg: string;

    product_name: string;
    refraction: string;
    salePhotoUrl?: Prisma.ReceiptCreatesalePhotoUrlInput | string[] | undefined;
    total_price: number;
    total_weight: string;
    updated_at?: string | Date | undefined;
    village: string;
    weight: string;
}
