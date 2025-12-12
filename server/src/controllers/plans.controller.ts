import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { OpenAIService } from '../services/openai.service';
import { DailyPlanModel } from '../models/DailyPlan';
import { UserModel } from '../models/User';

export class PlansController {
  private openaiService: OpenAIService;

  constructor() {
    this.openaiService = new OpenAIService();
  }

  async generatePlan(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { date, userInput } = req.body;
      const userId = req.user!.id;

      // Validate date
      const planDate = date || new Date().toISOString().split('T')[0];
      if (!/^\d{4}-\d{2}-\d{2}$/.test(planDate)) {
        res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
        return;
      }

      // Get user details
      const user = await UserModel.findById(userId);
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      // Generate plan using OpenAI
      const generatedPlan = await this.openaiService.generateDailyPlan({
        user,
        userInput,
        date: planDate,
      });

      // Save the plan to database
      const savedPlan = await DailyPlanModel.create(
        userId,
        planDate,
        generatedPlan.objectives,
        generatedPlan.schedule
      );

      res.status(201).json({
        message: 'Plan generated successfully',
        plan: {
          id: savedPlan.id,
          date: savedPlan.plan_date,
          objectives: savedPlan.objectives,
          schedule: savedPlan.schedule,
          created_at: savedPlan.created_at,
        },
      });
    } catch (error) {
      console.error('Error generating plan:', error);
      if (error instanceof Error) {
        res.status(500).json({ error: error.message });
        return;
      }
      res.status(500).json({ error: 'Failed to generate plan' });
    }
  }

  async getTodayPlan(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const today = new Date().toISOString().split('T')[0];

      const plan = await DailyPlanModel.findByUserAndDate(userId, today);

      if (!plan) {
        res.status(404).json({ error: 'No plan found for today' });
        return;
      }

      res.json({
        plan: {
          id: plan.id,
          date: plan.plan_date,
          objectives: plan.objectives,
          schedule: plan.schedule,
          created_at: plan.created_at,
        },
      });
    } catch (error) {
      console.error("Error fetching today's plan:", error);
      res.status(500).json({ error: 'Failed to fetch plan' });
    }
  }

  async getPlanByDate(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { date } = req.params;
      const userId = req.user!.id;

      // Validate date format
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
        return;
      }

      const plan = await DailyPlanModel.findByUserAndDate(userId, date);

      if (!plan) {
        res.status(404).json({ error: `No plan found for date: ${date}` });
        return;
      }

      res.json({
        plan: {
          id: plan.id,
          date: plan.plan_date,
          objectives: plan.objectives,
          schedule: plan.schedule,
          created_at: plan.created_at,
        },
      });
    } catch (error) {
      console.error('Error fetching plan by date:', error);
      res.status(500).json({ error: 'Failed to fetch plan' });
    }
  }
}
