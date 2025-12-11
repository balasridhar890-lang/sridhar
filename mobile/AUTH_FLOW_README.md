# Mobile Auth Flow Implementation

This React Native mobile application implements a complete authentication flow with Redux state management and React Navigation.

## Features

- **Authentication Screens**: Welcome, Login, and Sign Up screens
- **Redux State Management**: Redux Toolkit with async thunks for auth actions
- **Navigation Guards**: Protected routes that redirect unauthenticated users
- **API Integration**: Axios client with token persistence
- **AsyncStorage**: Token and user data persistence across app restarts
- **Form Validation**: Client-side validation for login and registration forms
- **Loading States**: Loading indicators during API calls
- **Error Handling**: Proper error display and handling
- **Redux DevTools**: Development debugging support

## Architecture

### Store Structure
```
src/store/
├── index.js          # Redux store configuration
├── authSlice.js      # Authentication slice with async thunks
```

### Screen Components
```
src/screens/
├── WelcomeScreen.js  # Welcome/landing screen
├── LoginScreen.js    # User login form
├── SignUpScreen.js   # User registration form
├── HomeScreen.js     # Protected home screen
```

### API Layer
```
src/api/
├── client.js         # Axios client with interceptors
```

### Storage Utilities
```
src/utils/
├── storage.js        # AsyncStorage utilities for token/user data
```

## Key Components

### Authentication Flow

1. **App Launch**: Redux store loads stored auth data from AsyncStorage
2. **Navigation Decision**: Based on auth state, user is directed to:
   - Auth stack (Welcome → Login/SignUp) if not authenticated
   - Home screen if authenticated
3. **Login/Registration**: API calls to `/auth/login` and `/auth/register`
4. **Token Storage**: Successful auth stores token and user data
5. **State Update**: Redux state updates, triggering navigation
6. **Home Access**: Authenticated users can access protected content

### Redux Actions

- `loginUser()` - Login with email/password
- `registerUser()` - Register new user account
- `loadStoredAuth()` - Load existing auth from storage
- `logoutUser()` - Clear auth data and logout

### API Endpoints

- `POST /auth/login` - User authentication
- `POST /auth/register` - User registration

Expected response format:
```javascript
{
  token: "jwt_token_here",
  user: {
    id: "user_id",
    name: "User Name",
    email: "user@example.com"
  }
}
```

### Storage Keys

- `authToken` - JWT token for API requests
- `userData` - Serialized user information

## Configuration

### Environment Variables
```bash
API_URL=http://localhost:3000
NODE_ENV=development
```

### Redux DevTools
Enabled in development mode only for state debugging.

## Usage

### Development

1. **Install Dependencies**: `yarn install`
2. **Start Metro**: `yarn start`
3. **Run on Device**: `yarn android` or `yarn ios`

### Testing
- **Run Tests**: `yarn test`
- **Lint Code**: `yarn lint`

## User Journey

1. **New User**: Welcome → Sign Up → Login → Home
2. **Returning User**: App auto-loads → Direct to Home
3. **Logout**: Home → Clear storage → Back to Auth stack

## Security Features

- Token-based authentication
- Automatic token injection in API requests
- Form validation before API calls
- Navigation guards prevent unauthorized access
- Error boundary handling for API failures

## Dependencies

- React Navigation for navigation
- Redux Toolkit for state management
- Axios for HTTP requests
- AsyncStorage for local persistence
- React Native components for UI

## Debugging

### Redux DevTools
Monitor state changes, actions, and time-travel debugging in development.

### Network Requests
Check API calls and responses via React Native debugger or Flipper.

### AsyncStorage
View stored tokens and user data using React Native debugging tools.