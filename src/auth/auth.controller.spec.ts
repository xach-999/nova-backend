import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: {
    register: jest.Mock;
    login: jest.Mock;
  };

  beforeEach(async () => {
    authService = {
      register: jest.fn(),
      login: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: authService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should register a user', () => {
    const dto = {
      email: 'test@example.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User',
    };
    const response = {
      user: {
        id: 'user-id',
        email: dto.email,
        firstName: dto.firstName,
        lastName: dto.lastName,
      },
      accessToken: 'access-token',
    };
    authService.register.mockReturnValue(response);

    expect(controller.register(dto)).toBe(response);
    expect(authService.register).toHaveBeenCalledWith(dto);
  });

  it('should login a user', () => {
    const dto = {
      email: 'test@example.com',
      password: 'password123',
    };
    const response = {
      user: {
        id: 'user-id',
        email: dto.email,
      },
      accessToken: 'access-token',
    };
    authService.login.mockReturnValue(response);

    expect(controller.login(dto)).toBe(response);
    expect(authService.login).toHaveBeenCalledWith(dto);
  });
});
