import OpenAI from 'openai';
import { config } from '../config';
import { User } from '../types';

export interface GeneratePlanInput {
  user: User;
  userInput?: string;
  date: string;
}

export interface PlanScheduleItem {
  time: string;
  activity: string;
  duration: string;
  notes?: string;
}

export interface GeneratedPlan {
  objectives: string;
  schedule: {
    items: PlanScheduleItem[];
    summary?: string;
  };
}

export class OpenAIService {
  private client: OpenAI;

  constructor() {
    if (!config.openai.apiKey) {
      throw new Error('OpenAI API key is not configured');
    }
    this.client = new OpenAI({
      apiKey: config.openai.apiKey,
    });
  }

  private buildPrompt(input: GeneratePlanInput): string {
    const { user, userInput, date } = input;
    const userPreferences = user.preferences || {};

    let prompt = `You are a helpful AI assistant that creates personalized daily plans. Generate a detailed daily plan for the following user:

User Information:
- Name: ${user.name}
- Timezone: ${user.timezone}
- Date: ${date}`;

    if (Object.keys(userPreferences).length > 0) {
      prompt += `\n- Preferences: ${JSON.stringify(userPreferences, null, 2)}`;
    }

    if (userInput) {
      prompt += `\n\nUser's specific request:\n${userInput}`;
    }

    prompt += `\n\nPlease create a comprehensive daily plan that includes:
1. Clear objectives for the day (2-4 main goals)
2. A detailed schedule with specific times, activities, and durations
3. Consider work-life balance, meal times, breaks, and personal development

Return the response in the following JSON format:
{
  "objectives": "List of 2-4 main objectives for the day, separated by newlines",
  "schedule": {
    "items": [
      {
        "time": "HH:MM AM/PM",
        "activity": "Activity description",
        "duration": "X hours/minutes",
        "notes": "Optional notes or tips"
      }
    ],
    "summary": "Brief summary of the day's plan"
  }
}`;

    return prompt;
  }

  async generateDailyPlan(input: GeneratePlanInput): Promise<GeneratedPlan> {
    try {
      const prompt = this.buildPrompt(input);

      const response = await this.client.chat.completions.create({
        model: config.openai.model,
        messages: [
          {
            role: 'system',
            content:
              'You are a helpful AI assistant that creates personalized daily plans. Always respond with valid JSON.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 2000,
        response_format: { type: 'json_object' },
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from OpenAI');
      }

      const plan = JSON.parse(content) as GeneratedPlan;

      // Validate the structure
      if (!plan.objectives || !plan.schedule || !Array.isArray(plan.schedule.items)) {
        throw new Error('Invalid plan structure received from OpenAI');
      }

      return plan;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to generate plan: ${error.message}`);
      }
      throw new Error('Failed to generate plan: Unknown error');
    }
  }
}
