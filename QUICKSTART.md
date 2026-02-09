# QuickQR Backend - Quick Start Guide

Get the authentication server running in 5 minutes.

## ⚡ Super Quick Start (5 minutes)

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Setup Database
Make sure PostgreSQL is running, then:
```bash
npm run setup-db
```

### 3. Start Server
```bash
npm run dev
```

You should see:
```
✅ Database connected successfully
⚡ Server running on http://localhost:5000
```

### ✅ Done!

Test with curl:
```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{"success":true,"message":"Server is running"}
```

---

## 🚀 Next: Connect Frontend

Your frontend at `http://localhost:5173` will now be able to:

1. **Register new users:**
   ```javascript
   POST http://localhost:5000/api/auth/register
   { "username": "john_doe", "email": "john@example.com", "password": "pass123" }
   ```

2. **Login existing users:**
   ```javascript
   POST http://localhost:5000/api/auth/login
   { "email": "john@example.com", "password": "pass123" }
   ```

3. **Use JWT tokens** for authenticated requests

---

## ⚙️ Configuration

Edit `.env` if needed:

```env
# Database
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=localhost

# JWT (keep SECRET safe in production!)
JWT_SECRET=your_secret_key

# Server
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

---

## 📚 Full Documentation

- **Setup & Installation:** See [README.md](./README.md)
- **API Reference:** See [API-DOCUMENTATION.md](./API-DOCUMENTATION.md)
- **Database Schema:** See README.md → Database Schema section

---

## 🔧 Common Commands

```bash
# Start development server (with auto-reload)
npm run dev

# Start production server
npm start

# Setup database (run once)
npm run setup-db
```

---

## ✨ Project Features

✅ User registration with validation  
✅ Secure login with bcrypt hashing  
✅ JWT token generation (7-day expiry)  
✅ PostgreSQL database with proper schema  
✅ CORS enabled for frontend  
✅ Input validation and error handling  
✅ Environment variable configuration  
✅ Database connection pooling  
✅ Comprehensive logging  

---

## 📝 File Structure

```
backend/
├── src/
│   ├── db.js                    ← PostgreSQL connection
│   ├── server.js                ← Express app setup
│   ├── controllers/
│   │   └── auth.controller.js   ← Register & login logic
│   ├── routes/
│   │   └── auth.routes.js       ← API endpoints
│   ├── middleware/
│   │   └── auth.middleware.js   ← JWT verification (optional)
│   └── utils/
│       ├── hash.js              ← Password hashing
│       └── jwt.js               ← Token generation
├── scripts/
│   └── setup-db.js              ← Database initialization
├── .env                         ← Configuration
├── package.json
└── README.md
```

---

## 🆘 Troubleshooting

**Error: "connect ECONNREFUSED 127.0.0.1:5432"**  
→ PostgreSQL not running. Start it first.

**Error: "password authentication failed"**  
→ Check DB_USER and DB_PASSWORD in .env

**Error: "database auth_app does not exist"**  
→ Run `npm run setup-db`

**Frontend shows CORS error**  
→ Verify FRONTEND_URL in .env matches frontend URL

---

## 🎯 Next Steps

1. ✅ Backend running on port 5000
2. ✅ PostgreSQL database ready
3. ⏭️ Frontend should now work on port 5173
4. ⏭️ Test registration and login flows
5. ⏭️ Extend with more endpoints (if needed)

---

## 📞 Support Resources

- **API Docs:** [API-DOCUMENTATION.md](./API-DOCUMENTATION.md)
- **Setup Help:** [README.md](./README.md)
- **Testing:** Use Postman or cURL
- **Database:** Connect with `psql -U postgres -d auth_app`

---

**That's it! Happy coding! 🎉**
