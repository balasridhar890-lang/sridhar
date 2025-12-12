# AI Plan API Implementation

## Summary

This document describes the implementation of the AI-powered daily plan generation API feature.

## Features Implemented

### 1. Database Schema

Created two main tables:

- **users**: Stores user authentication and profile information
  - Email, password (hashed with bcrypt)
  - Name, timezone, preferences (JSONB)
  - Created/updated timestamps

- **daily_plans**: Stores generated daily plans
  - User ID (foreign key)
  - Plan date (unique per user)
  - Objectives (text)
  - Schedule (JSONB with flexible structure)
  - Created timestamp

### 2. Migration System

- Created a custom migration runner (`src/migrate.ts`)
- Migrations stored in `migrations/` directory
- Tracks executed migrations in database
- Run with: `yarn workspace server migrate`

### 3. Authentication

- JWT-based authentication
- bcrypt password hashing
- Registration and login endpoints
- Auth middleware for protected routes
- Token expiration configurable via env vars

### 4. OpenAI Integration

**OpenAIService** (`src/services/openai.service.ts`):
- Builds personalized prompts using user profile data
- Combines user timezone, preferences, and optional input
- Uses GPT-4 to generate structured daily plans
- Returns JSON with objectives and schedule items
- Error handling for API failures

**Prompt Strategy**:
- Includes user name, timezone, date
- Incorporates user preferences (work hours, interests, etc.)
- Accepts optional user input for specific requests
- Requests structured JSON response with objectives and schedule

### 5. API Endpoints

#### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login and receive JWT token

#### Daily Plans
- `POST /plans/generate` - Generate AI plan (auth required, rate-limited)
- `GET /plans/today` - Get today's plan (auth required)
- `GET /plans/:date` - Get plan by date (auth required)

### 6. Rate Limiting

- Implemented using `express-rate-limit`
- 10 requests per hour for plan generation
- Prevents API abuse and controls OpenAI costs

### 7. Error Handling

- Comprehensive error handling in all controllers
- Validation for date formats
- User-friendly error messages
- Proper HTTP status codes

### 8. Testing

Created comprehensive test suites:

- **OpenAI Service Tests**: Mock OpenAI responses, test error cases
- **Plans Controller Tests**: Test all endpoints, validation, error handling
- **DailyPlan Model Tests**: Test CRUD operations, database queries

All tests use mocked dependencies and pass successfully.

### 9. Documentation

- **API.md**: Complete API documentation with examples
- **README.md**: Updated with new features and setup instructions
- **Environment variables**: Documented all required configs

## File Structure

```
server/
├── migrations/
│   ├── 001_create_users_table.sql
│   └── 002_create_daily_plans_table.sql
├── src/
│   ├── __tests__/
│   │   ├── controllers/
│   │   │   └── plans.controller.test.ts
│   │   ├── models/
│   │   │   └── DailyPlan.test.ts
│   │   └── services/
│   │       └── openai.service.test.ts
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   └── plans.controller.ts
│   ├── middleware/
│   │   └── auth.ts
│   ├── models/
│   │   ├── DailyPlan.ts
│   │   └── User.ts
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   └── plans.routes.ts
│   ├── services/
│   │   └── openai.service.ts
│   ├── types/
│   │   └── index.ts
│   ├── config.ts
│   ├── database.ts
│   ├── index.ts
│   └── migrate.ts
├── API.md
├── IMPLEMENTATION.md
└── package.json
```

## Setup Instructions

1. **Install dependencies**:
   ```bash
   yarn install
   ```

2. **Set environment variables**:
   ```bash
   cp server/.env.example server/.env
   ```
   Edit `.env` and add:
   - `OPENAI_API_KEY`: Your OpenAI API key
   - `JWT_SECRET`: A secure random string

3. **Start database**:
   ```bash
   docker-compose up postgres
   ```

4. **Run migrations**:
   ```bash
   yarn workspace server migrate
   ```

5. **Start server**:
   ```bash
   yarn workspace server dev
   ```

## Testing the API

### 1. Register a user
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "name": "John Doe",
    "timezone": "America/New_York",
    "preferences": {
      "workHours": "9-5",
      "interests": ["coding", "fitness"]
    }
  }'
```

### 2. Generate a plan
```bash
curl -X POST http://localhost:3000/plans/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "date": "2024-01-15",
    "userInput": "Focus on coding and include exercise time"
  }'
```

### 3. Get today's plan
```bash
curl http://localhost:3000/plans/today \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Security Considerations

1. **Password Security**: bcrypt with salt rounds of 10
2. **JWT Tokens**: Signed with secret, 7-day expiration
3. **Rate Limiting**: Prevents API abuse
4. **Environment Variables**: Sensitive data in .env files
5. **SQL Injection**: Using parameterized queries with pg

## Performance Considerations

1. **Database Indexes**: On email, user_id, and plan_date
2. **Unique Constraints**: Prevents duplicate plans per date
3. **Upsert Pattern**: ON CONFLICT clause for plan updates
4. **Connection Pooling**: pg Pool for database connections

## Acceptance Criteria Verification

✅ Database schema created with migrations
✅ OpenAI service with prompt templates
✅ User profile data (name, timezone, preferences) included in prompts
✅ POST /plans/generate endpoint (auth required)
✅ GET /plans/today endpoint
✅ GET /plans/:date endpoint
✅ Rate limiting on plan generation
✅ Error handling throughout
✅ Config-driven OpenAI key
✅ Unit tests with mocked OpenAI
✅ Documentation updated
✅ Tests pass
✅ Generating a plan persists record tied to user
✅ Fetching by date returns saved structure

## Future Enhancements

Potential improvements:
- Background job queue for plan generation (Bull/BullMQ)
- Plan history and analytics
- Plan sharing between users
- Custom plan templates
- WebSocket notifications for plan completion
- Plan modification endpoints (PUT/PATCH)
- Pagination for plan listing
- Plan search and filtering
- Integration with calendar services
