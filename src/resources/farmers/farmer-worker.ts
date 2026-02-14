import { parentPort } from 'worker_threads';

import { PrismaService } from 'src/adapters/config/prisma.service';
import { LoggerService } from 'src/global/logger/logger.service';
import { HttpException, HttpStatus } from '@nestjs/common';

const prisma = new PrismaService();
const logger = new LoggerService();

parentPort?.on('message', async ({ data, id }) => {
    console.log("\n\n farmer worker  received this data : ", data);


    if (!data?.project_data.project_data.metaData?.farmer_ID_card_number || !data?.project_data.project_data.metaData?.farmer_name || !data?.project_data?.company_id)
        throw new HttpException(`No Farmer ID card number, or Farmer name or company ID Provided: `, HttpStatus.BAD_REQUEST);

    // construct the farmer object
    const farmerObject = {
        company_id: data?.project_data?.company_id,
        farmer_name: data?.project_data.project_data.metaData?.farmer_name,
        farmer_contact: data?.project_data.project_data.metaData?.farmer_contact,
        // farmer_code: data?.project_data.project_data.metaData?.farmer_code,
        farmer_ID_card_number: data?.project_data.project_data.metaData?.farmer_ID_card_number,
        inspection_date: data?.project_data.project_data.metaData?.inspection_date || new Date().toISOString(),
        village: data?.project_data.project_data.metaData?.village || '',
        certification_year: data?.project_data.project_data.metaData?.certification_year || '1970',
        inspector_name: data?.project_data.project_data.metaData?.inspector_name || "",
        inspector_contact: data?.project_data.project_data.metaData?.inspector_contact || '',
        // weed_application: String(data?.project_data.project_data.metaData?.weed_application_quantity),

        weed_application: data?.project_data.project_data.metaData?.weed_application || '',

        weed_application_quantity: +data?.project_data.project_data.metaData?.weed_application_quantity || 0
        ,
        pesticide_used: data?.project_data.project_data.metaData?.pesticide_used || "",
        pesticide_quantity: +data?.project_data.project_data.metaData?.pesticide_quantity || 0,
        farmer_photos: data?.project_data.project_data.metaData?.farmer_photos || [],
        council: data?.council,
    }

    let result = {};
    try {
        // TODO: you may want  to call directly the farmer service to delegate this task to.
        const newFarmer = await prisma.farmer.create({
            data: farmerObject
        });

        if (typeof newFarmer != 'undefined' && newFarmer) {

            console.log("\n\ndata for farmer saved: ", newFarmer);

            result = {
                data: newFarmer,
                message: "Farmer created successfully",
                status: 201
            }
            // parentPort?.postMessage({ result, id });
        } else {
            result = {
                data: null,
                message: "Failed to create farmer",
                status: 400
            }
        }
        parentPort?.postMessage({ result, id });

    } catch (error) {
        logger.error(`Error inside farmer worker \n\n: ${error}`);
        throw new HttpException('Error inside farmer worker', HttpStatus.INTERNAL_SERVER_ERROR);
    }
});
