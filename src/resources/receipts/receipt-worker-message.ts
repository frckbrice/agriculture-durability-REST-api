import { parentPort } from 'worker_threads';

import { PrismaService } from 'src/adapters/config/prisma.service';
import { LoggerService } from 'src/global/logger/logger.service';
import { HttpException, HttpStatus } from '@nestjs/common';
import { ReceiptService } from './receipts.service';
import { Farmer, Prisma, Receipt } from '@prisma/client';
import { CreateReceiptDto } from './dto/create-receipt.dto';

const prismaService = new PrismaService();
const logger = new LoggerService();
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));


// async function createOne(

//     createReceiptDto: any,
//     company_id: string
// ): Promise<{ data: Receipt | null, status: number, message: string } | undefined> {

//     // avoid creating receipt twice
//     let farmer: any, result: any;

//     if (!createReceiptDto?.agent_signature || !createReceiptDto?.farmer_signature) {
//         throw new HttpException(`Invalid receipt, No signature provided`, HttpStatus.BAD_REQUEST);
//     }
//     console.log('\n\n  inside create one after validation:\n\n ');
//     try {
//         if (createReceiptDto?.farmer?.farmer_ID_card_number) {

//             const { farmer, ...res } = createReceiptDto;
//             result = await prismaService.$transaction(async (tx: typeof prismaService) => {
//                 console.log('\n\n  inside create inside transactin:\n\n ');
//                 const newFarmer = await tx.farmer.create({
//                     data: {
//                         farmer_ID_card_number: farmer?.farmer_ID_card_number,
//                         farmer_name: farmer?.farmer_name,
//                         farmer_contact: farmer?.farmer_contact,
//                         inspector_contact: farmer?.inspector_contact,
//                         village: farmer?.village,
//                         inspector_name: res?.agent_name,
//                         council: farmer?.location,
//                         certification_year: '1970', // mock year. set to this if no year of certif provided.
//                         company_id,
//                         inspection_date: res?.date,
//                         pesticide_quantity: 0,
//                         pesticide_used: "",
//                         weed_application: "",
//                         weed_application_quantity: 0,
//                     }
//                 });

//                 console.log("farmer created: ", newFarmer);

//                 const result = await tx.receipt.create({
//                     data: {
//                         agent_name: res?.agent_name,
//                         agent_signature: res?.agent_signature,
//                         farmer_signature: res?.farmer_signature,
//                         date: res?.date,
//                         farmer_id: <string>newFarmer?.id,
//                         village: <string>newFarmer?.village,
//                         currency: res?.currency,
//                         gpsLocation: res?.gpsLocation,
//                         humidity: String(res?.humidity),
//                         market_id: res?.market_id,
//                         net_weight: res?.net_weight,
//                         price_per_kg: String(res?.price_per_kg),
//                         product_name: res?.product_name,
//                         refraction: String(res?.refraction),
//                         salePhotoUrl: res?.salePhotoUrl,
//                         total_price: res?.total_price,
//                         weight: String(res?.weight),
//                     }
//                 });

//                 console.log("receipt created: ", result);

//                 return result;
//             })

//         } else if (createReceiptDto?.farmer_id) {
//             result = await this.prismaService.receipt.create({
//                 data: {
//                     agent_name: createReceiptDto?.agent_name,
//                     agent_signature: createReceiptDto?.agent_signature,
//                     farmer_signature: createReceiptDto?.farmer_signature,
//                     date: createReceiptDto?.date,
//                     farmer_id: createReceiptDto?.farmer_id,
//                     village: createReceiptDto?.village,
//                     currency: createReceiptDto?.currency,
//                     gpsLocation: createReceiptDto?.gpsLocation,
//                     humidity: String(createReceiptDto?.humidity),
//                     market_id: createReceiptDto?.market_id,
//                     net_weight: createReceiptDto?.net_weight,
//                     price_per_kg: String(createReceiptDto?.price_per_kg),
//                     product_name: createReceiptDto?.product_name,
//                     refraction: String(createReceiptDto?.refraction),
//                     salePhotoUrl: createReceiptDto?.salePhotoUrl,
//                     total_price: createReceiptDto?.total_price,
//                     weight: String(createReceiptDto?.weight),
//                 }
//             });
//         }
//         console.log('\n\n single receipt inside create one: ', result);
//         if (!result) {
//             return {
//                 data: null,
//                 status: HttpStatus.BAD_REQUEST,
//                 message: `Failed to create receipt`,
//             };

