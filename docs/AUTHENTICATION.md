# Authentication System Documentation

## Overview

This project implements a complete authentication system using the Timro Ticket API with JWT token-based authentication, following Next.js 15 best practices.

## Architecture

### Core Components

1. **API Client** (`src/lib/apiClient.ts`) **✨ NEW**
   - Centralized API client with automatic token refresh
   - Handles all authenticated API requests
   - Request queue system to prevent race conditions
   - Automatic retry on 401 errors with token refresh
   - Type-safe with full TypeScript support

2. **AuthService** (`src/lib/authService.ts`)
   - Handles all API communications with Timro Ticket API
   - Base URL: `https://sandbox.timroticket.com/api/v1`
   - Uses the centralized API client for authenticated endpoints
   - Implements: Login, Register, Logout, Profile, Password Reset, OTP verification

3. **TokenManager** (`src/lib/tokenManager.ts`)
   - Manages JWT tokens securely
   - Access token: Stored in sessionStorage (cleared on browser close)
   - Refresh token: Stored in localStorage (persistent)
   - Auto-expiry checking with 5-minute buffer

4. **AuthStore** (`src/store/authStore.ts`)
   - Zustand-based global state management
   - Persists user data across page refreshes
   - Actions: login(), logout(), fetchProfile(), checkAuth()

5. **AuthProvider** (`src/components/providers/AuthProvider.tsx`)
   - Initializes auth state on app load
   - Checks for existing tokens and validates them

6. **ProtectedRoute** (`src/components/auth/ProtectedRoute.tsx`)
   - HOC for protecting authenticated pages
   - Auto-redirects to login if not authenticated

## Features

### ✅ Implemented

- **Login** (`/login`)
  - Email & password authentication
  - Remember me functionality
  - Real-time form validation with Zod
  - Internationalization (EN, IT, JA)
  - Error handling with user-friendly messages

- **Registration** (`/signup`)
  - User registration with first name, last name, email, phone, password
  - Password strength validation
  - Auto-login after successful registration
  - Terms and conditions consent

- **Forgot Password** (`/forgot-password`)
  - Request password reset via email
  - OTP code generation
  - Success confirmation before reset

- **Reset Password** (`/reset-password`)
  - OTP verification
  - New password with confirmation
  - Auto-redirect to login after success

- **User Profile Management**
  - Fetch user profile after login
  - Display user info in header
  - Logout functionality

- **Token Management**
  - Secure token storage
  - Automatic token refresh
  - Token expiry validation
  - Request queue system for concurrent requests

## API Endpoints

### Authentication Endpoints (Implemented)

```typescript
// Login
POST /auth/login
Body: { email: string, password: string }
Response: { access_token: string, refresh_token: string }

// Register
POST /auth/register
Body: { email, password, first_name, last_name, phone? }
Response: { id, email, first_name, last_name, ... }

// Get Profile
GET /auth/profile
Headers: { Authorization: "Bearer {access_token}" }
Response: { id, email, first_name, last_name, organization, ... }

// Refresh Token
POST /auth/refresh
Body: { refresh_token: string }
Response: { access_token: string, refresh_token: string }

// Logout
POST /auth/logout?all={boolean}
Headers: { Authorization: "Bearer {access_token}" }

// Request Password Reset
POST /auth/reset-password-request
Body: { email: string }

// Reset Password with OTP
POST /auth/reset-password
Body: { reset_token, email_token, new_password, confirm_password }

// Change Password (authenticated users)
POST /auth/change-password
Body: { current_password, new_password, confirm_password }
Headers: { Authorization: "Bearer {access_token}" }

// Update Profile
PUT /auth/profile
Body: { first_name, last_name, phone? }
Headers: { Authorization: "Bearer {access_token}" }
```

## Usage

### 1. Environment Setup

Create `.env.local` file:

```bash
NEXT_PUBLIC_API_BASE_URL=https://sandbox.timroticket.com/api/v1
NEXT_PUBLIC_APP_ENV=development
NEXT_PUBLIC_APP_NAME=Timro Ticket
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2. Using Auth in Components

```typescript
import { useAuthStore } from '@/store/authStore';

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuthStore();

  if (isAuthenticated) {
    return <div>Welcome, {user?.firstName}!</div>;
  }

  return <div>Please log in</div>;
}
```

### 3. Protecting Routes

```typescript
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export default function ProtectedPage() {
  return (
    <ProtectedRoute>
      <div>This content is only visible to authenticated users</div>
    </ProtectedRoute>
  );
}
```

### 4. Manual Login

```typescript
import { useAuthStore } from '@/store/authStore';
import { AuthError } from '@/lib/authService';

const { login } = useAuthStore();

