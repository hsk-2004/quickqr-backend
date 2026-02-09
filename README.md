# QuickQR Backend - Authentication Server

A production-ready Node.js + Express backend for user authentication with PostgreSQL and JWT tokens.

## Features

✨ **Authentication**
- User registration with validation
- Secure login with password hashing (bcrypt)
- JWT token generation and validation
- 7-day token expiration

🔒 **Security**
- Passwords hashed with bcrypt (10 salt rounds)
- SQL injection prevention (parameterized queries)
- Input validation and sanitization
- CORS protection
- Environment variable configuration

🗄️ **Database**
- PostgreSQL with UUID primary keys
- Automatic timestamps (created_at, updated_at)
- Email and username indexes for fast lookups
- Trigger-based timestamp updates

📝 **Error Handling**
- Comprehensive input validation
- Descriptive error messages
- Proper HTTP status codes
- Development-friendly error logging

## Project Structure

```
backend/
├── src/
│   ├── db.js                    # PostgreSQL connection pool
│   ├── server.js                # Express app and server setup
│   ├── controllers/
│   │   └── auth.controller.js   # Registration and login logic
│   ├── routes/
│   │   └── auth.routes.js       # Auth endpoints
│   └── utils/
│       ├── hash.js              # bcrypt password hashing
│       └── jwt.js               # JWT token generation/verification
├── scripts/
│   └── setup-db.js              # Database initialization
├── .env                         # Environment variables (not in git)
├── .env.example                 # Environment template
├── package.json                 # Dependencies
└── README.md                    # This file
```

## Prerequisites

- **Node.js** 16+ (uses ES modules)
- **PostgreSQL** 12+ running on localhost:5432
- **npm** or **yarn**

## Installation & Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and update with your PostgreSQL credentials:

```bash
cp .env.example .env
```

Edit `.env`:
```env
JWT_SECRET=your_super_secret_key_change_this_in_production
DB_USER=postgres
DB_PASSWORD=your_postgres_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=auth_app
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### 3. Create Database and Tables

**Make sure PostgreSQL is running**, then:

```bash
npm run setup-db
```

This will:
- Create the `auth_app` database
- Create the `users` table with proper schema
- Create indexes on email and username
- Set up automatic timestamp triggers

### 4. Start Development Server

```bash
npm run dev
```

Server will run on `http://localhost:5000`

You should see:
```
✅ Database connected successfully
✅ Database connection test passed
⚡ Server running on http://localhost:5000
✅ API ready at http://localhost:5000/api
🔓 CORS enabled for http://localhost:5173
```

## API Endpoints

### Health Check

```http
GET /api/health
```

**Response:**
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-02-05T10:30:00.000Z"
}
```

### Register User

```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "secure123"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
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
```json
// 400 - Validation error
{
  "success": false,
  "message": "Username must be 3-50 chars and contain only letters, numbers, and underscores"
}

// 409 - User already exists
{
  "success": false,
  "message": "User with this email or username already exists"
}
```

### Login User

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "secure123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "username": "john_doe",
      "email": "john@example.com"
    }
  }
}
```

**Error Responses:**
```json
// 400 - Missing fields
{
  "success": false,
  "message": "Email and password are required"
}

// 401 - Invalid credentials
{
  "success": false,
  "message": "Invalid email or password"
}
```

## Database Schema

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

**Columns:**
- `id` - UUID primary key, auto-generated
- `username` - 3-50 alphanumeric characters + underscore, unique
- `email` - Valid email format, unique
- `password` - Bcrypt-hashed password
- `created_at` - Account creation timestamp
- `updated_at` - Last update timestamp

**Indexes:**
- `idx_users_email` - Fast email lookups
- `idx_users_username` - Fast username lookups

## Authentication Flow

```
1. Client sends username, email, password
   ↓
2. Backend validates input format
   ↓
3. Backend checks if user exists
   ↓
4. Backend hashes password with bcrypt
   ↓
5. Backend stores in PostgreSQL
   ↓
6. Backend generates JWT token
   ↓
7. Backend returns token + user data (no password)
```

## JWT Token

**Payload:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "john@example.com",
  "iat": 1707120600,
  "exp": 1707725400
}
```

