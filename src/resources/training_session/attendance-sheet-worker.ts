import { parentPort } from 'worker_threads';

import { PrismaService } from 'src/adapters/config/prisma.service';
import { LoggerService } from 'src/global/logger/logger.service';
import { HttpException, HttpStatus } from '@nestjs/common';
import { Participants } from '@prisma/client';

const prisma = new PrismaService();
const logger = new LoggerService();

parentPort?.on('message', async ({ data, id }) => {


    console.log("\n\attendance-sheet  worker  received  data: ", data);
    // construct the farmer object 

    const attendance_sheet = {
        date: data?.project_data?.date,
        title: data?.project_data?.title,
        modules: data?.project_data?.modules,
        trainers: data?.project_data?.trainers,
        location: data?.project_data?.location,
        report_url: data?.project_data?.report_url,
        photos: data?.project_data?.photos,

        training_id: data?.project_data?.training_id,
    }

    const participantsObj = data?.project_data?.participants;

    console.log("title of the training: ", attendance_sheet.title);
    console.log("list of participants\n : ", participantsObj);


    try {
        const attendanceData = await prisma.attendance_sheet.create({
            data: attendance_sheet
        });

        if (attendanceData) {
            const participantss = participantsObj.map((participant: Participants) => {
                return {
                    ...participant,
                    attendence_sheet_id: <string>attendanceData.id
                }
            });

            const participants = await prisma.participants.createMany({
                data: participantss
            });

            const result = {
                attendanceData,
                participants
            };

            parentPort?.postMessage({ result, id });
        } else {
            parentPort?.postMessage({
                result: null,
                id
            });
        }

        /*
        For very large datasets, we might want to chunk the participants:

            async function createInChunks(attendanceData, participants, chunkSize = 100) {
            const chunks = [];
            for (let i = 0; i < participants.length; i += chunkSize) {
                chunks.push(participants.slice(i, i + chunkSize));
            }

            for (const chunk of chunks) {
                await prisma.participants.createMany({
                    data: chunk.map(p => ({
                        ...p,
                        attendence_sheet_id: attendanceData.id
                    }))
                });
            }
        }
        */

    } catch (error) {
        logger.error(`Error inside  attendance-sheet worker \n\n: ${error}`);
        throw new HttpException('Error inside attendance-sheet worker', HttpStatus.INTERNAL_SERVER_ERROR);
    }
});
