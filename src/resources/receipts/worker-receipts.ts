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

import { LoggerService } from 'src/global/logger/logger.service';
import { CreateReceiptDto } from './dto/create-receipt.dto';



@Injectable()
export class ReceiptWorker implements OnApplicationBootstrap, OnApplicationShutdown {
    private logger = new LoggerService(ReceiptWorker.name);

    private receiptWorker: Worker; // Worker instance for managing the worker thread

    private messages3$: Observable<{ id: string; result: string }>;

    // Lifecycle hook executed when the application starts
    onApplicationBootstrap() {

        this.receiptWorker = new Worker(join(__dirname, '..', 'receipts', 'receipt-worker-message'));
        // Creating an observable from the worker's message events 
        this.messages3$ = fromEvent(this.receiptWorker, 'message') as Observable<{
            id: string;
            result: string;
        }>;
    }

    // Lifecycle hook executed when the application shuts down
    async onApplicationShutdown() {
        // Terminating the worker thread
        this.receiptWorker.terminate();
    }


    // Method to send a task to the worker thread and get the result
    async storeReceiptData(data: any) {

        const uniqueId = randomUUID(); // Generating a unique ID for the task

        try {
            // Sending a message to the worker thread with the input number and unique ID
            const workerPostmessage = this.receiptWorker.postMessage({
                data: JSON.parse(data),
                id: uniqueId
            });

            // Returning a promise that resolves with the result of the files 
            const returnValue = await firstValueFrom(
                // Convert the observable to a promise
                this.messages3$.pipe(
                    // Filter messages to only include those with the matching unique ID
                    filter(({ id }) => id === uniqueId),
                    // Extract the result from the message. result is a string
                    map(({ result }) => result),
                ),
            );

            console.log('result from worker:', returnValue);
            return returnValue;
        } catch (error) {
            this.logger.error(
                `Error creating participants and attendance sheet data of the training session.  \n\n ${error}`,
                ReceiptWorker.name,
            );
            throw new HttpException('Error creating participants and attendance sheet data of the training session.', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


}