**Properties:**
- Signed with `JWT_SECRET` from environment
- Expires in 7 days
- Used in Authorization header: `Bearer <token>`

## Input Validation

### Username
- Length: 3-50 characters
- Characters: Letters, numbers, underscores only
- Case-insensitive storage (converted to lowercase)

### Email
- Valid email format (basic regex: `user@domain.com`)
- Case-insensitive storage (converted to lowercase)
- Must be unique in database

### Password
- Minimum 6 characters
- No character restrictions (allows special characters)
- Hashed before storage with bcrypt (10 salt rounds)

## Error Handling

All errors are returned as JSON with consistent format:

```json
{
  "success": false,
  "message": "User-friendly error message",
  "error": "Detailed error (only in development)"
}
```

**Status Codes:**
- `200` - Success
- `201` - Created (registration successful)
- `400` - Bad request (validation error)
- `401` - Unauthorized (invalid credentials)
- `409` - Conflict (user already exists)
- `500` - Server error

## Development Tips

### Testing with cURL

Register a user:
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

### Testing with Postman

1. Create POST request to `http://localhost:5000/api/auth/register`
2. Go to Body → Raw → JSON
3. Paste:
```json
{
  "username": "postman_user",
  "email": "postman@example.com",
  "password": "postman123"
}
```
4. Send and save the `token` for later

### Database Inspection

Connect to database:
```bash
psql -U postgres -d auth_app
```

View users:
```sql
SELECT id, username, email, created_at FROM users;
```

## Security Considerations

⚠️ **Production Checklist:**
- [ ] Change `JWT_SECRET` to a strong, random value
- [ ] Set `NODE_ENV=production`
- [ ] Use HTTPS (not HTTP)
- [ ] Update `FRONTEND_URL` to production domain
- [ ] Use environment-specific DB credentials
- [ ] Enable PostgreSQL password authentication
- [ ] Set up database backups
- [ ] Monitor error logs for attacks
- [ ] Implement rate limiting for auth endpoints
- [ ] Use environment secrets manager (not .env file)

## Troubleshooting

### "connect ECONNREFUSED 127.0.0.1:5432"
- PostgreSQL is not running
- Check connection: `psql -U postgres`
- Start PostgreSQL service

### "password authentication failed"
- Check `DB_USER` and `DB_PASSWORD` in .env
- Verify PostgreSQL user exists

### "database auth_app does not exist"
- Run setup script: `npm run setup-db`
- Check DB_NAME in .env

### "CORS error from frontend"
- Verify `FRONTEND_URL` in .env matches frontend URL
- Check CORS is enabled in server.js

### "Invalid token" from frontend
- Token expired (7 days)
- User needs to login again
- Check `JWT_SECRET` matches frontend expectations

## Performance Notes

**Database Indexes:**
- Email and username indexed for O(1) user lookups
- PostgreSQL uses B-tree indexes by default

**Connection Pooling:**
- pg Pool handles connection reuse
- Default max 20 connections
- Connections idle after 30s

**Password Hashing:**
- Bcrypt is intentionally slow (10 salt rounds = ~100ms per hash)
- Protects against brute force attacks

## Production Deployment

### Using Environment Variables
```bash
export JWT_SECRET=production_secret_key
export DB_PASSWORD=secure_db_password
export NODE_ENV=production

npm run start
```

### Using Docker (Optional)
Create `Dockerfile`:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

Build and run:
```bash
docker build -t quickqr-backend .
docker run -p 5000:5000 --env-file .env quickqr-backend
```

## Scripts

```bash
# Development with auto-reload
npm run dev

# Production start
npm start

# Setup database
npm run setup-db
```

## Dependencies

- **express** - Web framework
- **pg** - PostgreSQL client
- **bcrypt** - Password hashing
- **jsonwebtoken** - JWT token generation
- **cors** - Cross-origin requests
- **dotenv** - Environment variables
- **nodemon** (dev) - Auto-reload on file changes

## License

ISC

## Support

For issues or questions:
1. Check troubleshooting section
2. Verify .env configuration
3. Check PostgreSQL is running
4. Review server logs for errors
