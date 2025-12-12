import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import { PlansController } from '../controllers/plans.controller';
import { authenticate } from '../middleware/auth';

const router = Router();
const plansController = new PlansController();

// Rate limiter for plan generation (max 10 requests per hour per user)
const generatePlanLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  message: 'Too many plan generation requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

// All routes require authentication
router.use(authenticate);

// POST /plans/generate - Generate a new daily plan
router.post('/generate', generatePlanLimiter, plansController.generatePlan.bind(plansController));

// GET /plans/today - Get today's plan
router.get('/today', plansController.getTodayPlan.bind(plansController));

// GET /plans/:date - Get plan by date (YYYY-MM-DD)
router.get('/:date', plansController.getPlanByDate.bind(plansController));

export { router as plansRouter };
