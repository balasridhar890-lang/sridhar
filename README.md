# Monorepo Project

This is a monorepo containing a React Native mobile application and a Node.js/Express backend server, managed by Yarn workspaces.

## Project Structure

```
.
├── mobile/          # React Native mobile app (JavaScript)
├── server/          # Node.js/Express backend (TypeScript)
├── docker-compose.yml
└── package.json     # Root workspace configuration
```

## Prerequisites

- Node.js >= 18.0.0
- Yarn >= 1.22.0
- Docker and Docker Compose (for running PostgreSQL and containerized server)
- For React Native development:
  - iOS: Xcode and CocoaPods (macOS only)
  - Android: Android Studio and Android SDK

## Installation

Install all dependencies for both workspaces:

```bash
yarn install
```

This will install dependencies for both the mobile app and the server.

## Running the Applications

### Server (Express Backend)

#### Option 1: Run with Docker Compose (Recommended)

Start both PostgreSQL and the server:

```bash
docker-compose up
```

The server will be available at `http://localhost:3000`.

#### Option 2: Run locally in development mode

1. First, ensure PostgreSQL is running (via Docker):

```bash
docker-compose up postgres
```

2. Create a `.env` file in the `server/` directory (copy from `.env.example`):

```bash
cp server/.env.example server/.env
```

Edit the `.env` file and add your OpenAI API key and JWT secret.

3. Run database migrations:

```bash
yarn workspace server migrate
```

4. Start the development server:

```bash
yarn workspace server dev
```

Or use the convenience script:

```bash
yarn dev:server
```

The server will be available at `http://localhost:3000`.

#### Server Endpoints

- `GET /` - Basic server info
- `GET /health` - Health check endpoint with database connection status
- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login and get JWT token
- `POST /plans/generate` - Generate AI-powered daily plan (auth required)
- `GET /plans/today` - Get today's plan (auth required)
- `GET /plans/:date` - Get plan by date (auth required)

See [API.md](server/API.md) for detailed API documentation.

### Mobile (React Native)

1. Create a `.env` file in the `mobile/` directory (copy from `.env.example`):

```bash
cp mobile/.env.example mobile/.env
```

2. Start Metro bundler:

```bash
yarn workspace mobile start
```

Or use the convenience script:

```bash
yarn start:mobile
```

3. In a separate terminal, run the app:

For iOS:
```bash
yarn workspace mobile ios
```

For Android:
```bash
yarn workspace mobile android
```

## Development Scripts

### Root level scripts

- `yarn install` - Install all dependencies
- `yarn lint` - Run linting for all workspaces
- `yarn test` - Run tests for all workspaces

### Server workspace scripts

- `yarn workspace server dev` - Start development server with hot reload
- `yarn workspace server build` - Build TypeScript to JavaScript
- `yarn workspace server start` - Run production build
- `yarn workspace server migrate` - Run database migrations
- `yarn workspace server test` - Run Jest tests
- `yarn workspace server lint` - Run ESLint
- `yarn workspace server format` - Format code with Prettier

### Mobile workspace scripts

- `yarn workspace mobile start` - Start Metro bundler
- `yarn workspace mobile android` - Run on Android
- `yarn workspace mobile ios` - Run on iOS
- `yarn workspace mobile test` - Run Jest tests
- `yarn workspace mobile lint` - Run ESLint

## Technology Stack

### Server
- **Runtime**: Node.js
- **Framework**: Express
- **Language**: TypeScript
- **Database**: PostgreSQL
- **Authentication**: JWT (JSON Web Tokens)
- **AI Integration**: OpenAI GPT-4 for daily plan generation
- **Security**: bcrypt for password hashing, express-rate-limit for API protection
- **Testing**: Jest with mocked dependencies
- **Linting**: ESLint + Prettier
- **Dev Tools**: ts-node-dev for hot reload

### Mobile
- **Framework**: React Native 0.83.0
- **Language**: JavaScript
- **Navigation**: React Navigation
- **State Management**: Redux Toolkit
- **Testing**: Jest + React Test Renderer
- **Linting**: ESLint + Prettier

## Docker Services

The `docker-compose.yml` file defines two services:

- **postgres**: PostgreSQL 15 database on port 5432
- **server**: Express backend on port 3000

Data is persisted in a Docker volume named `postgres_data`.

## Environment Variables

### Server (.env)
```
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

### Mobile (.env)
```
API_URL=http://localhost:3000
NODE_ENV=development
```

## Troubleshooting

### Server won't connect to database

Ensure PostgreSQL is running:
```bash
docker-compose up postgres
```

Check the database connection settings in `server/.env`.

### Metro bundler cache issues

Clear Metro cache:
```bash
yarn workspace mobile start --reset-cache
```

### Android build issues

Clean and rebuild:
```bash
cd mobile/android
./gradlew clean
cd ../..
yarn workspace mobile android
```

### iOS build issues

Clean pods and reinstall:
```bash
cd mobile/ios
pod deintegrate
pod install
cd ../..
yarn workspace mobile ios
```

## Contributing

1. Create a feature branch
2. Make your changes
3. Run linting and tests: `yarn lint && yarn test`
4. Submit a pull request

## License

Private - All rights reserved
