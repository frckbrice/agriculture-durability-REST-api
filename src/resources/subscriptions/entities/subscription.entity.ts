export class SubscriptionEntity { } //+


export interface SuccesspaymentType {
    id: string
    status: 'PENDING' | 'FAILED' | 'CANCELED' | 'TIMEOUT' | 'SUCCESS'
    amount: number
    phone?: string
    orderId: string
    current_price_id?: string
}