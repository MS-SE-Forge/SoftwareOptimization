import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../../src/users/users.service';
import { PrismaService } from '../../src/prisma.service';
import * as bcrypt from 'bcrypt';

describe('UsersService', () => {
  let service: UsersService;

  const mockPrismaService = {
    user: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should hash the password and create a user', async () => {
      const userDto = {
        email: 'test@test.com',
        password: 'password',
        name: 'Test',
      };
      const hashedPassword = 'hashed_password';
      jest.spyOn(bcrypt, 'hash').mockResolvedValue(hashedPassword as never);

      mockPrismaService.user.create.mockResolvedValue({
        ...userDto,
        password: hashedPassword,
        id: '1',
      });

      const result = await service.create(userDto);

      expect(bcrypt.hash).toHaveBeenCalledWith('password', 10);
      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: { ...userDto, password: hashedPassword },
      });
      expect(result).toEqual({ ...userDto, password: hashedPassword, id: '1' });
    });
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const users = [{ id: '1', email: 'test@test.com' }];
      mockPrismaService.user.findMany.mockResolvedValue(users);

      const result = await service.findAll();
      expect(mockPrismaService.user.findMany).toHaveBeenCalled();
      expect(result).toEqual(users);
    });
  });

  describe('findOne', () => {
    it('should return a user by email', async () => {
      const user = { id: '1', email: 'test@test.com' };
      mockPrismaService.user.findUnique.mockResolvedValue(user);

      const result = await service.findOne('test@test.com');
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@test.com' },
      });
      expect(result).toEqual(user);
    });
  });

  describe('findById', () => {
    it('should return a user by id', async () => {
      const user = { id: '1', email: 'test@test.com' };
      mockPrismaService.user.findUnique.mockResolvedValue(user);

      const result = await service.findById('1');
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(result).toEqual(user);
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const user = { id: '1', email: 'test@test.com', name: 'Updated' };
      mockPrismaService.user.update.mockResolvedValue(user);

      const result = await service.update('1', { name: 'Updated' });
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { name: 'Updated' },
      });
      expect(result).toEqual(user);
    });
  });

  describe('remove', () => {
    it('should delete a user', async () => {
      const user = { id: '1', email: 'test@test.com' };
      mockPrismaService.user.delete.mockResolvedValue(user);

      const result = await service.remove('1');
      expect(mockPrismaService.user.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(result).toEqual(user);
    });
  });
});
