# API Documentation

## Base URL
```
http://localhost:3000
```

## Authentication

Most endpoints require authentication via JWT token. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Environment Variables

Required environment variables:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=myapp
DB_USER=postgres
DB_PASSWORD=postgres

# JWT Configuration
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=7d

# OpenAI Configuration
OPENAI_API_KEY=your-openai-api-key-here
OPENAI_MODEL=gpt-4
```

## Endpoints

### Authentication

#### Register User
```
POST /auth/register
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "name": "John Doe",
  "timezone": "America/New_York",
  "preferences": {
    "workHours": "9-5",
    "interests": ["coding", "reading"]
  }
}
```

**Response (201):**
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "timezone": "America/New_York"
  }
}
```

#### Login
```
POST /auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response (200):**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "timezone": "America/New_York"
  }
}
```

### Daily Plans

#### Generate Daily Plan
```
POST /plans/generate
```

**Authentication:** Required

**Rate Limit:** 10 requests per hour

**Request Body:**
```json
{
  "date": "2024-01-15",
  "userInput": "Focus on coding tasks and include exercise time"
}
```

**Fields:**
- `date` (optional): Date in YYYY-MM-DD format. Defaults to today.
- `userInput` (optional): Specific instructions or preferences for the plan.

**Response (201):**
```json
{
  "message": "Plan generated successfully",
  "plan": {
    "id": 1,
    "date": "2024-01-15T00:00:00.000Z",
    "objectives": "Complete project tasks\nExercise for 30 minutes\nRead for 1 hour",
    "schedule": {
      "items": [
        {
          "time": "9:00 AM",
          "activity": "Morning standup meeting",
          "duration": "30 minutes",
          "notes": "Team sync and daily planning"
        },
        {
          "time": "10:00 AM",
          "activity": "Deep work session - Coding",
          "duration": "2 hours",
          "notes": "Focus on feature implementation"
        },
        {
          "time": "12:00 PM",
          "activity": "Lunch break",
          "duration": "1 hour"
        },
        {
          "time": "1:00 PM",
          "activity": "Code review and meetings",
          "duration": "1.5 hours"
        },
        {
          "time": "3:00 PM",
          "activity": "Exercise",
          "duration": "45 minutes",
          "notes": "Gym or outdoor activity"
        },
        {
          "time": "6:00 PM",
          "activity": "Reading time",
          "duration": "1 hour",
          "notes": "Personal development"
        }
      ],
      "summary": "A balanced day focused on productivity, physical health, and personal growth"
    },
    "created_at": "2024-01-15T08:00:00.000Z"
  }
}
```

**Error Responses:**

- `400 Bad Request`: Invalid date format
```json
{
  "error": "Invalid date format. Use YYYY-MM-DD"
}
```

- `404 Not Found`: User not found
```json
{
  "error": "User not found"
}
```

- `429 Too Many Requests`: Rate limit exceeded
```json
{
  "error": "Too many plan generation requests, please try again later"
}
```

- `500 Internal Server Error`: OpenAI or server error
```json
{
  "error": "Failed to generate plan: <error details>"
}
```

#### Get Today's Plan
```
GET /plans/today
```

**Authentication:** Required

**Response (200):**
```json
{
  "plan": {
    "id": 1,
    "date": "2024-01-15T00:00:00.000Z",
    "objectives": "Complete project tasks\nExercise for 30 minutes\nRead for 1 hour",
    "schedule": {
      "items": [
        {
          "time": "9:00 AM",
          "activity": "Morning standup meeting",
          "duration": "30 minutes"
        }
      ],
      "summary": "A balanced day"
    },
    "created_at": "2024-01-15T08:00:00.000Z"
  }
}
```

**Error Responses:**

- `404 Not Found`: No plan exists for today
```json
{
  "error": "No plan found for today"
}
```

#### Get Plan by Date
```
GET /plans/:date
```

**Authentication:** Required

**Parameters:**
- `date`: Date in YYYY-MM-DD format

**Example:**
```
GET /plans/2024-01-15
```

**Response (200):**
```json
{
  "plan": {
    "id": 1,
    "date": "2024-01-15T00:00:00.000Z",
    "objectives": "Complete project tasks\nExercise for 30 minutes\nRead for 1 hour",
    "schedule": {
      "items": [
        {
          "time": "9:00 AM",
          "activity": "Morning standup meeting",
          "duration": "30 minutes"
        }
      ],
      "summary": "A balanced day"
    },
    "created_at": "2024-01-15T08:00:00.000Z"
  }
}
```

**Error Responses:**

- `400 Bad Request`: Invalid date format
```json
{
  "error": "Invalid date format. Use YYYY-MM-DD"
}
```

- `404 Not Found`: No plan exists for the specified date
```json
{
  "error": "No plan found for date: 2024-01-15"
}
```

### Health Check

#### Get Server Health
```
GET /health
```

**Authentication:** Not required

**Response (200):**
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "database": "connected",
  "environment": "development"
}
```

## Error Handling

All endpoints follow a consistent error format:

```json
{
  "error": "Error message description"
}
```

Common HTTP status codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request (invalid input)
- `401`: Unauthorized (missing or invalid token)
- `404`: Not Found
- `409`: Conflict (e.g., user already exists)
- `429`: Too Many Requests (rate limit exceeded)
- `500`: Internal Server Error

## Rate Limiting

The `/plans/generate` endpoint is rate-limited to:
- **10 requests per hour** per user

Rate limit headers are included in responses:
```
RateLimit-Limit: 10
RateLimit-Remaining: 9
RateLimit-Reset: 1234567890
```

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  timezone VARCHAR(100) DEFAULT 'UTC',
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Daily Plans Table
```sql
CREATE TABLE daily_plans (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan_date DATE NOT NULL,
  objectives TEXT,
  schedule JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, plan_date)
);
```

## Running Migrations

To set up the database schema:

```bash
yarn workspace server migrate
```

## Development

Start the development server:

```bash
yarn workspace server dev
```

Run tests:

```bash
yarn workspace server test
```

## Notes

1. **OpenAI API Key**: Make sure to set a valid OpenAI API key in your environment variables. The service uses GPT-4 by default.

2. **JWT Secret**: Change the default JWT secret in production to a secure random string.

3. **Database**: Ensure PostgreSQL is running and accessible before starting the server.

4. **Timezone**: User timezones affect plan generation. The AI considers the user's timezone when creating schedules.

5. **Preferences**: User preferences (stored as JSONB) are included in the prompt sent to OpenAI for more personalized plans.

6. **Plan Updates**: If a plan already exists for a date, generating a new plan will replace it (upsert behavior).
