import { Transaction } from '@prisma/client';

export class TransactionEntity implements Transaction {
    created_at: Date;
    date: string;
    date_transmission: string | null;
    driver_name: string | null;

    driver_signature: string | null;
    humidity: number;
    id: string;
    level_of_traceability: string;
    market_number: string;
    min_com_sig: string | null;
    minister_agent_name: string | null;
    net_weight: number;
    number_of_bags: number | null;
    number_of_bags_for_transmission: number | null;
    product_quality: string | null;
    number_of_receipts: string | null;

    receiver_name: string | null;
    sender_name: string | null;
    upload_status: string | null;

    sender_signature: string | null;
    updated_at: Date;
    vehicule_immatriculation_number: string | null;
}
