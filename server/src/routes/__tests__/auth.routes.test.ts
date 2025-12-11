import request from 'supertest';
import { app } from '../../index';

jest.mock('../../prisma', () => ({
  __esModule: true,
  default: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}));

jest.mock('../../services/auth.service', () => ({
  authService: {
    register: jest.fn(),
    login: jest.fn(),
    getProfile: jest.fn(),
    verifyToken: jest.fn(),
    hashPassword: jest.fn(),
    verifyPassword: jest.fn(),
    generateTokens: jest.fn(),
  },
}));

import { authService } from '../../services/auth.service';

const mockAuthService = authService as jest.Mocked<typeof authService>;

describe('Auth Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /auth/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'test123',
        name: 'Test User',
        timezone: 'UTC',
      };

      const mockResult = {
        user: {
          id: '123',
          email: userData.email,
          name: userData.name,
          timezone: userData.timezone,
          subscription_tier: 'free',
          created_at: '2024-01-01T00:00:00.000Z',
        },
        tokens: {
          accessToken: 'access_token',
          refreshToken: 'refresh_token',
        },
      };

      mockAuthService.register.mockResolvedValue(mockResult);

      const response = await request(app).post('/auth/register').send(userData).expect(201);

      expect(response.body.data.user.email).toEqual(userData.email);
      expect(response.body.data.tokens).toBeDefined();
      expect(mockAuthService.register).toHaveBeenCalledWith(
        userData.email,
        userData.password,
        userData.name,
        userData.timezone
      );
    });

    it('should return 400 for invalid email', async () => {
      const userData = {
        email: 'invalid-email',
        password: 'test123',
        name: 'Test User',
      };

      const response = await request(app).post('/auth/register').send(userData).expect(400);

      expect(response.body.error).toContain('Validation failed');
    });

    it('should return 400 for short password', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'test',
        name: 'Test User',
      };

      const response = await request(app).post('/auth/register').send(userData).expect(400);

      expect(response.body.error).toContain('Validation failed');
    });

    it('should return 409 if user already exists', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'test123',
        name: 'Test User',
      };

      mockAuthService.register.mockRejectedValue(new Error('User with this email already exists'));

      const response = await request(app).post('/auth/register').send(userData).expect(409);

      expect(response.body.error).toContain('already exists');
    });
  });

  describe('POST /auth/login', () => {
    it('should login successfully', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'test123',
      };

      const mockResult = {
        user: {
          id: '123',
          email: credentials.email,
          name: 'Test User',
          timezone: 'UTC',
          subscription_tier: 'free',
          created_at: '2024-01-01T00:00:00.000Z',
        },
        tokens: {
          accessToken: 'access_token',
          refreshToken: 'refresh_token',
        },
      };

      mockAuthService.login.mockResolvedValue(mockResult);

      const response = await request(app).post('/auth/login').send(credentials).expect(200);

      expect(response.body.data.user.email).toEqual(credentials.email);
      expect(response.body.data.tokens).toBeDefined();
      expect(mockAuthService.login).toHaveBeenCalledWith(credentials.email, credentials.password);
    });

    it('should return 400 for invalid email', async () => {
      const credentials = {
        email: 'invalid-email',
        password: 'test123',
      };

      const response = await request(app).post('/auth/login').send(credentials).expect(400);

      expect(response.body.error).toContain('Validation failed');
    });

    it('should return 401 for invalid credentials', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      mockAuthService.login.mockRejectedValue(new Error('Invalid email or password'));

      const response = await request(app).post('/auth/login').send(credentials).expect(401);

      expect(response.body.error).toContain('Invalid email or password');
    });
  });

  describe('GET /auth/me', () => {
    it('should return user profile with valid token', async () => {
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        name: 'Test User',
        timezone: 'UTC',
        subscription_tier: 'free',
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-01T00:00:00.000Z',
      };

      mockAuthService.verifyToken.mockReturnValue({
        userId: '123',
        email: 'test@example.com',
      });
      mockAuthService.getProfile.mockResolvedValue(mockUser);

      const response = await request(app)
        .get('/auth/me')
        .set('Authorization', 'Bearer valid_token')
        .expect(200);

      expect(response.body.data.email).toEqual(mockUser.email);
    });

    it('should return 401 without authorization header', async () => {
      const response = await request(app).get('/auth/me').expect(401);

      expect(response.body.error).toContain('Missing or invalid authorization header');
    });

    it('should return 401 with invalid token', async () => {
      mockAuthService.verifyToken.mockReturnValue(null);

      const response = await request(app)
        .get('/auth/me')
        .set('Authorization', 'Bearer invalid_token')
        .expect(401);

      expect(response.body.error).toContain('Invalid or expired token');
    });

    it('should return 404 if user not found', async () => {
      mockAuthService.verifyToken.mockReturnValue({
        userId: '123',
        email: 'test@example.com',
      });
      mockAuthService.getProfile.mockRejectedValue(new Error('User not found'));

      const response = await request(app)
        .get('/auth/me')
        .set('Authorization', 'Bearer valid_token')
        .expect(404);

      expect(response.body.error).toContain('User not found');
    });
  });
});