//         }
//         return {
//             data: result,
//             status: HttpStatus.CREATED,
//             message: `receipt created successfully`,
//         };

//     } catch (error) {
//         if (error instanceof Prisma.PrismaClientValidationError) {
//             logger.error(
//                 `Error while creating receipt ${error.name}: Validation error \n\n ${error}`,
//                 ReceiptService.name,
//             );
//             return { data: null, status: HttpStatus.BAD_REQUEST, message: "Error processing receipt" };
//         }

//     }
// }

// parentPort?.on('message', async ({ data, id }) => {
//     console.log("\n\n Worker received this data:", data);

//     const successfulReceipts: CreateReceiptDto[] = [];
//     const failedReceipts: CreateReceiptDto[] = [];

//     async function processReceipt(receipt: CreateReceiptDto, company_id: string, retries = 3) {
//         for (let attempt = 1; attempt <= retries; attempt++) {
//             try {
//                 delay(500);
//                 const createdReceipt = await createOne(receipt, company_id);
//                 if (createdReceipt?.data) {
//                     successfulReceipts.push(createdReceipt?.data as any);
//                     return; // Exit loop on success
//                 } else {
//                     throw new Error("Unknown error during receipt creation");
//                 }
//             } catch (error) {
//                 console.error(`Attempt ${attempt} failed for receipt:`, receipt, error);

//                 if (attempt === retries) {
//                     failedReceipts.push(receipt);
//                 } else {
//                     console.log(`Retrying (${attempt}/${retries})...`);
//                 }
//             }
//         }
//     }

//     for (const receipt of data?.receipts || []) {
//         setTimeout(async () => {
//             await processReceipt(receipt, data?.company_id);
//         }, 1000);
//     }


//     console.log("\n\n Receipts stored successfully:", successfulReceipts);
//     console.log("\n\n Failed receipts (after retries):", failedReceipts);

//     parentPort?.postMessage({ successfulReceipts, failedReceipts, id });
// });



// async function optimizedBulkCreate(
//     receiptsData: any[],
//     company_id: string,
//     prisma: PrismaService
// ) {
//     return await prisma.$transaction(async (tx) => {
//         // 1. Extract unique farmers by ID card number
//         const uniqueFarmers = Array.from(
//             new Map(
//                 receiptsData.map(item => [
//                     item.farmer.farmer_ID_card_number,
//                     {
//                         farmer_ID_card_number: item.farmer.farmer_ID_card_number,
//                         farmer_name: item.farmer.farmer_name,
//                         farmer_contact: item.farmer.farmer_contact,
//                         inspector_contact: item.farmer.inspector_contact,
//                         village: item.farmer.village,
//                         inspector_name: item.agent_name,
//                         council: item.farmer.location,
//                         certification_year: '1970',
//                         company_id,
//                         inspection_date: item.date,
//                         pesticide_quantity: 0,
//                         pesticide_used: "",
//                         weed_application: "",
//                         weed_application_quantity: 0,
//                     }
//                 ])
//             ).values()
//         );

//         // 2. Bulk create farmers
//         const createdFarmers = await tx.farmer.createMany({
//             data: uniqueFarmers,
//             skipDuplicates: true, // Skip if farmer already exists
//         });

//         // 3. Get all created farmers to map IDs
//         const farmerRecords = await tx.farmer.findMany({
//             where: {
//                 farmer_ID_card_number: {
//                     in: uniqueFarmers.map(f => f.farmer_ID_card_number)
//                 }
//             }
//         });

//         // 4. Create a lookup map for farmers
//         const farmerMap = new Map(
//             farmerRecords.map(farmer => [farmer.farmer_ID_card_number, farmer])
//         );

//         // 5. Prepare receipt records
//         const receiptRecords = receiptsData.map(item => ({
//             agent_name: item.agent_name,
//             agent_signature: item.agent_signature,
//             farmer_signature: item.farmer_signature,
//             date: item.date,
//             farmer_id: farmerMap.get(item.farmer.farmer_ID_card_number)?.id!,
//             village: item.farmer.village,
//             currency: item.currency,
//             gpsLocation: item.gpsLocation,
//             humidity: String(item.humidity),
//             market_id: item.market_id,
//             net_weight: item.net_weight,
//             price_per_kg: String(item.price_per_kg),
//             product_name: item.product_name,
//             refraction: String(item.refraction),
//             salePhotoUrl: Array.isArray(item.salePhotoUrl) ? item.salePhotoUrl : [],
//             total_price: item.total_price,
//             weight: String(item.weight),
//         }));

