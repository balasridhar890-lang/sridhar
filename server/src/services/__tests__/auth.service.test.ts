import { authService } from '../auth.service';
import prisma from '../../prisma';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { config } from '../../config';

jest.mock('../../prisma', () => ({
  __esModule: true,
  default: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}));

jest.mock('bcrypt');
jest.mock('jsonwebtoken');

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('hashPassword', () => {
    it('should hash a password using bcrypt', async () => {
      const password = 'test123';
      const hashedPassword = 'hashed_password';

      (bcrypt.genSalt as jest.Mock).mockResolvedValue('salt');
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);

      const result = await authService.hashPassword(password);

      expect(bcrypt.genSalt).toHaveBeenCalledWith(10);
      expect(bcrypt.hash).toHaveBeenCalledWith(password, 'salt');
      expect(result).toBe(hashedPassword);
    });
  });

  describe('verifyPassword', () => {
    it('should verify a password correctly', async () => {
      const password = 'test123';
      const hash = 'hashed_password';

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await authService.verifyPassword(password, hash);

      expect(bcrypt.compare).toHaveBeenCalledWith(password, hash);
      expect(result).toBe(true);
    });

    it('should return false for incorrect password', async () => {
      const password = 'test123';
      const hash = 'hashed_password';

      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await authService.verifyPassword(password, hash);

      expect(result).toBe(false);
    });
  });

  describe('generateTokens', () => {
    it('should generate valid access and refresh tokens', () => {
      const payload = { userId: '123', email: 'test@example.com' };
      const accessToken = 'access_token';
      const refreshToken = 'refresh_token';

      (jwt.sign as jest.Mock).mockReturnValueOnce(accessToken).mockReturnValueOnce(refreshToken);

      const result = authService.generateTokens(payload);

      expect(jwt.sign).toHaveBeenCalledTimes(2);
      expect(result.accessToken).toBe(accessToken);
      expect(result.refreshToken).toBe(refreshToken);
    });
  });

  describe('verifyToken', () => {
    it('should verify a valid token and return payload', () => {
      const token = 'valid_token';
      const payload = { userId: '123', email: 'test@example.com' };

      (jwt.verify as jest.Mock).mockReturnValue(payload);

      const result = authService.verifyToken(token);

      expect(jwt.verify).toHaveBeenCalledWith(token, config.jwt.secret);
      expect(result).toEqual(payload);
    });

    it('should return null for invalid token', () => {
      const token = 'invalid_token';

      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      const result = authService.verifyToken(token);

      expect(result).toBeNull();
    });
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'test123',
        name: 'Test User',
        timezone: 'UTC',
      };

      const hashedPassword = 'hashed_password';
      const newUser = {
        id: '123',
        email: userData.email,
        password_hash: hashedPassword,
        name: userData.name,
        timezone: userData.timezone,
        subscription_tier: 'free',
        created_at: new Date(),
        updated_at: new Date(),
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (bcrypt.genSalt as jest.Mock).mockResolvedValue('salt');
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      (prisma.user.create as jest.Mock).mockResolvedValue(newUser);
      (jwt.sign as jest.Mock)
        .mockReturnValueOnce('access_token')
        .mockReturnValueOnce('refresh_token');

      const result = await authService.register(
        userData.email,
        userData.password,
        userData.name,
        userData.timezone
      );

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: userData.email },
      });
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          email: userData.email,
          password_hash: hashedPassword,
          name: userData.name,
          timezone: userData.timezone,
        },
      });
      expect(result.user.email).toBe(userData.email);
      expect(result.tokens.accessToken).toBe('access_token');
      expect(result.tokens.refreshToken).toBe('refresh_token');
    });

    it('should throw error if user already exists', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'test123',
        name: 'Test User',
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: '123',
        email: userData.email,
      });

      await expect(
        authService.register(userData.email, userData.password, userData.name)
      ).rejects.toThrow('User with this email already exists');
    });
  });

  describe('login', () => {
    it('should login successfully with correct credentials', async () => {
      const email = 'test@example.com';
      const password = 'test123';
      const user = {
        id: '123',
        email,
        password_hash: 'hashed_password',
        name: 'Test User',
        timezone: 'UTC',
        subscription_tier: 'free',
        created_at: new Date(),
        updated_at: new Date(),
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock)
        .mockReturnValueOnce('access_token')
        .mockReturnValueOnce('refresh_token');

      const result = await authService.login(email, password);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email } });
      expect(bcrypt.compare).toHaveBeenCalledWith(password, user.password_hash);
      expect(result.user.email).toBe(email);
      expect(result.tokens.accessToken).toBe('access_token');
    });

    it('should throw error if user does not exist', async () => {
      const email = 'nonexistent@example.com';
      const password = 'test123';

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(authService.login(email, password)).rejects.toThrow('Invalid email or password');
    });

    it('should throw error if password is incorrect', async () => {
      const email = 'test@example.com';
      const password = 'wrongpassword';
      const user = {
        id: '123',
        email,
        password_hash: 'hashed_password',
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(authService.login(email, password)).rejects.toThrow('Invalid email or password');
    });
  });

  describe('getProfile', () => {
    it('should get user profile successfully', async () => {
      const userId = '123';
      const user = {
        id: userId,
        email: 'test@example.com',
        password_hash: 'hashed_password',
        name: 'Test User',
        timezone: 'UTC',
        subscription_tier: 'free',
        created_at: new Date(),
        updated_at: new Date(),
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(user);

      const result = await authService.getProfile(userId);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { id: userId } });
      expect(result.email).toBe(user.email);
      expect(result.id).toBe(userId);
    });

    it('should throw error if user not found', async () => {
      const userId = 'nonexistent';

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(authService.getProfile(userId)).rejects.toThrow('User not found');
    });
  });
});
