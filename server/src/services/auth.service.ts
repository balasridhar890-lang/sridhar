import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../prisma';
import { config } from '../config';

export interface TokenPayload {
  userId: string;
  email: string;
}

export interface Tokens {
  accessToken: string;
  refreshToken: string;
}

export const authService = {
  async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  },

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  },

  generateTokens(payload: TokenPayload): Tokens {
    const accessToken = jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.accessTokenExpiry,
    } as jwt.SignOptions);

    const refreshToken = jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.refreshTokenExpiry,
    } as jwt.SignOptions);

    return {
      accessToken,
      refreshToken,
    };
  },

  verifyToken(token: string): TokenPayload | null {
    try {
      const decoded = jwt.verify(token, config.jwt.secret) as TokenPayload;
      return decoded;
    } catch (error) {
      return null;
    }
  },

  async register(email: string, password: string, name: string, timezone?: string) {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    const passwordHash = await this.hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email,
        password_hash: passwordHash,
        name,
        timezone: timezone || 'UTC',
      },
    });

    const tokens = this.generateTokens({
      userId: user.id,
      email: user.email,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        timezone: user.timezone,
        subscription_tier: user.subscription_tier,
        created_at: user.created_at,
      },
      tokens,
    };
  },

  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new Error('Invalid email or password');
    }

    const isPasswordValid = await this.verifyPassword(password, user.password_hash);

    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    const tokens = this.generateTokens({
      userId: user.id,
      email: user.email,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        timezone: user.timezone,
        subscription_tier: user.subscription_tier,
        created_at: user.created_at,
      },
      tokens,
    };
  },

  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      timezone: user.timezone,
      subscription_tier: user.subscription_tier,
      created_at: user.created_at,
      updated_at: user.updated_at,
    };
  },
};
