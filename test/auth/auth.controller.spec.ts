import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../../src/auth/auth.controller';
import { AuthService } from '../../src/auth/auth.service';

describe('AuthController', () => {
  let controller: AuthController;

  const mockAuthService = {
    login: jest.fn(),
    register: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should return access token', () => {
      const user = { username: 'test', id: '1' };
      const req = { user };
      const token = { access_token: 'token' };
      mockAuthService.login.mockReturnValue(token);

      expect(controller.login(req as unknown as any, {})).toEqual(token);
      expect(mockAuthService.login).toHaveBeenCalledWith(user);
    });

    it('should use body if req.user is undefined', () => {
      const body = { username: 'test', id: '1' };
      const req = {};
      const token = { access_token: 'token' };
      mockAuthService.login.mockReturnValue(token);

      expect(controller.login(req as unknown as any, body)).toEqual(token);
      expect(mockAuthService.login).toHaveBeenCalledWith(body);
    });
  });

  describe('register', () => {
    it('should register a new user', async () => {
      const dto = { email: 'test' };
      const result = { id: '1', ...dto };
      mockAuthService.register.mockResolvedValue(result);

      expect(await controller.register(dto)).toEqual(result);
      expect(mockAuthService.register).toHaveBeenCalledWith(dto);
    });
  });

  describe('logout', () => {
    it('should return logout success message', () => {
      expect(controller.logout()).toEqual({ message: 'Logout successful' });
    });
  });
});