//         // 6. Bulk create receipts
//         const createdReceipts = await tx.receipt.createMany({
//             data: receiptRecords
//         });

//         return {
//             farmersCreated: createdFarmers.count,
//             receiptsCreated: createdReceipts.count
//         };
//     });
// }

// async function optimizedBulkCreate(
//     receiptsData: any[],
//     company_id: string,
//     prisma: PrismaService
// ) {
//     return await prisma.$transaction(async (tx) => {

//         // 1. Extract and prepare unique farmers
//         const uniqueFarmers = Array.from(
//             new Map(
//                 receiptsData.map(item => [
//                     item?.farmer?.farmer_ID_card_number,
//                     {
//                         farmer_ID_card_number: item?.farmer?.farmer_ID_card_number,
//                         farmer_name: item?.farmer?.farmer_name,
//                         farmer_contact: item?.farmer?.farmer_contact,
//                         inspector_contact: item?.farmer?.inspector_contact,
//                         village: item?.farmer?.village,
//                         inspector_name: item.agent_name,
//                         council: item?.farmer?.location,
//                         certification_year: '1970',
//                         company_id,
//                         inspection_date: item.date,
//                         pesticide_quantity: 0,
//                         pesticide_used: "",
//                         weed_application: "",
//                         weed_application_quantity: 0,
//                     }
//                 ])
//             ).values()
//         );



//         // 2. Create farmers with verification
//         const existingFarmers = await tx.farmer.findMany({
//             where: {
//                 farmer_ID_card_number: {
//                     in: uniqueFarmers.map(f => f.farmer_ID_card_number)
//                 }
//             }
//         });

//         const existingFarmerIds = new Set(existingFarmers.map(f => f.farmer_ID_card_number));
//         const farmersToCreate = uniqueFarmers.filter(f => !existingFarmerIds.has(f.farmer_ID_card_number));

//         let createdFarmers;
//         if (farmersToCreate.length > 0) {
//             createdFarmers = await tx.farmer.createMany({
//                 data: farmersToCreate
//             });

//             // Verify all farmers were created
//             const verifyFarmers = await tx.farmer.count({
//                 where: {
//                     farmer_ID_card_number: {
//                         in: farmersToCreate.map(f => f.farmer_ID_card_number)
//                     }
//                 }
//             });

//             if (verifyFarmers !== farmersToCreate.length) {
//                 throw new Error('Failed to create all farmers');
//             }
//         }

//         // 3. Get all farmers (both existing and newly created)
//         const allFarmers = await tx.farmer.findMany({
//             where: {
//                 farmer_ID_card_number: {
//                     in: uniqueFarmers.map(f => f.farmer_ID_card_number)
//                 }
//             }
//         });

//         // 4. Create farmer lookup map
//         const farmerMap = new Map(
//             allFarmers.map(farmer => [farmer.farmer_ID_card_number, farmer])
//         );

//         // 5. Prepare receipt records and check for duplicates
//         const receiptRecords = receiptsData.map(item => {
//             const farmerId = farmerMap.get(item.farmer?.farmer_ID_card_number)?.id || item?.farmer_id;
//             if (!farmerId) {
//                 throw new Error(`No farmer found for ID card: ${item.farmer.farmer_ID_card_number}`);
//             }

//             return {
//                 agent_name: item.agent_name,
//                 agent_signature: item.agent_signature,
//                 farmer_signature: item.farmer_signature,
//                 date: item.date,
//                 farmer_id: farmerId,
//                 village: item.farmer.village,
//                 currency: item.currency,
//                 gpsLocation: item.gpsLocation,
//                 humidity: String(item.humidity),
//                 market_id: item.market_id,
//                 net_weight: item.net_weight,
//                 price_per_kg: String(item.price_per_kg),
//                 product_name: item.product_name,
//                 refraction: String(item.refraction),
//                 salePhotoUrl: Array.isArray(item.salePhotoUrl) ? item.salePhotoUrl : [],
//                 total_price: item.total_price,
//                 weight: String(item.weight),
//             };
//         });

