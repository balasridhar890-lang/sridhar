import { OpenAIService } from '../../services/openai.service';
import { User } from '../../types';
import OpenAI from 'openai';

// Mock config
jest.mock('../../config', () => ({
  config: {
    openai: {
      apiKey: 'test-api-key',
      model: 'gpt-4',
    },
  },
}));

// Mock OpenAI module
jest.mock('openai');

describe('OpenAIService', () => {
  let openaiService: OpenAIService;
  let mockCreate: jest.Mock;

  const mockUser: User = {
    id: 1,
    email: 'test@example.com',
    password: 'hashedpassword',
    name: 'Test User',
    timezone: 'America/New_York',
    preferences: {
      workHours: '9-5',
      interests: ['coding', 'reading'],
    },
    created_at: new Date(),
    updated_at: new Date(),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockCreate = jest.fn();
    (OpenAI as jest.MockedClass<typeof OpenAI>).mockImplementation(
      () =>
        ({
          chat: {
            completions: {
              create: mockCreate,
            },
          },
        }) as unknown as OpenAI
    );

    openaiService = new OpenAIService();
  });

  describe('generateDailyPlan', () => {
    it('should generate a daily plan successfully', async () => {
      const mockResponse = {
        objectives: 'Complete project tasks\nExercise for 30 minutes\nRead for 1 hour',
        schedule: {
          items: [
            {
              time: '9:00 AM',
              activity: 'Morning standup',
              duration: '30 minutes',
              notes: 'Team sync',
            },
            {
              time: '10:00 AM',
              activity: 'Deep work session',
              duration: '2 hours',
            },
          ],
          summary: 'A productive day focused on work and personal development',
        },
      };

      mockCreate.mockResolvedValue({
        choices: [
          {
            message: {
              content: JSON.stringify(mockResponse),
            },
          },
        ],
      });

      const result = await openaiService.generateDailyPlan({
        user: mockUser,
        userInput: 'Focus on coding tasks',
        date: '2024-01-15',
      });

      expect(result).toEqual(mockResponse);
      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          model: expect.any(String),
          messages: expect.arrayContaining([
            expect.objectContaining({
              role: 'system',
            }),
            expect.objectContaining({
              role: 'user',
            }),
          ]),
        })
      );
    });

    it('should generate a plan without user input', async () => {
      const mockResponse = {
        objectives: 'Default objectives',
        schedule: {
          items: [
            {
              time: '9:00 AM',
              activity: 'Morning routine',
              duration: '1 hour',
            },
          ],
        },
      };

      mockCreate.mockResolvedValue({
        choices: [
          {
            message: {
              content: JSON.stringify(mockResponse),
            },
          },
        ],
      });

      const result = await openaiService.generateDailyPlan({
        user: mockUser,
        date: '2024-01-15',
      });

      expect(result).toEqual(mockResponse);
      expect(mockCreate).toHaveBeenCalled();
    });

    it('should throw error when OpenAI returns no content', async () => {
      mockCreate.mockResolvedValue({
        choices: [
          {
            message: {
              content: null,
            },
          },
        ],
      });

      await expect(
        openaiService.generateDailyPlan({
          user: mockUser,
          date: '2024-01-15',
        })
      ).rejects.toThrow('No response from OpenAI');
    });

    it('should throw error when response has invalid structure', async () => {
      mockCreate.mockResolvedValue({
        choices: [
          {
            message: {
              content: JSON.stringify({
                invalid: 'structure',
              }),
            },
          },
        ],
      });

      await expect(
        openaiService.generateDailyPlan({
          user: mockUser,
          date: '2024-01-15',
        })
      ).rejects.toThrow('Invalid plan structure received from OpenAI');
    });

    it('should handle OpenAI API errors', async () => {
      mockCreate.mockRejectedValue(new Error('API rate limit exceeded'));

      await expect(
        openaiService.generateDailyPlan({
          user: mockUser,
          date: '2024-01-15',
        })
      ).rejects.toThrow('Failed to generate plan: API rate limit exceeded');
    });
  });
});
