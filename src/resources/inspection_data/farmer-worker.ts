import { parentPort } from 'worker_threads';

import { readFile } from "fs/promises";
import { join } from 'path';
import { PrismaService } from 'src/adapters/config/prisma.service';

const prisma = new PrismaService();

parentPort?.on('message', async ({ data, id }) => {

    // construct the farmer object

    const farmerObject = {
        company_id: data?.project_data?.company_id,
        farmer_name: data?.project_data.metaData?.farmer_name,
        farmer_contact: data?.project_data.metaData?.farmer_contact,
        farmer_code: data?.project_data.metaData?.farmer_code,
        farmer_ID_card_number: data?.project_data.metaData?.farmer_ID_card_number,
        inspection_date: data?.project_data.metaData?.inspection_date,
        village: data?.project_data.metaData?.village,
        council: data?.project_data.state,
        certification_year: data?.project_data.metaData?.certification_year,
        inspector_name: data?.project_data.metaData?.inspector_name,
        inspector_contact: data?.project_data.metaData?.inspector_contact,
        weed_application: data?.project_data.metaData?.weed_application,
        weed_application_quantity: data?.project_data.metaData?.weed_application_quantity,
        pesticide_used: data?.project_data.metaData?.pesticide_used,
        pesticide_quantity: data?.project_data.metaData?.pesticide_quantity,
        farmer_photos: data?.project_data.metaData?.farmer_photos
    }

    try {
        // TODO: you may want to call directly the farmer service to delegate this task to.
        const newFarmer = await prisma.farmer.create({
            data: farmerObject
        });

        if (typeof newFarmer != 'undefined' && newFarmer) {
            const result = {
                data: newFarmer,
                message: "Farmer created successfully",
                status: 201
            }
            parentPort?.postMessage({ result, id });
        } else {
            const result = {
                data: null,
                message: "Failed to create farmer",
                status: 400
            }
            parentPort?.postMessage({ result, id });
        }


    } catch (error) {
        console.error(`Error inside worker: ${error}`);
    }
});