//         // Check for existing receipts to avoid duplicates
//         const existingReceipts = await tx.receipt.findMany({
//             where: {
//                 AND: [
//                     {
//                         farmer_id: {
//                             in: receiptRecords.map(r => r.farmer_id)
//                         }
//                     },
//                     {
//                         date: {
//                             in: receiptRecords.map(r => r.date)
//                         }
//                     },
//                     {
//                         weight: {
//                             in: receiptRecords.map(r => r.weight)
//                         }
//                     },
//                     {
//                         total_price: {
//                             in: receiptRecords.map(r => r.total_price)
//                         }
//                     }
//                 ]
//             },
//             select: {
//                 farmer_id: true,
//                 date: true,
//                 weight: true,
//                 total_price: true
//             }
//         });


//         // Create a unique key for each receipt
//         const getReceiptKey = (receipt: any) =>
//             `${receipt.farmer_id}-${receipt.date}-${receipt.weight}-${receipt.total_price}`;

//         // Create a Set of existing receipt keys
//         const existingReceiptKeys = new Set(
//             existingReceipts.map(getReceiptKey)
//         );

//         // Filter out duplicates
//         const uniqueReceiptRecords = receiptRecords.filter(
//             record => !existingReceiptKeys.has(getReceiptKey(record))
//         );

//         // Only create receipts if there are unique ones
//         let createdReceipts = { count: 0 };
//         if (uniqueReceiptRecords.length > 0) {
//             createdReceipts = await tx.receipt.createMany({
//                 data: uniqueReceiptRecords,
//                 skipDuplicates: true
//             });
//         }

//         // Verify newly created receipts 
//         const verifyReceipts = await tx.receipt.findMany({
//             where: {
//                 AND: [
//                     {
//                         farmer_id: {
//                             in: allFarmers.map(f => f.id)
//                         }
//                     },
//                     {
//                         date: {
//                             in: uniqueReceiptRecords.map(r => r.date)
//                         }
//                     },
//                     {
//                         created_at: {
//                             gte: new Date(Date.now() - 5000) // created 5sec ago
//                         }
//                     }
//                 ]
//             }
//         });

//         // Add logging for debugging
//         console.log('Total receipts submitted:', receiptsData.length);
//         console.log('Unique receipts to create:', uniqueReceiptRecords.length);
//         console.log('Existing receipts found:', existingReceipts.length);
//         console.log('Actually created receipts:', createdReceipts.count);
//         console.log('Verified receipts:', verifyReceipts.length);

//         // Only verify against the number of unique receipts we tried to create
//         if (verifyReceipts.length !== uniqueReceiptRecords.length) {
//             throw new Error('Failed to create all unique receipts');
//         }

//         return {
//             farmersCreated: farmersToCreate?.length ?? 0,
//             totalFarmers: allFarmers.length,
//             receiptsCreated: createdReceipts.count,
//             duplicatesSkipped: receiptsData.length - uniqueReceiptRecords.length,
//             success: true,
//         };
//     }
//         , {
//             maxWait: 20000, // Maximum time to wait for transaction
//             timeout: 30000  // Maximum time for transaction to complete
//         }
//     );
// }

