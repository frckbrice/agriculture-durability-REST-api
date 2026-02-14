import { RequestService } from 'src/global/current-logged-in/request.service';

import {
    HttpException,
    HttpStatus,
    Injectable,
    NestMiddleware,
    UnauthorizedException,
} from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { JwtService } from '@nestjs/jwt';
import { Role, User } from '@prisma/client';
import { LoggerService } from 'src/global/logger/logger.service';


@Injectable()
export class AuthMiddleware implements NestMiddleware {
    private allowGetRoutes = ['/v1', '/v1/health', 'v1/price_plans'];

    private allowPostRoutes = [
        '/?/subscriptions/success_payment',  // TODO : make this more generic and remove the '?'
    ];

    constructor(
        private readonly requestService: RequestService,
        private jwtService: JwtService,
    ) { }
    private readonly logger = new LoggerService(AuthMiddleware.name);

    async use(
        req: Request & {
            user: Partial<User>;
        },
        res: Response,
        next: NextFunction,
    ): Promise<void> {

        console.log("income url: ", req.originalUrl)

        // allow health check 
        if (req.method == 'GET' && this.allowGetRoutes.includes(req.originalUrl)) {
            this.logger.log('Allowing public  access to route ', AuthMiddleware.name);
            return next();
        }

        // to handle the paypal payment success return payload
        if (
            req.method == 'POST' &&
            this.allowPostRoutes.includes(req.originalUrl)
        ) {
            // allow some routes to be public
            this.logger.log('Allowing public  access to route ', AuthMiddleware.name);
            return next();
        }
        try {
            //get the token frm the req.
            const token = this.extractTokenFromHeader(req);

            // the token should be there even if it is the companies endPoint.
            if (!token) {
                throw new UnauthorizedException('user not authenticated');
            }
            // decode the token to get the request payload
            const payload = await this.jwtService.decode(token);

            // get the user object from the token
            // console.log("payload : ", payload);
            const currentUser = await this.requestService.getUserWithSub(payload)

            // set  current user to the request for next processing in guard.

            if (!currentUser) {
                req['user'] = {
                    id: payload.userId,
                    first_name: <string>payload?.user_first_name,
                    email: payload?.user_email,
                    role: <Role>Role.ADG,
                }
            } else {
                // set the current user id
                this.requestService.currentUserId = <string>currentUser?.id;
                req['user'] = currentUser;
            }

            /**
             * we allow /v1/companies to be public here because we want to take advantage 
             * of having the user in the request. this help us create the first user of the
             * company along with its company.
             */

            if (
                req.method == 'POST' &&
                this.allowPostRoutes.includes('/v1/companies')
            ) {
                // allow some routes to be public
                this.logger.log('Allowing public  access to route  to create company ', AuthMiddleware.name);
                return next();
            }

            next();

        } catch (error) {
            this.logger.error(
                `Authenticification failed \n\n${error}`,
                AuthMiddleware.name,
            );
            throw new UnauthorizedException('user not authenticated');
        }
    }

    /**
     * Extracts the token fro the request header.
     *
     * @param {Request} request - the request object
     * @return {string | undefined} the xtracted token  or undefined
     */
    private extractTokenFromHeader(request: Request): string | undefined {
        console.log(" the request   headers  auth: ", request.headers.authorization);
        // console.log("the request body: ", request.body);
        const [type, token] = request.headers.authorization?.split(' ') ?? [];

        return type === 'Bearer' ? token : undefined;
    }
}
