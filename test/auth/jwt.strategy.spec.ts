import { JwtStrategy } from '../../src/auth/jwt.strategy';
import { Test, TestingModule } from '@nestjs/testing';
import { Role } from '@prisma/client';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JwtStrategy],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  it('should validate and return user data', () => {
    const payload = {
      sub: 'user-id',
      username: 'test@example.com',
      role: Role.USER,
    };

    expect(strategy.validate(payload)).toEqual({
      userId: 'user-id',
      username: 'test@example.com',
      role: Role.USER,
    });
  });
});
