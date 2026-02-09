# QuickQR Backend - Deployment Checklist

Complete checklist for deploying QuickQR to production.

## 🔒 Security Checklist

### Before Deployment
- [ ] **JWT_SECRET** - Change to strong, random value (32+ chars)
  ```env
  JWT_SECRET=your_super_secure_random_string_at_least_32_characters_long
  ```

- [ ] **NODE_ENV** - Set to production
  ```env
  NODE_ENV=production
  ```

- [ ] **Database Password** - Use strong, unique password
  ```env
  DB_PASSWORD=your_strong_secure_password
  ```

- [ ] **Database User** - Use dedicated, non-admin user
  ```env
  DB_USER=quickqr_app
  # Create with: CREATE USER quickqr_app WITH PASSWORD 'strong_password';
  ```

- [ ] **HTTPS** - Use HTTPS, not HTTP
  ```env
  FRONTEND_URL=https://yourdomain.com
  ```

- [ ] **.env file** - Never commit to git
  - [ ] Verify `.gitignore` includes `.env`
  - [ ] Remove `.env` from git history if accidentally committed

- [ ] **Error messages** - Don't expose sensitive info
  - [ ] Check error responses don't include stack traces
  - [ ] Log errors to file, not to client

### PostgreSQL Security
- [ ] **Password authentication** - Enable in `pg_hba.conf`
- [ ] **SSL connections** - Enable if connecting remotely
- [ ] **Firewall** - Restrict DB access to application server
- [ ] **Backups** - Set up automated daily backups
- [ ] **User permissions** - Limit DB user to required privileges

---

## 🏗️ Infrastructure Checklist

### Server Requirements
- [ ] Node.js 16+ installed
- [ ] PostgreSQL 12+ installed
- [ ] Sufficient disk space for database
- [ ] Memory: 512MB minimum (1GB recommended)
- [ ] CPU: 1 core minimum (2+ cores recommended)

### Process Management (Production)
- [ ] Use PM2 or systemd to manage Node process
  ```bash
  npm install -g pm2
  pm2 start src/server.js --name "quickqr-backend"
  pm2 startup
  pm2 save
  ```

- [ ] Or create systemd service file
  ```bash
  sudo nano /etc/systemd/system/quickqr-backend.service
  # Configure and enable service
  sudo systemctl enable quickqr-backend
  ```

### Monitoring
- [ ] Set up error logging (file or service)
- [ ] Set up performance monitoring
- [ ] Configure process restart on crash
- [ ] Monitor disk space for logs
- [ ] Monitor database size

---

## 🌐 Network Checklist

### CORS Configuration
- [ ] Update `FRONTEND_URL` to production domain
  ```env
  FRONTEND_URL=https://yourdomain.com
  ```

- [ ] Remove localhost from CORS origins
- [ ] Test CORS requests from frontend

### Firewall Rules
- [ ] Allow inbound on port 5000 from frontend servers
- [ ] Allow inbound on port 5432 from app servers (not public)
- [ ] Block direct database access from internet
- [ ] Allow outbound for any external APIs

### DNS & Reverse Proxy (Optional)
- [ ] Set up HTTPS with valid certificate
- [ ] Configure nginx/Apache reverse proxy
- [ ] Point domain to application server
- [ ] Test SSL certificate validity

---

## 📦 Deployment Steps

### 1. Clone Repository
```bash
git clone <your-repo-url>
cd QuickQR/backend
```

### 2. Install Dependencies
```bash
npm install --production
```

### 3. Configure Environment
```bash
# Copy and edit .env
cp .env.example .env
# Edit .env with production values:
# - JWT_SECRET
# - DB credentials
# - NODE_ENV=production
# - FRONTEND_URL
```

### 4. Setup Database
```bash
# On production server with PostgreSQL
npm run setup-db
```

### 5. Test Connection
```bash
npm run dev
# Verify:
# - ✅ Database connected
# - ✅ Server listening on port 5000
# - ✅ Health check responds
```

### 6. Start Server
```bash
# Option A: PM2
pm2 start src/server.js --name "quickqr-api"

# Option B: Direct
npm start

# Option C: Systemd
sudo systemctl start quickqr-backend
```

### 7. Verify Endpoints
```bash
# Health check
curl https://yourdomain.com/api/health

# Register endpoint
curl -X POST https://yourdomain.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@example.com","password":"test123"}'
```

---

## 📊 Performance Checklist

### Optimization
- [ ] Enable database connection pooling (default: 20)
- [ ] Add database indexes for frequently queried fields
- [ ] Use environment-specific optimizations
- [ ] Enable compression for responses (optional)

### Scaling (Future)
- [ ] Load balancing for multiple instances
- [ ] Redis cache for sessions (future)
- [ ] Database read replicas (future)
- [ ] CDN for static files (frontend)

---

## 📝 Monitoring & Logging

### Logging Setup
```javascript
// Add to server.js for production logging
const fs = require('fs');
const logStream = fs.createWriteStream('app.log', { flags: 'a' });

app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  logStream.write(`${timestamp} ${req.method} ${req.path}\n`);
  next();
});

// Log errors
process.on('uncaughtException', (err) => {
  logStream.write(`FATAL: ${err.message}\n${err.stack}\n`);
  process.exit(1);
});
```

### Metrics to Monitor
- [ ] Request count per minute
- [ ] Average response time
- [ ] Error rate
- [ ] Database connection count
- [ ] Server uptime
- [ ] CPU usage
- [ ] Memory usage
- [ ] Disk space

