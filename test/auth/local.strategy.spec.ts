import { LocalStrategy } from '../../src/auth/local.strategy';
import { AuthService } from '../../src/auth/auth.service';
import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { Role } from '@prisma/client';

describe('LocalStrategy', () => {
  let strategy: LocalStrategy;

  const mockAuthService = {
    validateUser: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LocalStrategy,
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compile();

    strategy = module.get<LocalStrategy>(LocalStrategy);
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  it('should return user if validation succeeds', async () => {
    const user = {
      id: '1',
      email: 'test@test.com',
      name: 'Test',
      role: Role.USER,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    mockAuthService.validateUser.mockResolvedValue(user);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const result = await strategy.validate('test@test.com', 'password');

    expect(result).toEqual(user);
    expect(mockAuthService.validateUser).toHaveBeenCalledWith(
      'test@test.com',
      'password',
    );
  });

  it('should throw UnauthorizedException if validation fails', async () => {
    mockAuthService.validateUser.mockResolvedValue(null);

    await expect(
      strategy.validate('test@test.com', 'wrongpass'),
    ).rejects.toThrow(UnauthorizedException);
  });
});