try {
  await login({ email: 'user@example.com', password: 'password' });
  // Login successful
} catch (error) {
  if (error instanceof AuthError) {
    console.error('Login failed:', error.message);
  }
}
```

## State Management

### Auth Store State

```typescript
{
  user: AuthUser | null;           // Current user data
  isAuthenticated: boolean;         // Authentication status
  isLoading: boolean;               // Loading state
  error: string | null;             // Error message
}
```

### Auth Store Actions

```typescript
login(credentials)      // Login user
logout()                // Logout user
fetchProfile()          // Fetch user profile
clearError()            // Clear error state
checkAuth()             // Validate existing tokens
```

## Security Features

1. **Token Storage**
   - Access tokens in sessionStorage (more secure, cleared on browser close)
   - Refresh tokens in localStorage (persistent across sessions)

2. **Token Validation**
   - Auto-check token expiry with 5-minute buffer
   - Redirect to login if tokens are invalid

3. **HTTPS Only**
   - All API calls use HTTPS
   - Production environment enforces secure connections

4. **Input Validation**
   - Client-side validation with Zod
   - Server-side validation via API
   - Sanitized user inputs

5. **Error Handling**
   - Typed error responses
   - User-friendly error messages
   - Network error detection

## Error Handling

### Error Types

```typescript
class AuthError extends Error {
  code: string;        // Error code from API
  status?: number;     // HTTP status code
  details?: any;       // Additional error details
}
```

### Common Error Codes

- `UNAUTHORIZED` - Invalid credentials or expired token
- `NETWORK_ERROR` - Network connectivity issues
- `UNKNOWN_ERROR` - Unexpected errors

## Internationalization

All auth pages support 3 languages:
- English (en)
- Italian (it)
- Japanese (ja)

Translation keys are in `messages/{locale}.json` under the `auth` namespace.

## Best Practices Followed

### Next.js 15 Best Practices

1. **Client Components** - All auth components marked with `'use client'`
2. **Server Actions** - Ready for server-side auth if needed
3. **App Router** - Using App Router structure
4. **Type Safety** - Full TypeScript coverage
5. **Error Boundaries** - Graceful error handling

### Security Best Practices

1. **No sensitive data in URLs** - Using POST requests with body
2. **Secure token storage** - SessionStorage for access tokens
3. **Token rotation** - Refresh token mechanism ready
4. **Input sanitization** - Zod validation on all forms
5. **HTTPS enforcement** - Production-ready API configuration

### Code Organization

```
src/
├── app/
│   ├── login/              # Login page
│   ├── signup/             # Registration page
│   ├── forgot-password/    # Password reset request
│   └── reset-password/     # Password reset with OTP
├── components/
│   ├── auth/
│   │   └── ProtectedRoute.tsx
│   └── providers/
│       └── AuthProvider.tsx
├── lib/
│   ├── apiClient.ts        # Centralized API client (NEW)
│   ├── authService.ts      # Auth service
│   └── tokenManager.ts     # Token management
├── store/
│   └── authStore.ts        # Global state
└── types/
    └── auth.ts             # TypeScript types
```

## Testing

### Test Credentials (Sandbox API)


### Testing Checklist

- [ ] User can register new account
- [ ] User can login with credentials
- [ ] User sees their name in header after login
- [ ] User can logout
- [ ] User can request password reset
- [ ] User can reset password with OTP
- [ ] Protected routes redirect to login when not authenticated
- [ ] Tokens persist across page refreshes
- [ ] Tokens clear on logout
- [ ] Error messages display correctly
- [ ] All translations work properly

## Future Enhancements

### ✅ Recently Implemented

1. **Automatic Token Refresh** ✅
   - Intercepts 401 responses
   - Auto-refreshes access token
   - Retries failed requests
   - Request queue prevents race conditions
   - See `src/lib/apiClient.ts` for implementation

### Ready for Implementation

1. **Role-Based Access Control (RBAC)**
   - Check user roles from profile
   - Protect routes based on roles
   - Organization-level permissions

3. **Email Verification**
   - Send verification email
   - Verify email with OTP
   - Block unverified users from certain actions

4. **Two-Factor Authentication (2FA)**
   - OTP via SMS/Email
   - Backup codes
   - Device trust

5. **Session Management**
   - Active sessions list
   - Revoke specific sessions
   - Security logs

## Troubleshooting

### Common Issues

**Issue**: "Network error" on login
- **Solution**: Check API_BASE_URL in .env.local
- **Solution**: Verify API is accessible from your network

**Issue**: Tokens not persisting
- **Solution**: Check browser localStorage/sessionStorage settings
- **Solution**: Ensure cookies are enabled

**Issue**: User logged out unexpectedly
- **Solution**: Check token expiry
- **Solution**: Verify refresh token is valid

**Issue**: Redirect loop on protected routes
- **Solution**: Ensure AuthProvider is wrapping app
- **Solution**: Check auth initialization in useEffect

## API Documentation

Full API documentation: [Timro Ticket API Swagger](https://sandbox.timroticket.com/swagger/index.html)

## Support

For issues or questions:
- Check this documentation
- Review code comments in source files
- Contact B&B Tech Group

---

**Last Updated**: October 2025
**Version**: 1.0
**Maintained by**: B&B Tech Group
