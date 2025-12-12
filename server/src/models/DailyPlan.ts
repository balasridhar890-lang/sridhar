import { pool } from '../database';
import { DailyPlan } from '../types';

export class DailyPlanModel {
  static async create(
    userId: number,
    planDate: string,
    objectives: string,
    schedule: Record<string, unknown>
  ): Promise<DailyPlan> {
    const result = await pool.query(
      `INSERT INTO daily_plans (user_id, plan_date, objectives, schedule) 
       VALUES ($1, $2, $3, $4) 
       ON CONFLICT (user_id, plan_date) 
       DO UPDATE SET objectives = $3, schedule = $4, created_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [userId, planDate, objectives, JSON.stringify(schedule)]
    );
    return result.rows[0];
  }

  static async findByUserAndDate(userId: number, date: string): Promise<DailyPlan | null> {
    const result = await pool.query(
      'SELECT * FROM daily_plans WHERE user_id = $1 AND plan_date = $2',
      [userId, date]
    );
    return result.rows[0] || null;
  }

  static async findByUser(userId: number, limit = 10, offset = 0): Promise<DailyPlan[]> {
    const result = await pool.query(
      'SELECT * FROM daily_plans WHERE user_id = $1 ORDER BY plan_date DESC LIMIT $2 OFFSET $3',
      [userId, limit, offset]
    );
    return result.rows;
  }

  static async delete(userId: number, date: string): Promise<boolean> {
    const result = await pool.query(
      'DELETE FROM daily_plans WHERE user_id = $1 AND plan_date = $2',
      [userId, date]
    );
    return (result.rowCount ?? 0) > 0;
  }
}
