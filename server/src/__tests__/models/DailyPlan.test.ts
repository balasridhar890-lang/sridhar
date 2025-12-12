import { DailyPlanModel } from '../../models/DailyPlan';
import { pool } from '../../database';

jest.mock('../../database', () => ({
  pool: {
    query: jest.fn(),
  },
}));

describe('DailyPlanModel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new daily plan', async () => {
      const mockPlan = {
        id: 1,
        user_id: 1,
        plan_date: '2024-01-15',
        objectives: 'Test objectives',
        schedule: { items: [] },
        created_at: new Date(),
      };

      (pool.query as jest.Mock).mockResolvedValue({ rows: [mockPlan] });

      const result = await DailyPlanModel.create(1, '2024-01-15', 'Test objectives', { items: [] });

      expect(result).toEqual(mockPlan);
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO daily_plans'),
        expect.arrayContaining([1, '2024-01-15', 'Test objectives'])
      );
    });

    it('should update existing plan on conflict', async () => {
      const mockPlan = {
        id: 1,
        user_id: 1,
        plan_date: '2024-01-15',
        objectives: 'Updated objectives',
        schedule: { items: [] },
        created_at: new Date(),
      };

      (pool.query as jest.Mock).mockResolvedValue({ rows: [mockPlan] });

      const result = await DailyPlanModel.create(1, '2024-01-15', 'Updated objectives', {
        items: [],
      });

      expect(result).toEqual(mockPlan);
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('ON CONFLICT'),
        expect.any(Array)
      );
    });
  });

  describe('findByUserAndDate', () => {
    it('should find plan by user and date', async () => {
      const mockPlan = {
        id: 1,
        user_id: 1,
        plan_date: '2024-01-15',
        objectives: 'Test objectives',
        schedule: { items: [] },
        created_at: new Date(),
      };

      (pool.query as jest.Mock).mockResolvedValue({ rows: [mockPlan] });

      const result = await DailyPlanModel.findByUserAndDate(1, '2024-01-15');

      expect(result).toEqual(mockPlan);
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE user_id = $1 AND plan_date = $2'),
        [1, '2024-01-15']
      );
    });

    it('should return null when plan not found', async () => {
      (pool.query as jest.Mock).mockResolvedValue({ rows: [] });

      const result = await DailyPlanModel.findByUserAndDate(1, '2024-01-15');

      expect(result).toBeNull();
    });
  });

  describe('findByUser', () => {
    it('should find all plans for a user', async () => {
      const mockPlans = [
        {
          id: 1,
          user_id: 1,
          plan_date: '2024-01-15',
          objectives: 'Test 1',
          schedule: { items: [] },
          created_at: new Date(),
        },
        {
          id: 2,
          user_id: 1,
          plan_date: '2024-01-14',
          objectives: 'Test 2',
          schedule: { items: [] },
          created_at: new Date(),
        },
      ];

      (pool.query as jest.Mock).mockResolvedValue({ rows: mockPlans });

      const result = await DailyPlanModel.findByUser(1, 10, 0);

      expect(result).toEqual(mockPlans);
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('ORDER BY plan_date DESC'),
        [1, 10, 0]
      );
    });
  });

  describe('delete', () => {
    it('should delete a plan', async () => {
      (pool.query as jest.Mock).mockResolvedValue({ rowCount: 1 });

      const result = await DailyPlanModel.delete(1, '2024-01-15');

      expect(result).toBe(true);
      expect(pool.query).toHaveBeenCalledWith(expect.stringContaining('DELETE FROM daily_plans'), [
        1,
        '2024-01-15',
      ]);
    });

    it('should return false when plan not found', async () => {
      (pool.query as jest.Mock).mockResolvedValue({ rowCount: 0 });

      const result = await DailyPlanModel.delete(1, '2024-01-15');

      expect(result).toBe(false);
    });
  });
});