async function optimizedBulkCreate(
    receiptsData: any[],
    company_id: string,
    prisma: PrismaService
) {
    return await prisma.$transaction(async (tx) => {

        // 1. Extract and prepare unique farmers (only from items that have farmer object)
        const farmersData = receiptsData.filter(item => item?.farmer && typeof item.farmer === 'object');

        const farmersToBeCreatedMap = new Map(
            farmersData.map(item => [
                item.farmer.farmer_ID_card_number,
                {
                    farmer_ID_card_number: item.farmer.farmer_ID_card_number,
                    farmer_name: item.farmer.farmer_name,
                    farmer_contact: item.farmer.farmer_contact,
                    inspector_contact: item.farmer.inspector_contact,
                    village: item.farmer.village,
                    inspector_name: item.agent_name,
                    council: item.farmer.location,
                    certification_year: '1970',
                    company_id,
                    inspection_date: item.date,
                    pesticide_quantity: 0,
                    pesticide_used: "",
                    weed_application: "",
                    weed_application_quantity: 0,
                }
            ])
        )
        const uniqueFarmers = Array.from(farmersToBeCreatedMap.values());
        const newFarmerIds = Array.from(farmersToBeCreatedMap.keys());


        // 2. Create farmers with verification (only if we have farmers to create)
        let allFarmers: Farmer[] = [];
        let existingFarmers: Farmer[] = [];
        if (uniqueFarmers.length > 0) {
            existingFarmers = await tx.farmer.findMany({
                where: {
                    farmer_ID_card_number: {
                        in: uniqueFarmers.map(f => f.farmer_ID_card_number) // get all the existing farmers with ID card number in this list
                    }
                }
            });

            let existingFarmerIds = new Set(existingFarmers.map(f => f.farmer_ID_card_number)); // remove duplicates in the id cards list of existing farmers from the provided list

            const farmersToCreate = uniqueFarmers.filter(f => !existingFarmerIds.has(f.farmer_ID_card_number)); // remove the existing farmers from the provided list by their ID card number

            if (farmersToCreate.length > 0) {
                await tx.farmer.createMany({   // we re-create only non existing farmers
                    data: farmersToCreate
                });

                // Verify all farmers were created
                const verifyFarmers = await tx.farmer.count({
                    where: {
                        farmer_ID_card_number: {
                            in: farmersToCreate.map(f => f.farmer_ID_card_number)
                        }
                    }
                });

                if (verifyFarmers !== farmersToCreate.length) {
                    throw new Error('Failed to create all farmers');
                }
            }

            // 3. Get just created farmers 
            allFarmers = await tx.farmer.findMany({
                where: {
                    farmer_ID_card_number: {
                        in: newFarmerIds
                    },
                    created_at: {
                        gte: new Date(Date.now() - 5000) // created in last 5 seconds
                    }
                }
            });
            console.log('\n\n newly created allFarmers: ', allFarmers, '\n\n');
            existingFarmerIds = new Set([...existingFarmerIds, ...allFarmers?.map(f => f.farmer_ID_card_number)]);
        }

        // 4. Create farmer lookup map
        const farmerMap = new Map(  // we concatenate the existing farmers and the newly created farmers to create the Map object.
            [...allFarmers, ...existingFarmers].map(farmer => [farmer.farmer_ID_card_number, farmer]) // thi avoid creating trying oto create a receipt for only newly created farmers but for all those involved in the receipts.
        );

        // 5. Prepare receipt records and check for duplicates
        const receiptRecords = receiptsData.map(item => {
            let farmerId;

            // Handle the case where we have direct farmer_id
            if (item.farmer_id && typeof item.farmer_id === 'string') {
                farmerId = item?.farmer_id;
                // console.log('\n\n newly farmerId: ', farmerId, '\n\n');
            }

            // Handle the case where we have a farmer object
            else if (item?.farmer && typeof item?.farmer === 'object') {
                farmerId = farmerMap.get(item?.farmer?.farmer_ID_card_number)?.id;
                // console.log('\n\n newly farmerMap get farmerId: ', farmerId, '\n\n');
                if (!farmerId) {
                    throw new Error(`No farmer found for ID card: ${item?.farmer?.farmer_ID_card_number}`);
                }
            } else {
                throw new Error(`No valid farmer information found in item: ${JSON.stringify(item)}`);
            }

            // Use the farmer object if it exists, otherwise use empty values
            // const farmerData = item?.farmer && typeof item?.farmer === 'object' ? item?.farmer : {};


            return {
                agent_name: item?.agent_name,
                agent_signature: item?.agent_signature,
                farmer_signature: item?.farmer_signature,
                date: item.date,
                farmer_id: farmerId,
                village: item?.village || "",
                currency: item.currency,
                gpsLocation: item.gpsLocation,
                humidity: String(item.humidity),
                market_id: item.market_id,
                net_weight: item.net_weight,
                price_per_kg: String(item.price_per_kg),
                product_name: item.product_name,
                refraction: String(item.refraction),
                salePhotoUrl: Array.isArray(item.salePhotoUrl) ? item.salePhotoUrl : [],
                total_price: item.total_price,
                weight: String(item.weight),
            };
        });


        // Check for existing receipts to avoid duplicates
        const existingReceipts = await tx.receipt.findMany({
            where: {
                AND: [
                    {
                        farmer_id: {
                            in: receiptRecords.map(r => r.farmer_id)
                        }
                    },
                    {
                        weight: {
                            in: receiptRecords.map(r => r.weight)
                        }
                    },
                    {
                        total_price: {
                            in: receiptRecords.map(r => r.total_price)
                        }
                    },
                    {
                        agent_name: {
                            in: receiptRecords.map(r => r.agent_name)
                        }
                    },
                    {
                        date: {
                            in: receiptRecords.map(r => r.date)
                        }
                    },
                ]
            },
            select: {
                farmer_id: true,
                date: true,
                weight: true,
                total_price: true,
                agent_name: true,
                farmer_signature: true,
                agent_signature: true,
                gpsLocation: true,
            }
        });

        // Create a unique key for each receipt
        const getReceiptKey = (receipt: any) =>
            `${receipt?.farmer_id}-${receipt?.date}-${receipt?.weight}-${receipt?.total_price}`;

        // Create a Set of existing receipt keys
        const existingReceiptKeys = new Set(
            existingReceipts.map(getReceiptKey)
        );

        // Find common receipts (present in both arrays)
        const uniqueReceiptRecords = receiptRecords?.filter(r => !existingReceipts?.some(e =>
            r.agent_name === e.agent_name &&
            r.date === e.date &&
            r.farmer_id === e.farmer_id &&
            r.weight === e.weight &&
            r.total_price === e.total_price &&
            r.farmer_signature === e.farmer_signature &&
            r.agent_signature === e.agent_signature &&
            r.gpsLocation === e.gpsLocation
        ));


        // Only create receipts if there are unique ones
        let createdReceipts = { count: 0 };
        if (uniqueReceiptRecords.length > 0) {
            createdReceipts = await tx.receipt.createMany({
                data: uniqueReceiptRecords,
                skipDuplicates: true
            });
        }

        // Get all farmer IDs for verification
        const allFarmerIds = [...new Set(receiptRecords.map(r => r.farmer_id))];

        // Verify newly created receipts 
        const verifyReceipts = await tx.receipt.findMany({
            where: {
                AND: [
                    {
                        farmer_id: {
                            in: allFarmerIds
                        }
                    },
                    {
                        date: {
                            in: uniqueReceiptRecords.map(r => r.date)
                        }
                    },
                    {
                        created_at: {
                            gte: new Date(Date.now() - 5000) // created 5sec ago
                        }
                    }
                ]
            }
        });

        // Add logging for debugging
        console.log('Total receipts submitted:', receiptsData.length);
        console.log('Unique receipts to create:', uniqueReceiptRecords.length);
        console.log('Existing receipts found:', existingReceipts.length);
        console.log('Actually created receipts:', createdReceipts.count);
        console.log('Verified receipts:', verifyReceipts.length);
        console.log('Unique Farmers:', uniqueFarmers.length);
        console.log('AllFarmers.:', allFarmers.length);

        // Only verify against the number of unique receipts we tried to create
        if (verifyReceipts.length !== uniqueReceiptRecords.length) {
            throw new Error('Failed to create all unique receipts');
        }

        return {
            farmersCreated: uniqueFarmers.length - (allFarmers.length - uniqueFarmers.length),
            totalFarmers: allFarmers.length,
            receiptsCreated: createdReceipts.count,
            duplicatesSkipped: receiptsData.length - uniqueReceiptRecords.length,
            success: true,
        };
    }, {
        maxWait: 20000, // Maximum time to wait for transaction
        timeout: 30000  // Maximum time for transaction to complete
    });
}

