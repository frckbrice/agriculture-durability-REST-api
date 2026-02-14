import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';

describe('Authentication & User E2E', () => {
    let app: INestApplication;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();
    });

    afterAll(async () => {
        await app.close();
    });

    it('should register a user', async () => {
        const res = await request(app.getHttpServer())
            .post('/users/register')
            .send({
                email: 'testuser@example.com',
                password: 'Test1234',
            });
        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('id');
    });

    it('should not register duplicate user', async () => {
        const res = await request(app.getHttpServer())
            .post('/users/register')
            .send({
                email: 'testuser@example.com',
                password: 'Test1234',
            });
        expect(res.status).toBeGreaterThanOrEqual(400);
    });

    it('should login a user', async () => {
        const res = await request(app.getHttpServer())
            .post('/auth/login')
            .send({
                email: 'testuser@example.com',
                password: 'Test1234',
            });
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('access_token');
    });

    it('should not login with invalid credentials', async () => {
        const res = await request(app.getHttpServer())
            .post('/auth/login')
            .send({
                email: 'testuser@example.com',
                password: 'WrongPassword',
            });
        expect(res.status).toBe(401);
    });
});

describe('Subscriptions E2E', () => {
    let app: INestApplication;
    let accessToken: string;
    let subscriptionId: number;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();

        // Login to get access token
        const loginRes = await request(app.getHttpServer())
            .post('/auth/login')
            .send({
                email: 'testuser@example.com',
                password: 'Test1234',
            });
        accessToken = loginRes.body.access_token;
    });

    afterAll(async () => {
        await app.close();
    });

    it('should create a subscription', async () => {
        const res = await request(app.getHttpServer())
            .post('/subscriptions')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({
                planId: 1,
                userId: 1,
            });
        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('id');
        subscriptionId = res.body.id;
    });

    it('should fetch user subscriptions', async () => {
        const res = await request(app.getHttpServer())
            .get('/subscriptions/user/1')
            .set('Authorization', `Bearer ${accessToken}`);
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    it('should update a subscription', async () => {
        const res = await request(app.getHttpServer())
            .patch(`/subscriptions/${subscriptionId}`)
            .set('Authorization', `Bearer ${accessToken}`)
            .send({ planId: 2 });
        expect([200, 204]).toContain(res.status);
    });

    it('should delete a subscription', async () => {
        const res = await request(app.getHttpServer())
            .delete(`/subscriptions/${subscriptionId}`)
            .set('Authorization', `Bearer ${accessToken}`);
        expect([200, 204]).toContain(res.status);
    });

    it('should not allow unauthorized access', async () => {
        const res = await request(app.getHttpServer())
            .get('/subscriptions/user/1');
        expect(res.status).toBe(401);
    });
});
