import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma.service';
import { Server } from 'http';

interface UserResponse {
  id: string;
  email: string;
  name: string;
}

interface LoginResponse {
  access_token: string;
}

describe('UsersController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwtToken: string;
  let createdUserId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = app.get<PrismaService>(PrismaService);
    await app.init();

    // Clean up database
    // validation for deleteMany requires replica set on MongoDB, so we delete manually
    const users = await prisma.user.findMany();
    for (const user of users) {
      await prisma.user.delete({ where: { id: user.id } });
    }

    // Register a user to get a token
    const testUser = {
      email: 'users-e2e@test.com',
      password: 'password123',
      name: 'Users E2E',
    };

    await request(app.getHttpServer() as Server)
      .post('/auth/register')
      .send(testUser);

    const loginRes = await request(app.getHttpServer() as Server)
      .post('/auth/login')
      .send({ email: testUser.email, password: testUser.password });

    const body = loginRes.body as LoginResponse;
    jwtToken = body.access_token;
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  const newUser = {
    email: 'newuser@test.com',
    password: 'password123',
    name: 'New User',
  };

  it('/users (POST)', () => {
    return request(app.getHttpServer() as Server)
      .post('/users')
      .set('Authorization', `Bearer ${jwtToken}`)
      .send(newUser)
      .expect(201)
      .expect((res) => {
        const body = res.body as UserResponse;
        expect(body.email).toBe(newUser.email);
        expect(body.id).toBeDefined();
        createdUserId = body.id;
      });
  });

  it('/users (GET)', () => {
    return request(app.getHttpServer() as Server)
      .get('/users')
      .set('Authorization', `Bearer ${jwtToken}`)
      .expect(200)
      .expect((res) => {
        const body = res.body as UserResponse[];
        expect(Array.isArray(body)).toBe(true);
        expect(body.length).toBeGreaterThanOrEqual(1); // At least the one we created
      });
  });

  it('/users/:email (GET)', () => {
    return request(app.getHttpServer() as Server)
      .get(`/users/${newUser.email}`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .expect(200)
      .expect((res) => {
        const body = res.body as UserResponse;
        expect(body.email).toBe(newUser.email);
      });
  });

  it('/users/id/:id (GET)', () => {
    return request(app.getHttpServer() as Server)
      .get(`/users/id/${createdUserId}`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .expect(200)
      .expect((res) => {
        const body = res.body as UserResponse;
        expect(body.id).toBe(createdUserId);
      });
  });

  it('/users/:id (PATCH)', () => {
    const updatedName = 'Updated Name';
    return request(app.getHttpServer() as Server)
      .patch(`/users/${createdUserId}`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({ name: updatedName })
      .expect(200)
      .expect((res) => {
        const body = res.body as UserResponse;
        expect(body.name).toBe(updatedName);
      });
  });

  it('/users/:id (DELETE)', () => {
    return request(app.getHttpServer() as Server)
      .delete(`/users/${createdUserId}`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .expect(200);
  });

  it('/users/id/:id (GET) - Fail if user deleted', () => {
    return request(app.getHttpServer() as Server)
      .get(`/users/id/${createdUserId}`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .expect(404);
  });
});
