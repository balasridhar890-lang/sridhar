import { Response } from 'express';
import { PlansController } from '../../controllers/plans.controller';
import { OpenAIService } from '../../services/openai.service';
import { DailyPlanModel } from '../../models/DailyPlan';
import { UserModel } from '../../models/User';
import { AuthRequest } from '../../middleware/auth';

jest.mock('../../services/openai.service');
jest.mock('../../models/DailyPlan');
jest.mock('../../models/User');

describe('PlansController', () => {
  let plansController: PlansController;
  let mockRequest: Partial<AuthRequest>;
  let mockResponse: Partial<Response>;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnValue({ json: mockJson });

    mockRequest = {
      user: {
        id: 1,
        email: 'test@example.com',
        name: 'Test User',
      },
      body: {},
    };

    mockResponse = {
      status: mockStatus,
      json: mockJson,
    };

    plansController = new PlansController();
  });

  describe('generatePlan', () => {
    it('should generate and save a plan successfully', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        name: 'Test User',
        timezone: 'UTC',
        preferences: {},
      };

      const mockGeneratedPlan = {
        objectives: 'Test objectives',
        schedule: {
          items: [
            {
              time: '9:00 AM',
              activity: 'Test activity',
              duration: '1 hour',
            },
          ],
        },
      };

      const mockSavedPlan = {
        id: 1,
        user_id: 1,
        plan_date: new Date('2024-01-15'),
        objectives: 'Test objectives',
        schedule: mockGeneratedPlan.schedule,
        created_at: new Date(),
      };

      mockRequest.body = {
        date: '2024-01-15',
        userInput: 'Focus on work',
      };

      (UserModel.findById as jest.Mock).mockResolvedValue(mockUser);
      (OpenAIService.prototype.generateDailyPlan as jest.Mock).mockResolvedValue(mockGeneratedPlan);
      (DailyPlanModel.create as jest.Mock).mockResolvedValue(mockSavedPlan);

      await plansController.generatePlan(mockRequest as AuthRequest, mockResponse as Response);

      expect(UserModel.findById).toHaveBeenCalledWith(1);
      expect(DailyPlanModel.create).toHaveBeenCalledWith(
        1,
        '2024-01-15',
        'Test objectives',
        mockGeneratedPlan.schedule
      );
      expect(mockStatus).toHaveBeenCalledWith(201);
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Plan generated successfully',
          plan: expect.objectContaining({
            id: 1,
            objectives: 'Test objectives',
          }),
        })
      );
    });

    it("should use today's date when no date provided", async () => {
      const today = new Date().toISOString().split('T')[0];
      const mockUser = { id: 1, name: 'Test', timezone: 'UTC', preferences: {} };
      const mockPlan = {
        objectives: 'Test',
        schedule: { items: [] },
      };

      (UserModel.findById as jest.Mock).mockResolvedValue(mockUser);
      (OpenAIService.prototype.generateDailyPlan as jest.Mock).mockResolvedValue(mockPlan);
      (DailyPlanModel.create as jest.Mock).mockResolvedValue({
        id: 1,
        user_id: 1,
        plan_date: new Date(today),
        objectives: 'Test',
        schedule: { items: [] },
        created_at: new Date(),
      });

      await plansController.generatePlan(mockRequest as AuthRequest, mockResponse as Response);

      expect(DailyPlanModel.create).toHaveBeenCalledWith(
        1,
        today,
        expect.any(String),
        expect.any(Object)
      );
    });

    it('should return 400 for invalid date format', async () => {
      mockRequest.body = { date: 'invalid-date' };

      await plansController.generatePlan(mockRequest as AuthRequest, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        error: 'Invalid date format. Use YYYY-MM-DD',
      });
    });

    it('should return 404 when user not found', async () => {
      mockRequest.body = { date: '2024-01-15' };
      (UserModel.findById as jest.Mock).mockResolvedValue(null);

      await plansController.generatePlan(mockRequest as AuthRequest, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({ error: 'User not found' });
    });

    it('should handle errors gracefully', async () => {
      mockRequest.body = { date: '2024-01-15' };
      (UserModel.findById as jest.Mock).mockRejectedValue(new Error('Database error'));

      await plansController.generatePlan(mockRequest as AuthRequest, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({ error: 'Database error' });
    });
  });

  describe('getTodayPlan', () => {
    it("should return today's plan", async () => {
      const today = new Date().toISOString().split('T')[0];
      const mockPlan = {
        id: 1,
        user_id: 1,
        plan_date: new Date(today),
        objectives: 'Test objectives',
        schedule: { items: [] },
        created_at: new Date(),
      };

      (DailyPlanModel.findByUserAndDate as jest.Mock).mockResolvedValue(mockPlan);

      await plansController.getTodayPlan(mockRequest as AuthRequest, mockResponse as Response);

      expect(DailyPlanModel.findByUserAndDate).toHaveBeenCalledWith(1, today);
      expect(mockJson).toHaveBeenCalledWith({
        plan: expect.objectContaining({
          id: 1,
          objectives: 'Test objectives',
        }),
      });
    });

    it('should return 404 when no plan found', async () => {
      (DailyPlanModel.findByUserAndDate as jest.Mock).mockResolvedValue(null);

      await plansController.getTodayPlan(mockRequest as AuthRequest, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({
        error: 'No plan found for today',
      });
    });
  });

  describe('getPlanByDate', () => {
    it('should return plan for specified date', async () => {
      mockRequest.params = { date: '2024-01-15' };
      const mockPlan = {
        id: 1,
        user_id: 1,
        plan_date: new Date('2024-01-15'),
        objectives: 'Test objectives',
        schedule: { items: [] },
        created_at: new Date(),
      };

      (DailyPlanModel.findByUserAndDate as jest.Mock).mockResolvedValue(mockPlan);

      await plansController.getPlanByDate(mockRequest as AuthRequest, mockResponse as Response);

      expect(DailyPlanModel.findByUserAndDate).toHaveBeenCalledWith(1, '2024-01-15');
      expect(mockJson).toHaveBeenCalledWith({
        plan: expect.objectContaining({
          id: 1,
          objectives: 'Test objectives',
        }),
      });
    });

    it('should return 400 for invalid date format', async () => {
      mockRequest.params = { date: 'invalid' };

      await plansController.getPlanByDate(mockRequest as AuthRequest, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        error: 'Invalid date format. Use YYYY-MM-DD',
      });
    });

    it('should return 404 when no plan found for date', async () => {
      mockRequest.params = { date: '2024-01-15' };
      (DailyPlanModel.findByUserAndDate as jest.Mock).mockResolvedValue(null);

      await plansController.getPlanByDate(mockRequest as AuthRequest, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({
        error: 'No plan found for date: 2024-01-15',
      });
    });
  });
});
