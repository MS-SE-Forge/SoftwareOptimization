import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../../src/auth/auth.service';
import { UsersService } from '../../src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;

  const mockUsersService = {
    findOne: jest.fn(),
    create: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return user result without password if password matches', async () => {
      const user = {
        email: 'test@t.com',
        password: 'hashedPassword',
        id: '1',
        name: 'Test',
      };
      mockUsersService.findOne.mockResolvedValue(user);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);

      const result = await service.validateUser('test@t.com', 'password');
      expect(mockUsersService.findOne).toHaveBeenCalledWith('test@t.com');
      expect(bcrypt.compare).toHaveBeenCalledWith('password', 'hashedPassword');
      expect(result).toEqual({ email: 'test@t.com', id: '1', name: 'Test' });
    });

    it('should return null if user not found', async () => {
      mockUsersService.findOne.mockResolvedValue(null);
      const result = await service.validateUser('test@t.com', 'password');
      expect(result).toBeNull();
    });

    it('should return null if password does not match', async () => {
      const user = { password: 'hashedPassword' };
      mockUsersService.findOne.mockResolvedValue(user);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

      const result = await service.validateUser('test@t.com', 'password');
      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should return access token', () => {
      const user = { email: 'test@t.com', id: '1', role: 'user' };
      const token = 'token';
      mockJwtService.sign.mockReturnValue(token);

      const result = service.login(user as any);
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        username: 'test@t.com',
        sub: '1',
        role: 'user',
      });
      expect(result).toEqual({ access_token: token });
    });
  });

  describe('register', () => {
    it('should create a new user', async () => {
      const dto = { email: 't@t.com', password: 'password', name: 'test' };
      const createdUser = { id: '1', ...dto };
      mockUsersService.create.mockResolvedValue(createdUser);

      const result = await service.register(dto);
      expect(mockUsersService.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(createdUser);
    });
  });
});
