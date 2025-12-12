import { pool } from '../database';
import bcrypt from 'bcrypt';
import { User } from '../types';

export class UserModel {
  static async create(
    email: string,
    password: string,
    name: string,
    timezone = 'UTC',
    preferences = {}
  ): Promise<User> {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO users (email, password, name, timezone, preferences) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING *`,
      [email, hashedPassword, name, timezone, JSON.stringify(preferences)]
    );
    return result.rows[0];
  }

  static async findByEmail(email: string): Promise<User | null> {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0] || null;
  }

  static async findById(id: number): Promise<User | null> {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  static async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  static async updatePreferences(
    userId: number,
    preferences: Record<string, unknown>
  ): Promise<User | null> {
    const result = await pool.query(
      `UPDATE users 
       SET preferences = $1, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $2 
       RETURNING *`,
      [JSON.stringify(preferences), userId]
    );
    return result.rows[0] || null;
  }
}
