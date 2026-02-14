import {
    HttpException,
    HttpStatus,
    Injectable,
    OnApplicationBootstrap,
    OnApplicationShutdown,
} from '@nestjs/common'; // Importing necessary decorators and interfaces from NestJS
import { randomUUID } from 'crypto'; // Importing randomUUID function to generate unique IDs
import { join } from 'path'; // Importing join function to create file paths
import { filter, firstValueFrom, fromEvent, map, Observable } from 'rxjs'; // Importing RxJS operators and functions for reactive programming
import { Worker } from 'worker_threads'; // Importing Worker class to create and manage worker threads
import { cwd } from 'node:process';
import { LoggerService } from 'src/global/logger/logger.service';
import { existsSync, mkdirSync } from 'node:fs';
import { Prisma } from '@prisma/client';

@Injectable()
export class FieldWorkerHost implements OnApplicationBootstrap, OnApplicationShutdown {
    private logger = new LoggerService(FieldWorkerHost.name);

    private Farmerworker: Worker; // Worker instance for managing the worker thread

    private messages3$: Observable<{ id: string; result: string }>;

    // Lifecycle hook executed when the application starts
    onApplicationBootstrap() {

        this.Farmerworker = new Worker(join(__dirname, '..', 'farmers', 'farmer-worker'));
        // Creating an observable from the worker's message events
        this.messages3$ = fromEvent(this.Farmerworker, 'message') as Observable<{
            id: string;
            result: string;
        }>;
    }

    // Lifecycle hook executed when the application shuts down
    async onApplicationShutdown() {
        // Terminating the worker thread
        this.Farmerworker.terminate();
    }


    // Method to send a task to the worker thread and get the result
    async storeFarmerData(data: any) {

        console.log("incoming farmer data: ", data)
        const uniqueId = randomUUID(); // Generating a unique ID for the task

        try {
            // Sending a message to the worker thread with the input number and unique ID
            const workerPostmessage = this.Farmerworker.postMessage({
                data: JSON.parse(data),
                id: uniqueId
            });

            // Returning a promise that resolves with the result of the files 
            const returnValue = firstValueFrom(
                // Convert the observable to a promise
                this.messages3$.pipe(
                    // Filter messages to only include those with the matching unique ID
                    filter(({ id }) => id === uniqueId),
                    // Extract the result from the message
                    map(({ result }) => result),
                ),
            );

            return returnValue;
        } catch (error) {
            this.logger.error(
                `Error creating farmer data for inspection \n\n ${error}`,
                FieldWorkerHost.name,
            );
            throw new HttpException('Error creating farmer data for inspection', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


}