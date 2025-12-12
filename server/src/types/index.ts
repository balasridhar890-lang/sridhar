export interface User {
  id: number;
  email: string;
  password: string;
  name: string;
  timezone: string;
  preferences: Record<string, unknown>;
  created_at: Date;
  updated_at: Date;
}

export interface DailyPlan {
  id: number;
  user_id: number;
  plan_date: Date;
  objectives: string;
  schedule: Record<string, unknown>;
  created_at: Date;
}

export interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    name: string;
  };
}
