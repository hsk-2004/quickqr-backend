# QuickQR Backend API Documentation

Complete API reference for the QuickQR authentication server.

## Base URL

```
http://localhost:5000/api
```

## Response Format

All responses are JSON with consistent structure:

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data here
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "User-friendly error message",
  "error": "Detailed error trace (development only)"
}
```

## HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Request successful |
| 201 | Created - Resource created successfully |
| 400 | Bad Request - Invalid input or validation error |
| 401 | Unauthorized - Missing or invalid credentials |
| 409 | Conflict - Resource already exists |
| 500 | Server Error - Internal server error |

## Authentication

All protected endpoints require a JWT token in the Authorization header:

```bash
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Endpoints

### 1. Health Check

Check if the server is running.

**Request:**
```http
GET /health
```

**Response (200):**
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-02-05T10:30:00.000Z"
}
```

---

### 2. User Registration

Create a new user account.

**Request:**
```http
POST /auth/register
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "secure123"
}
```

**Request Body:**

| Field | Type | Required | Validation |
|-------|------|----------|-----------|
| username | string | ✓ | 3-50 chars, alphanumeric + underscore, unique |
| email | string | ✓ | Valid email format, unique |
| password | string | ✓ | Minimum 6 characters |

**Success Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjU1MGU4NDAwLWUyOWItNDFkNC1hNzE2LTQ0NjY1NTQ0MDAwMCIsImVtYWlsIjoiam9obkBleGFtcGxlLmNvbSIsImlhdCI6MTcwNzEyMDYwMCwiZXhwIjoxNzA3NzI1NDAwfQ.signedSignature",
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "username": "john_doe",
      "email": "john@example.com",
      "createdAt": "2024-02-05T10:30:00.000Z"
    }
  }
}
```

**Error Responses:**

Missing fields (400):
```json
{
  "success": false,
  "message": "Username, email, and password are required"
}
```

Invalid username format (400):
```json
{
  "success": false,
  "message": "Username must be 3-50 chars and contain only letters, numbers, and underscores"
}
```

Invalid email format (400):
```json
{
  "success": false,
  "message": "Invalid email format"
}
```

Weak password (400):
```json
{
  "success": false,
  "message": "Password must be at least 6 characters long"
}
```

User already exists (409):
```json
{
  "success": false,
  "message": "User with this email or username already exists"
}
```

---

### 3. User Login

Authenticate with existing credentials.

**Request:**
```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "secure123"
}
```

**Request Body:**

| Field | Type | Required |
|-------|------|----------|
| email | string | ✓ |
| password | string | ✓ |

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjU1MGU4NDAwLWUyOWItNDFkNC1hNzE2LTQ0NjY1NTQ0MDAwMCIsImVtYWlsIjoiam9obkBleGFtcGxlLmNvbSIsImlhdCI6MTcwNzEyMDYwMCwiZXhwIjoxNzA3NzI1NDAwfQ.signedSignature",
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "username": "john_doe",
      "email": "john@example.com"
    }
  }
}
```

**Error Responses:**

Missing fields (400):
```json
{
  "success": false,
  "message": "Email and password are required"
}
```

Invalid credentials (401):
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

---

## JWT Token Details

### Token Content
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "john@example.com",
  "iat": 1707120600,
  "exp": 1707725400
}
```

### Token Properties
- **id** - User's UUID
- **email** - User's email address
- **iat** - Issued at timestamp (seconds since epoch)
- **exp** - Expiration timestamp (7 days from creation)

### Decoding JWT
To inspect token payload (optional, for debugging):

```javascript
// In JavaScript
const payload = JSON.parse(atob(token.split('.')[1]));
console.log(payload);

// Or use online tool: https://jwt.io
```

---

## Error Codes

| Error | Status | Cause |
|-------|--------|-------|
| Missing fields | 400 | Required field not provided |
| Invalid format | 400 | Input validation failed |
| User exists | 409 | Username or email already registered |
| Invalid credentials | 401 | Wrong email or password |
| Token expired | 401 | JWT token older than 7 days |
| Invalid token | 401 | Malformed or tampered token |
| Server error | 500 | Database or internal error |

---

## Using with Frontend

### In React with Axios

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Add token to requests if it exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Register
const register = async (userData) => {
  const response = await api.post('/auth/register', userData);
  localStorage.setItem('token', response.data.data.token);
  return response.data.data.user;
};

// Login
const login = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  localStorage.setItem('token', response.data.data.token);
  return response.data.data.user;
};

// Logout
const logout = () => {
  localStorage.removeItem('token');
};
```

### In React with useEffect

```javascript
useEffect(() => {
  const checkAuth = async () => {
    try {
      // Verify token is still valid by making a protected request
      // (requires a /api/user/me endpoint)
      const response = await api.get('/user/me');
      setUser(response.data.data);
    } catch (error) {
      localStorage.removeItem('token');
      setUser(null);
    }
  };

  checkAuth();
}, []);
```

---

## Testing Examples

### Using cURL

Register:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "test123"
  }'
```

Login:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123"
  }'
```

Health check:
```bash
curl http://localhost:5000/api/health
```

### Using Postman

1. **Register Request:**
   - Method: POST
   - URL: `http://localhost:5000/api/auth/register`
   - Body (JSON):
   ```json
   {
     "username": "postman_user",
     "email": "postman@example.com",
     "password": "postman123"
   }
   ```
   - Click Send
   - Copy the `token` from response

2. **Login Request:**
   - Method: POST
   - URL: `http://localhost:5000/api/auth/login`
   - Body (JSON):
   ```json
   {
     "email": "postman@example.com",
     "password": "postman123"
   }
   ```
   - Click Send

---

## Database Schema Reference

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Querying Users:**
```sql
-- Find user by email
SELECT * FROM users WHERE email = 'john@example.com';

-- Find user by username
SELECT * FROM users WHERE username = 'john_doe';

-- View all users (without passwords)
SELECT id, username, email, created_at FROM users;
```

---

## Development vs Production

### Development
- Error messages include full error traces
- CORS allows `http://localhost:5173`
- Can use weaker JWT_SECRET
- Database connection errors shown

### Production
- Error messages are generic for security
- CORS restricted to specific domain
- Strong, random JWT_SECRET required
- Sensitive errors logged but not returned

Toggle with `NODE_ENV` environment variable:
```bash
NODE_ENV=production npm start
```

---

## Rate Limiting (Future Enhancement)

For production, consider adding rate limiting on auth endpoints:

```javascript
import rateLimit from 'express-rate-limit';

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: 'Too many auth attempts, please try again later',
});

app.use('/api/auth', authLimiter);
```

---

## Troubleshooting

### Frontend shows "Invalid token"
- Token may have expired (7 days)
- Token was tampered with
- JWT_SECRET changed
- Solution: User must login again

### CORS errors
- Frontend URL doesn't match FRONTEND_URL in .env
- Check browser console for exact error
- Update .env and restart server

### Database connection fails
- PostgreSQL not running
- Credentials in .env are incorrect
- Database auth_app doesn't exist (run setup-db.js)

### 500 errors on register
- Check database is running
- Check username/email uniqueness constraints
- Review server logs

---

## Next Steps

To extend this API:

1. **Add user profile endpoint**: `GET /api/user/me` (requires auth middleware)
2. **Add user update endpoint**: `PUT /api/user/profile` (requires auth)
3. **Add password change**: `POST /api/user/change-password` (requires auth)
4. **Add QR code endpoints**: `POST /api/qr/generate`, etc.
5. **Add refresh token mechanism** for better security
6. **Add OAuth2** for social login
