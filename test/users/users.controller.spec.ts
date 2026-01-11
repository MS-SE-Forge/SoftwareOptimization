import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from '../../src/users/users.controller';
import { UsersService } from '../../src/users/users.service';

describe('UsersController', () => {
  let controller: UsersController;

  const mockUsersService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: mockUsersService }],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a user', async () => {
      const dto = { email: 't@t.com', password: 'p' };
      const result = { id: '1', ...dto };
      mockUsersService.create.mockResolvedValue(result);

      expect(await controller.create(dto)).toEqual(result);
      expect(mockUsersService.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      const result = [{ id: '1' }];
      mockUsersService.findAll.mockResolvedValue(result);

      expect(await controller.findAll()).toEqual(result);
      expect(mockUsersService.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a user by email', async () => {
      const result = { id: '1' };
      mockUsersService.findOne.mockResolvedValue(result);

      expect(await controller.findOne('email')).toEqual(result);
      expect(mockUsersService.findOne).toHaveBeenCalledWith('email');
    });
  });

  describe('findById', () => {
    it('should return a user by id', async () => {
      const result = { id: '1' };
      mockUsersService.findById.mockResolvedValue(result);

      expect(await controller.findById('1')).toEqual(result);
      expect(mockUsersService.findById).toHaveBeenCalledWith('1');
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const dto = { name: 'New' };
      const result = { id: '1', ...dto };
      mockUsersService.update.mockResolvedValue(result);

      expect(await controller.update('1', dto)).toEqual(result);
      expect(mockUsersService.update).toHaveBeenCalledWith('1', dto);
    });
  });

  describe('remove', () => {
    it('should remove a user', async () => {
      const result = { id: '1' };
      mockUsersService.remove.mockResolvedValue(result);

      expect(await controller.remove('1')).toEqual(result);
      expect(mockUsersService.remove).toHaveBeenCalledWith('1');
    });
  });
});
