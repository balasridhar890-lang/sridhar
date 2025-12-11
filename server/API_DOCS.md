# Authentication API Documentation

## Base URL
```
http://localhost:3000
```

## Authentication

All protected endpoints require an `Authorization` header with a Bearer token:

```
Authorization: Bearer <access_token>
```

## Endpoints

### 1. Register User
Creates a new user account.

**Endpoint:** `POST /auth/register`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe",
  "timezone": "UTC"
}
```

**Request Fields:**
- `email` (string, required): Valid email address
- `password` (string, required): Minimum 6 characters
- `name` (string, required): User's full name
- `timezone` (string, optional): IANA timezone identifier (defaults to UTC)

**Success Response (201):**
```json
{
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "clh3z5k1x000108jd9w3z9k1x",
      "email": "user@example.com",
      "name": "John Doe",
      "timezone": "UTC",
      "subscription_tier": "free",
      "created_at": "2024-01-15T10:30:00.000Z"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
}
```

**Error Responses:**
- `400 Bad Request`: Invalid input data
  ```json
  {
    "error": "Validation failed",
    "details": [
      {
        "field": "email",
        "message": "Invalid email address"
      }
    ]
  }
  ```
- `409 Conflict`: User with this email already exists
  ```json
  {
    "error": "User with this email already exists"
  }
  ```

**Example cURL:**
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securePassword123",
    "name": "John Doe",
    "timezone": "UTC"
  }'
```

---

### 2. Login User
Authenticates a user and returns access/refresh tokens.

**Endpoint:** `POST /auth/login`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Request Fields:**
- `email` (string, required): User's email address
- `password` (string, required): User's password

**Success Response (200):**
```json
{
  "message": "Login successful",
  "data": {
    "user": {
      "id": "clh3z5k1x000108jd9w3z9k1x",
      "email": "user@example.com",
      "name": "John Doe",
      "timezone": "UTC",
      "subscription_tier": "free",
      "created_at": "2024-01-15T10:30:00.000Z"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
}
```

**Error Responses:**
- `400 Bad Request`: Invalid input data
- `401 Unauthorized`: Invalid email or password
  ```json
  {
    "error": "Invalid email or password"
  }
  ```

**Example cURL:**
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securePassword123"
  }'
```

---

### 3. Get User Profile (Protected)
Retrieves the authenticated user's profile information.

**Endpoint:** `GET /auth/me`

**Required Headers:**
```
Authorization: Bearer <access_token>
```

**Success Response (200):**
```json
{
  "message": "Profile fetched successfully",
  "data": {
    "id": "clh3z5k1x000108jd9w3z9k1x",
    "email": "user@example.com",
    "name": "John Doe",
    "timezone": "UTC",
    "subscription_tier": "free",
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-15T10:30:00.000Z"
  }
}
```

**Error Responses:**
- `401 Unauthorized`: Missing, invalid, or expired token
  ```json
  {
    "error": "Invalid or expired token"
  }
  ```
- `404 Not Found`: User not found
  ```json
  {
    "error": "User not found"
  }
  ```

**Example cURL:**
```bash
curl -X GET http://localhost:3000/auth/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## Token Details

### Access Token
- Expires in: 15 minutes (configurable via `JWT_ACCESS_TOKEN_EXPIRY` env var)
- Used for authenticating requests to protected endpoints

### Refresh Token
- Expires in: 7 days (configurable via `JWT_REFRESH_TOKEN_EXPIRY` env var)
- Can be used to obtain a new access token (future implementation)

---

## Database Schema

### User Table

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID/CUID | Primary key (auto-generated) |
| `email` | String | Unique email address |
| `password_hash` | String | Bcrypt hashed password |
| `name` | String | User's full name |
| `timezone` | String | IANA timezone (default: UTC) |
| `subscription_tier` | String | Subscription level (default: free) |
| `created_at` | DateTime | Account creation timestamp |
| `updated_at` | DateTime | Last update timestamp |

---

## Environment Variables

```env
# Server
PORT=3000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=myapp
DB_USER=postgres
DB_PASSWORD=postgres
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/myapp

# JWT
JWT_SECRET=your_jwt_secret_key_change_this_in_production
JWT_ACCESS_TOKEN_EXPIRY=15m
JWT_REFRESH_TOKEN_EXPIRY=7d
```

---

## Testing

### Run all tests:
```bash
yarn workspace server test
```

### Run tests in watch mode:
```bash
yarn workspace server test:watch
```

### Test Coverage:
- Auth Service: Password hashing, token generation/verification, user registration/login/profile
- Auth Routes: Integration tests for all endpoints with happy and error paths
- Validation: Input validation with proper error messages

---

## Running the Application

### Development:
```bash
yarn workspace server dev
```

### Production Build:
```bash
yarn workspace server build
yarn workspace server start
```

### With Docker:
```bash
docker-compose up
```

---

## Database Migrations

### Create migration:
```bash
cd server && npx prisma migrate dev --name <migration_name>
```

### Run migrations:
```bash
cd server && npx prisma migrate deploy
```

### Reset database (⚠️ WARNING - deletes all data):
```bash
cd server && npx prisma migrate reset
```
