import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from './auth.service';

jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let prisma: {
    user: {
      findUnique: jest.Mock;
      create: jest.Mock;
    };
  };
  let jwtService: {
    signAsync: jest.Mock;
  };

  const user = {
    id: 'user-id',
    email: 'test@example.com',
    password: 'hashed-password',
    firstName: 'Test',
    lastName: 'User',
    createdAt: new Date('2026-08-28T00:00:00.000Z'),
    updatedAt: new Date('2026-08-28T00:00:00.000Z'),
  };

  beforeEach(async () => {
    prisma = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
      },
    };
    jwtService = {
      signAsync: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
        {
          provide: JwtService,
          useValue: jwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should register a user', async () => {
    const dto = {
      email: 'test@example.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User',
    };
    prisma.user.findUnique.mockResolvedValue(null);
    prisma.user.create.mockResolvedValue(user);
    jwtService.signAsync.mockResolvedValue('access-token');
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');

    await expect(service.register(dto)).resolves.toEqual({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        createdAt: user.createdAt,
      },
      accessToken: 'access-token',
    });
    expect(prisma.user.create).toHaveBeenCalledWith({
      data: {
        email: dto.email,
        password: 'hashed-password',
        firstName: dto.firstName,
        lastName: dto.lastName,
      },
    });
  });

  it('should reject duplicate registration email', async () => {
    prisma.user.findUnique.mockResolvedValue(user);

    await expect(
      service.register({
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
      }),
    ).rejects.toThrow(ConflictException);
  });

  it('should login a user', async () => {
    prisma.user.findUnique.mockResolvedValue(user);
    jwtService.signAsync.mockResolvedValue('access-token');
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    await expect(
      service.login({
        email: 'test@example.com',
        password: 'password123',
      }),
    ).resolves.toEqual({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        createdAt: user.createdAt,
      },
      accessToken: 'access-token',
    });
  });

  it('should reject login when user does not exist', async () => {
    prisma.user.findUnique.mockResolvedValue(null);

    await expect(
      service.login({
        email: 'missing@example.com',
        password: 'password123',
      }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('should reject login when password is invalid', async () => {
    prisma.user.findUnique.mockResolvedValue(user);
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    await expect(
      service.login({
        email: 'test@example.com',
        password: 'wrong-password',
      }),
    ).rejects.toThrow(UnauthorizedException);
  });
});
