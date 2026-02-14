import { parentPort } from 'worker_threads';

import { PrismaService } from 'src/adapters/config/prisma.service';
import { LoggerService } from 'src/global/logger/logger.service';
import { HttpException, HttpStatus } from '@nestjs/common';

const prisma = new PrismaService();
const logger = new LoggerService();

parentPort?.on('message', async ({ data, id }) => {

    console.log("\n\n farm  worker  for mapping received data: ", data);

    let farmer;

    if (!data?.project_data?.project_data?.farmer_ID_card_number)
        throw new HttpException(`No Farmer ID card number Provided: `, HttpStatus.BAD_REQUEST);

    // find the farmer with the same ID card number if he exist.
    farmer = await prisma.farmer.findUnique({
        where: {
            farmer_ID_card_number: data?.project_data?.project_data?.farmer_ID_card_number,
        }
    })

    // if No farmer with the same ID card number in the DB, we create the new farmer.
    if (!farmer) {
        farmer = await prisma.farmer.create({
            data: {
                company_id: data?.company_id,
                farmer_name: data?.project_data?.project_data?.farmer_name,
                farmer_contact: data?.project_data?.project_data?.farmer_contact,
                farmer_ID_card_number: data?.project_data?.project_data?.farmer_ID_card_number,
                inspection_date: data?.project_data?.project_data?.date,
                village: data?.project_data?.project_data?.village,
                certification_year: "1970",  // fictive year number to indicate that the farmer hasn't yet been certified.
                inspector_name: data?.project_data?.project_data?.collector_name,
                inspector_contact: "",
                weed_application: "",
                weed_application_quantity: 0,
                pesticide_used: "",
                pesticide_quantity: 0,
                farmer_photos: data?.project_data?.project_data?.farmer_photos,
                council: data?.council,
            }
        })
    }

    // construct the farm object 
    const farmObject = {
        location: data.project_data?.project_data?.location, // Json ?  @default("{}")  @db.JsonB
        farmer_id: farmer?.id ? farmer?.id : data?.project_data?.project_data?.farmer_ID_card_number,// String,

        village: data?.project_data?.project_data?.village,// String
        plantation_creation_date: data?.project_data?.project_data?.plantation_creation_date ? data?.project_data?.project_data?.plantation_creation_date : data?.collected_at,  //DateTime
        farm_image_url: data?.project_data?.project_data?.plantation_photos[0], // String
        estimate_area: !isNaN(data?.project_data?.project_data?.estimated_area) ? +data?.project_data?.project_data?.estimated_area : 0, //Float

        plantation_photos: data?.project_data?.project_data?.plantation_photos // String[]
    }

    try {
        // const result = await prisma.$transaction(async () => {})
        // TODO: you may want to call directly the farmer service to delegate this task to.

        const newFarmData = await prisma.farm.create({
            data: {
                location: farmObject?.location,
                farmer_id: <string>farmer?.id,
                village: farmObject?.village,
                plantation_creation_date: new Date(farmObject?.plantation_creation_date).toISOString(),
                estimate_area: farmObject?.estimate_area,
                plantation_photos: farmObject?.plantation_photos,
                farm_image_url: ""
            }
        });

        // this is to  get the historique of the farms of a specific farmer.
        const farmCoordinates = {
            farm_id: newFarmData?.id,// String
            // location: farmerObject?.location,// Json ?  @default("{}")  @db.JsonB 

            coordinates: data.project_data?.project_data?.coordinates, //Json ?  @default("{}")  @db.JsonB
            collector_name: data.project_data?.project_data?.collector_name // String
        }

        const farmCoordinate = await prisma.farm_coordinates.create({
            data: farmCoordinates
        });

        const result = {
            farm: newFarmData,
            farmCoordinate
        }


        parentPort?.postMessage({ result, id });

    } catch (error) {
        logger.error(`Error inside farm worker \n\n: ${error}`);
        throw new HttpException('Error inside farm worker', HttpStatus.INTERNAL_SERVER_ERROR);
    }
});
