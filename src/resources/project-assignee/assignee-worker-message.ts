import { parentPort } from 'worker_threads';

import { PrismaService } from 'src/adapters/config/prisma.service';
import { LoggerService } from 'src/global/logger/logger.service';
import { HttpException, HttpStatus } from '@nestjs/common';
import { CampaignStatus, Farmer, Market, Prisma, Project, ProjectStatus, } from '@prisma/client';
import { CompanyType } from '../companies/entities/company.entity';

const logger = new LoggerService();
const prismaService = new PrismaService();
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const getAllManagementProjects = async (uuidsList: string[], prismaService: PrismaService, company_id: string) => {

    try {
        const projects = await prismaService.project.findMany({
            where: {
                code: {
                    in: uuidsList
                },
                status: ProjectStatus.DEPLOYED,
                company_id
            },
            select: {
                // status: true,
                type: true,
                id: true,
                title: true,
                project_structure: true,
                code: true,
                company_id: true,
                city: true
            },
        });

        console.log("\n\n inside worker service. getAllManagementProjects: received uuidLists", projects, "\n\n");
        if (typeof projects != 'undefined' && projects.length) {

            return {
                data: projects,
                status: HttpStatus.OK,
                message: "sucessfully fetched projects assigned to this agent",
            }
        }

        return {
            data: [],
            status: HttpStatus.BAD_REQUEST,
            message: "Failed to fetch projects assigned to this agent",
        }
    } catch (e) {
        console.error('Error fetching projects: ', e);
        throw new HttpException('Failed to fetch projects', HttpStatus.INTERNAL_SERVER_ERROR);
    }
};

const getAllTrainingProjects = async (uuidsList: string[], prismaService: PrismaService, company_id: string) => {

    try {
        const trainings = await prismaService.training.findMany({
            where: {
                code: {
                    in: uuidsList
                },
                status: ProjectStatus.DEPLOYED,
                company_id
            },
            select: {
                status: true,
                id: true,
                title: true,
                company_id: true,
                location: true,
                code: true,
                modules: true,
            },
        });

        console.log("\n\n inside worker service. getAllTrainingProjects: received uuidLists", trainings, "\n\n");
        if (typeof trainings != 'undefined' && trainings.length) {

            return {
                data: trainings,
                status: HttpStatus.OK,
                message: "sucessfully fetched trainings assigned to this agent",
            }
        }

        return {
            data: [],
            status: HttpStatus.BAD_REQUEST,
            message: "Failed to fetch trainings assigned to this agent",
        }
    } catch (e) {
        logger.error('Error fetching triainig trainings: ', e);
        throw new HttpException('Failed to fetch triainig trainings', HttpStatus.INTERNAL_SERVER_ERROR);
    }
};

const getAllMarketProjects = async (uuidsList: string[], prismaService: PrismaService, company_id: string) => {

    try {
        const markets = await prismaService.market.findMany({
            where: {
                AND: [
                    {
                        code: {
                            in: uuidsList
                        }
                    }, // sselect market by uuid
                    { company_id }, //select current user connected company market
                    { status: CampaignStatus.OPEN }, // selct open market.
                    // { start_date: { gte: currentDate } }
                ]
            },

        });
        console.log("\n\n inside worker service. getAllMarketProjects: received uuidLists", markets, "\n\n");
        if (markets?.length) {
            // Await all promises returned by the map function
            const marketData = await Promise.all(
                markets.map(async (market: Market) => {
                    const { company_id } = market;
                    const company = await prismaService.company.findUnique({
                        where: { id: company_id },
                        select: { name: true, logo: true }
                    });

                    return {
                        company_id: market?.company_id,
                        market_number: market?.id,
                        start_date: market?.start_date,
                        end_date: market?.end_date,
                        status: market?.status,
                        price_of_day: market?.price_of_theday,
                        location: market?.location,
                        type_of_market: market?.type_of_market,
                        company_name: company?.name,
                        company_logo: company?.logo ?? '',
                        provider: market?.supplier
                    };
                })
            );

            return {
                data: marketData,
                status: 200,
                message: `market fetched successfully`,
            };
        } else {
            return {
                data: [],
                status: 400,
                message: `Failed to fetch market`,
            };
        }
    } catch (e) {
        console.error('Error fetching projects: ', e);
        throw new HttpException('Failed to fetch projects', HttpStatus.INTERNAL_SERVER_ERROR);
    }
};


async function optimizedBulkFetchProject(
    uuidLists: string[],
    company_id: string,
) {
    return await prismaService.$transaction(async (tx: PrismaService) => {

        console.log("\n\n inside worker service: received uuidLists", uuidLists, "\n\n");
        // get all the projects based on their provided codes
        const [managementProjects, trainingProjects, marketProjects] = await Promise.all([
            getAllManagementProjects(uuidLists, tx, company_id),
            getAllTrainingProjects(uuidLists, tx, company_id),
            getAllMarketProjects(uuidLists, tx, company_id),
        ]);

        // combine all the projects in a single list 
        const allProjects = {
            inspections: managementProjects.data.filter((project: Project) =>
                project.type?.toString().toLowerCase().includes('_inspection')
            ) || [],
            mappings: managementProjects.data.filter(project =>
                project?.type?.toLowerCase?.()?.includes('mapping')) || [],
            trainings: trainingProjects.data || [],
            markets: marketProjects.data || [],
        }

        return {
            data: allProjects,
            status: HttpStatus.OK,
            message: "Successfully fetched projects assigned to this agent",
        };
    }, {
        maxWait: 20000, // Maximum time to wait for transaction
        timeout: 30000  // Maximum time for transaction to complete
    });
}

// Worker implementation
parentPort?.on('message', async ({ data, id }) => {
    try {
        console.log('\n\n worker received data: ', JSON.stringify(data ?? {}, null, 2), '\n\n');
        // remove duplicate dasssignees

        const result = await optimizedBulkFetchProject(data?.uuidLists, data?.company_id);

        parentPort?.postMessage({
            success: true,
            result,
            id
        });
    } catch (error) {
        logger.error('Bulk creation failed:', error);

        // Attempt recovery or retry logic here if needed
        parentPort?.postMessage({
            success: false,
            error: error.message,
            id
        });
    }
});