// Worker implementation
parentPort?.on('message', async ({ data, id }) => {
    try {
        // console.log('\n\n worker received data: ', JSON.stringify(data.receipts ?? [], null, 2), '\n\n');
        // remove duplicate receipts
        data.receipts = data.receipts?.reduce((acc: CreateReceiptDto[], item: CreateReceiptDto) => {
            if (!acc.some(
                i => i.date === item.date
                    && i.weight === item.weight
                    && i.total_price === item.total_price
                    && (i.farmer?.farmer_ID_card_number === item.farmer?.farmer_ID_card_number || item?.farmer_id === item?.farmer_id)
                    && i.agent_name === item.agent_name
                    && i.farmer_signature === item.farmer_signature
                    && i.agent_signature === item.agent_signature
            )) {
                acc.push(item);
            }
            return acc;
        }, []);
        const result = await optimizedBulkCreate(data.receipts, data.company_id, prismaService);

        if (!result.success || result.receiptsCreated !== data.receipts.length) {
            throw new Error('Data creation incomplete');
        }

        parentPort?.postMessage({
            success: true,
            result,
            id
        });
    } catch (error) {
        console.error('Bulk creation failed:', error);

        // Attempt recovery or retry logic here if needed
        parentPort?.postMessage({
            success: false,
            error: error.message,
            id
        });
    }
});
