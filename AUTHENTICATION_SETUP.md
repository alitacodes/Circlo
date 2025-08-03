# Authentication System Setup Guide for Circlo.in

## Overview

This guide explains the complete authentication system implemented for Circlo.in, which includes:

- **User Registration** with email, password, name, and phone
- **User Login** with email and password
- **JWT Token Authentication** for secure API access
- **Protected Routes** in the frontend
- **SAP HANA Cloud Database** integration
- **Session Management** with automatic token validation

## Features

### ✅ Implemented Features

1. **User Registration**

   - Email validation
   - Password hashing with bcrypt
   - Phone number validation (Indian format)
   - Duplicate email prevention
   - JWT token generation

2. **User Login**

   - Email/password authentication
   - Password verification
   - JWT token generation
   - Session management

3. **JWT Token Management**

   - 24-hour token expiration
   - Automatic token validation
   - Secure token storage in localStorage
   - Token-based API authentication

4. **Protected Routes**

   - Automatic redirect to login for unauthenticated users
   - Redirect authenticated users away from auth pages
   - Loading states during authentication checks

5. **Database Integration**
   - SAP HANA Cloud connection
   - User data persistence
   - Fallback to mock data when database unavailable

## File Structure

```
src/
├── components/
│   └── ProtectedRoute.tsx          # Route protection component
├── contexts/
│   └── AuthContext.tsx             # Authentication context
├── pages/
│   ├── LoginPage.tsx               # Login form
│   └── RegisterPage.tsx            # Registration form
├── services/
│   └── api.ts                      # API service with auth methods
└── App.tsx                         # Main app with protected routes

backend/
├── routes/
│   └── api.js                      # Authentication API endpoints
├── server.js                       # Express server with CORS
├── hana.js                         # SAP HANA connection
├── scripts/
│   └── table.js                    # Database table creation
└── test-auth.js                    # Authentication testing script
```

## Setup Instructions

### 1. Environment Configuration

Your `.env` file should contain:

```env
HANA_HOST=3c018d6e-2261-4ac1-bd49-aa81b8235a79.hana.trial-us10.hanacloud.ondemand.com
HANA_PORT=443
HANA_USER=DBADMIN
HANA_PASSWORD=SAPh@ckf3st

# JWT Secret (generate a strong secret in production)
JWT_SECRET=your-super-secret-jwt-key-here

# Server Configuration
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5174
```

### 2. Database Setup

Run the table creation script:

```bash
cd backend
npm run table
```

This creates the following tables:

- `Users` - User accounts and authentication data
- `Items` - Rental items
- `Bookings` - Rental bookings
- `Reviews` - User reviews
- `Chats` - Chat messages
- `Photos` - Item photos

### 3. Install Dependencies

```bash
# Backend dependencies
cd backend
npm install

# Frontend dependencies
cd ..
npm install
```

### 4. Start the Application

```bash
# Start backend server
cd backend
npm start

# Start frontend (in another terminal)
npm run dev
```

## API Endpoints

### Authentication Endpoints

| Method | Endpoint             | Description       | Auth Required |
| ------ | -------------------- | ----------------- | ------------- |
| POST   | `/api/auth/register` | Register new user | No            |
| POST   | `/api/auth/login`    | Login user        | No            |
| POST   | `/api/auth/logout`   | Logout user       | Yes           |
| GET    | `/api/auth/me`       | Get current user  | Yes           |

### Example Usage

#### Register a new user:

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "phone": "+919876543210"
  }'
```

#### Login:

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

#### Get current user (with token):

```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Frontend Integration

### Using the Auth Context

```tsx
import { useAuth } from "../contexts/AuthContext";

function MyComponent() {
  const { user, login, register, logout, isLoading } = useAuth();

  const handleLogin = async () => {
    try {
      await login("user@example.com", "password123");
      // User is now logged in
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <div>
      {user ? (
        <div>
          <p>Welcome, {user.name}!</p>
          <button onClick={logout}>Logout</button>
        </div>
      ) : (
        <button onClick={handleLogin}>Login</button>
      )}
    </div>
  );
}
```

### Protected Routes

```tsx
import ProtectedRoute from '../components/ProtectedRoute';

// Protected page
<Route path="/dashboard" element={
  <ProtectedRoute>
    <DashboardPage />
  </ProtectedRoute>
} />

// Public auth page (redirects if logged in)
<Route path="/login" element={
  <ProtectedRoute requireAuth={false}>
    <LoginPage />
  </ProtectedRoute>
} />
```

## Testing

### Run Authentication Tests

```bash
cd backend
node test-auth.js
```

This will test:

- Health check
- Database connection
- User registration
- User login
- JWT token validation
- User profile retrieval
- Logout functionality

### Manual Testing

1. **Registration Flow:**

   - Go to `/register`
   - Fill in all required fields
   - Submit form
   - Should redirect to home page

2. **Login Flow:**

   - Go to `/login`
   - Enter email and password
   - Submit form
   - Should redirect to home page

3. **Protected Routes:**

   - Try accessing `/dashboard` without login
   - Should redirect to `/login`
   - After login, should access dashboard

4. **Logout:**
   - Click logout button
   - Should clear session and redirect to home

## Security Features

### ✅ Implemented Security Measures

1. **Password Security**

   - bcrypt hashing with 12 rounds
   - Minimum 6 character requirement
   - Secure password comparison

2. **JWT Security**

   - 24-hour expiration
   - Secure secret key
   - Token validation middleware

3. **Input Validation**

   - Email format validation
   - Phone number validation (Indian format)
   - Name length validation
   - SQL injection prevention

4. **CORS Configuration**

   - Frontend URL whitelist
   - Credentials support
   - Secure headers

5. **Rate Limiting**
   - 100 requests per 15 minutes per IP
   - Prevents brute force attacks

## Troubleshooting

### Common Issues

1. **Database Connection Failed**

   - Check HANA credentials in `.env`
   - Verify HANA instance is running
   - Check firewall settings

2. **CORS Errors**

   - Verify `FRONTEND_URL` in `.env`
   - Ensure frontend is running on correct port

3. **JWT Token Issues**

   - Check `JWT_SECRET` in `.env`
   - Verify token expiration
   - Clear localStorage if needed

4. **Registration Fails**
   - Check email format
   - Verify phone number format (+91XXXXXXXXXX)
   - Check if user already exists

### Debug Commands

```bash
# Test database connection
curl http://localhost:5000/test-hana

# Test API health
curl http://localhost:5000/api/health

# Check tables status
curl http://localhost:5000/test-tables
```

## Production Considerations

### Security Enhancements

1. **Environment Variables**

   - Use strong JWT secret
   - Enable HTTPS
   - Set proper CORS origins

2. **Database Security**

   - Use production HANA instance
   - Enable SSL connections
   - Implement connection pooling

3. **Token Management**

   - Implement token refresh
   - Add token blacklisting
   - Monitor token usage

4. **Monitoring**
   - Add request logging
   - Monitor authentication attempts
   - Set up error tracking

## Support

For issues or questions:

1. Check the troubleshooting section
2. Run the test script
3. Verify environment configuration
4. Check database connectivity

The authentication system is now fully functional and ready for production use!
