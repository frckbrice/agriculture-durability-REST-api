import { JsonValue } from "@prisma/client/runtime/library";

export class CreateReceiptDto {

     //     /**
     //      * example: market_id: 'cm2w8m9w5000135t63abyp6ae'
     //      */
     //     market_id: string;
     //     /**
     //      * example village: "Nlang"
     //      */
     //     village: string;
     //     /**
     //      * example: farmer_id: 'cm2w8m9w5000135t63abyp6ae'
     //      */
     //     farmer_id: string;
     //     /**
     //      * example date: '2014-11-05'
     //      */
     //     date: string;
     //     /**
     //      * weight (kg): 1000 
     //      */
     //     weight: string;
     //     /**
     //      * example: humidity: '10%'
     //      */
     //     humidity: string;

     //     /**
     //      * example: new_weight : 500
     //      */
     //     net_weight: number;
     //     /**
     //      * agent_name: 'brice avom'
     //      */
     //     agent_name: string;
     //     /**
     //      * example: refraction : '10%'
     //      */
     //     refraction: string;
     //     /**
     //      * example: price_per_kg : '1000'
     //      */
     //     price_per_kg: string;
     //     /**
     //      * example: total_price : 1500000 Xaf
     //      */
     //     total_price: number;
     //     /**
     //      * example: currency : Xaf
     //      */
     //     currency: string;
     //     /**
     //      * example: total_weight : 1500 kg
     //      */
     //     total_weight: string;
     //     /**
     //          * example: salePhotoUrl : [https://agent_signaturesignature.jpg, https://agent_signaturesignature.jpg, ...]
     //          */
     //     salePhotoUrl: string[];
     //     /**
     //          * example: agent_signature : https://agent_signaturesignature.jpg
     //          */
     //     agent_signature: string;
     //     /**
     //      * example: farmer_signature : https://farmer_signaturesignature.jpg
     //      */
     //     farmer_signature: string;
     //     /**
     //      * example: gpsLocation : {"longitude":11.4990567,"latitude":3.8457322}
     //      */
     //     gpsLocation: JsonValue;
     //     /**
     //      * example: product_name : "COCOA"
     //      */

     //     product_name: string;

     date: string;
     farmer_id: string;
     village: string
     gpsLocation: { longitude: number, latitude: number };
     farmer_signature: string;
     agent_signature: string;
     weight: number;
     humidity: number;
     refraction: number;
     net_weight: number;
     price_per_kg: number;
     total_price: number;
     agent_name: string;
     currency: string;
     product_name: string;
     salePhotoUrl: string[];
     market_id: string;
     farmer?:
          {
               farmer_name: string;
               village: string
               farmer_contact: string,
               farmer_ID_card_number: string,
               inspector_contact: string,
               location: string;
          }
}
