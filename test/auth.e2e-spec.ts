import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma.service';
import { Server } from 'http';

interface AuthResponse {
  email: string;
  name: string;
  password?: string;
}

interface LoginResponse {
  access_token: string;
}

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

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
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  const testUser = {
    email: 'auth-e2e@test.com',
    password: 'password123',
    name: 'Auth E2E',
  };

  it('/auth/register (POST)', () => {
    return request(app.getHttpServer() as Server)
      .post('/auth/register')
      .send(testUser)
      .expect(201)
      .expect((res) => {
        const body = res.body as AuthResponse;
        expect(body.email).toBe(testUser.email);
        expect(body.name).toBe(testUser.name);
        expect(body.password).not.toBeDefined(); // Password should not be returned
      });
  });

  it('/auth/login (POST)', () => {
    return request(app.getHttpServer() as Server)
      .post('/auth/login')
      .send({ email: testUser.email, password: testUser.password })
      .expect(201)
      .expect((res) => {
        const body = res.body as LoginResponse;
        expect(body.access_token).toBeDefined();
      });
  });

  it('/auth/login (POST) - Fail with wrong password', () => {
    return request(app.getHttpServer() as Server)
      .post('/auth/login')
      .send({ email: testUser.email, password: 'invalid-password' })
      .expect(401);
  });

  it('/auth/logout (POST)', () => {
    return request(app.getHttpServer() as Server)
      .post('/auth/logout')
      .expect(201)
      .expect({ message: 'Logout successful' });
  });
});