---

## 🔄 Backup & Recovery

### Database Backups
```bash
# Daily backup with cron
0 2 * * * pg_dump -U quickqr_app auth_app > /backups/auth_app_$(date +\%Y\%m\%d).sql

# Restore from backup
psql -U quickqr_app auth_app < /backups/auth_app_backup.sql
```

### Application Backups
- [ ] Back up `.env` securely (use secrets manager)
- [ ] Back up application code (git)
- [ ] Back up configuration files

### Disaster Recovery Plan
- [ ] Document recovery procedures
- [ ] Test recovery regularly
- [ ] Keep backups in geographically separate location

---

## 🧪 Pre-Launch Testing

### Functional Tests
- [ ] Health check endpoint responds
- [ ] User registration works
- [ ] User login works
- [ ] JWT tokens are generated
- [ ] Token validation works
- [ ] Invalid credentials rejected
- [ ] Duplicate users rejected
- [ ] Database persists data correctly

### Security Tests
- [ ] SQL injection protection works
- [ ] CORS restricts unauthorized origins
- [ ] Passwords are hashed (not plain text)
- [ ] Tokens expire after 7 days
- [ ] Invalid tokens rejected
- [ ] Error messages don't expose sensitive info
- [ ] Rate limiting working (if implemented)

### Performance Tests
- [ ] Server handles concurrent requests
- [ ] Database connection pooling works
- [ ] No memory leaks under load
- [ ] Response time acceptable (<200ms)
- [ ] Database queries optimized

### Compatibility Tests
- [ ] Works with frontend on production domain
- [ ] CORS headers correct
- [ ] Different browsers work (Chrome, Firefox, Safari, Edge)
- [ ] Mobile devices work

---

## 📋 Documentation Updates

- [ ] Update FRONTEND_URL in all configs
- [ ] Update API documentation with production URLs
- [ ] Document deployment process
- [ ] Document rollback procedure
- [ ] Document troubleshooting guide
- [ ] Update README.md with production info

---

## 👥 Team Handoff

### Provide to Operations Team
- [ ] .env template (with example values only)
- [ ] Database setup instructions
- [ ] Server startup procedures
- [ ] Monitoring and alerting setup
- [ ] Backup and recovery procedures
- [ ] Troubleshooting guide
- [ ] Emergency contacts

### Provide to Development Team
- [ ] API documentation (API-DOCUMENTATION.md)
- [ ] Feature request procedure
- [ ] Bug reporting procedure
- [ ] Code review guidelines
- [ ] Version control workflow

---

## ✅ Launch Checklist

Before going live:
- [ ] All security items completed
- [ ] All infrastructure ready
- [ ] Database backed up
- [ ] All tests passing
- [ ] Documentation complete
- [ ] Team trained and ready
- [ ] Monitoring active
- [ ] Rollback plan documented
- [ ] Status page configured

### Launch Day
- [ ] Deploy to production
- [ ] Verify all endpoints working
- [ ] Monitor error rates
- [ ] Check server metrics
- [ ] Test user registration flow
- [ ] Test user login flow
- [ ] Be ready to rollback if needed

### Post-Launch
- [ ] Monitor for 24 hours continuously
- [ ] Check user registrations/logins
- [ ] Verify no unusual errors
- [ ] Compare metrics with baseline
- [ ] Begin gradual traffic increase
- [ ] Monitor database growth

---

## 🚨 Rollback Procedure

If critical issues found:

1. **Stop traffic** to new version
2. **Switch reverse proxy** to previous version
3. **Restore database** from backup if needed
4. **Verify system** working
5. **Investigate** what went wrong
6. **Fix issues**
7. **Re-test** thoroughly
8. **Re-deploy** when ready

---

## 📞 Critical Resources

Keep these accessible during deployment:

- [ ] Database admin credentials (secure!)
- [ ] Server access credentials (secure!)
- [ ] Slack/alert channel for issues
- [ ] Escalation contacts
- [ ] Previous version deployment details
- [ ] Database backup location

---

## 🎯 Success Criteria

Deployment successful when:

✅ Zero downtime during deployment  
✅ All tests passing  
✅ User registration/login working  
✅ Database persisting data  
✅ Tokens being generated  
✅ CORS working with frontend  
✅ Error logging working  
✅ Monitoring active  
✅ Team confident in system  
✅ Users happy  

---

## 📊 Post-Launch Monitoring (First Week)

- [ ] Daily error rate checks
- [ ] Daily user registration count
- [ ] Daily login success rate
- [ ] Daily database size check
- [ ] Daily server performance metrics
- [ ] Weekly backup verification
- [ ] Weekly log analysis

---

## 🔐 Security Audit Checklist

After deployment:
- [ ] External security scan (vulnerability scanner)
- [ ] Penetration testing (if budget allows)
- [ ] Code review for security issues
- [ ] Dependency scan (npm audit)
- [ ] SSL certificate validation
- [ ] HTTPS redirect working
- [ ] HSTS headers set
- [ ] No hardcoded secrets in code

---

## ✨ Production Ready!

Your backend is production-ready when:

1. **Secure** - All security items checked
2. **Reliable** - All tests passing, monitoring active
3. **Scalable** - Can handle expected load
4. **Documented** - Operations team can manage it
5. **Tested** - Thoroughly tested in production-like environment
6. **Monitored** - Alerts configured for issues
7. **Recoverable** - Backups exist and tested
8. **Team Ready** - Everyone knows procedures

---

**Good luck with your deployment!** 🚀
