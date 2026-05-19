# 🏦 Spend App Backend

**Production-Ready Node.js + Express Backend**

A complete backend for an expense tracking application with:
- 🔐 OTP-based Authentication (Brevo Email)
- 🔑 JWT Tokens (15 min access, 10 days refresh)
- 📊 MongoDB Atlas Integration
- 🔔 Expo Push Notifications (Daily Reminders)
- ⏰ Cron Scheduler for Automated Notifications
- 🚀 Render Deployment Ready

---

## 🎯 Features

### Authentication
- ✅ OTP-based signup/login (no passwords)
- ✅ 10-minute OTP validity
- ✅ Max 5 OTP attempts
- ✅ JWT with 15-minute access tokens
- ✅ 10-day refresh tokens for persistent login
- ✅ Email verification via Brevo

### Notifications
- ✅ Expo push notifications
- ✅ Daily 10 PM reminder
- ✅ 11 PM follow-up reminder
- ✅ Duplicate prevention
- ✅ Customizable timezone
- ✅ Enable/disable per user

### Database
- ✅ MongoDB Atlas cloud database
- ✅ Mongoose ODM
- ✅ Automatic indexes
- ✅ TTL for OTP cleanup

### Architecture
- ✅ Clean folder structure
- ✅ Middleware-based request pipeline
- ✅ Error handling and logging
- ✅ Service layer for business logic
- ✅ Utility functions for common tasks

---

## 📦 Installation

### 1. Prerequisites

```bash
# Check versions
node --version  # Should be 18+
npm --version   # Should be 9+
```

### 2. Clone & Install Dependencies

```bash
cd backend
npm install
```

### 3. Setup Environment

```bash
cp .env.example .env
# Edit .env with your credentials
```

**Required Environment Variables:**

```env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/spend-db
JWT_SECRET=your_secret_key_min_32_chars
JWT_REFRESH_SECRET=your_refresh_secret_min_32_chars
BREVO_API_KEY=your_api_key
BREVO_SENDER_EMAIL=noreply@spendapp.com
CRON_TIMEZONE=Asia/Kolkata
```

---

## 🚀 Running the Backend

### Development
```bash
npm run dev
```
Runs on `http://localhost:5000`

### Production
```bash
npm start
```

---

## 📚 Project Structure

```
backend/
├── server.js                      # Entry point
├── src/
│   ├── app.js                    # Express app
│   ├── config/                   # Configuration
│   │   ├── database.js
│   │   └── env.js
│   ├── models/                   # Database schemas
│   │   ├── User.js
│   │   ├── Expense.js
│   │   ├── Friend.js
│   │   ├── DayCompletion.js
│   │   ├── OtpToken.js
│   │   └── NotificationLog.js
│   ├── controllers/              # Request handlers
│   │   ├── authController.js
│   │   └── userController.js
│   ├── routes/                   # API endpoints
│   ├── services/                 # Business logic
│   │   ├── authService.js
│   │   ├── brevoService.js
│   │   └── notificationService.js
│   ├── scheduler/
│   │   └── notificationJobs.js
│   ├── middlewares/
│   │   ├── authMiddleware.js
│   │   └── errorHandler.js
│   └── utils/                    # Helper functions
├── logs/                         # Application logs
├── package.json
├── .env.example
└── README.md
```

---

## 🔌 API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/send-otp` | Send OTP to email |
| POST | `/api/auth/verify-otp` | Verify OTP and get tokens |
| POST | `/api/auth/refresh-token` | Refresh access token |
| POST | `/api/auth/resend-otp` | Resend OTP |
| POST | `/api/auth/logout` | Logout user |

### User & Notifications

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/users/register-push-token` | Register Expo push token |
| POST | `/api/users/enable-notifications` | Enable notifications |
| POST | `/api/users/disable-notifications` | Disable notifications |
| GET | `/api/users/me` | Get user profile |
| PUT | `/api/users/me` | Update user profile |

---

## 📱 Authentication Flow

### Signup

```
1. Frontend: POST /api/auth/send-otp
   { email: "user@example.com", type: "signup" }

2. Backend: Generate OTP → Send via Brevo email

3. Frontend: User enters OTP

4. Frontend: POST /api/auth/verify-otp
   { email: "user@example.com", otp: "123456", name: "John" }

5. Backend: Verify OTP → Create user → Issue tokens

6. Response:
   {
     user: { _id, email, name },
     accessToken: "jwt...",
     refreshToken: "jwt...",
     expiresIn: 900
   }
```

### Login

Same flow, but without `name` and uses existing user

### Token Refresh

```
POST /api/auth/refresh-token
{ refreshToken: "jwt..." }

Response:
{
  accessToken: "new_jwt...",
  expiresIn: 900
}
```

---

## 🔔 Push Notification System

### How It Works

**10 PM Job (UTC+IST):**
- Get all users with push tokens
- Check if today is NOT marked complete
- OR if today's expense total = 0
- Send push notification
- Log to notificationLogs

**11 PM Job:**
- Only send if user ignored 10 PM reminder
- Check same conditions
- Max 2 notifications per day

### Example Notification

```json
{
  "title": "📝 Daily Expense Reminder",
  "body": "Don't forget to log your expenses for today!",
  "data": {
    "type": "expense_reminder",
    "notificationType": "10PM"
  }
}
```

---

## 🧪 Testing Endpoints

### 1. Send OTP
```bash
curl -X POST http://localhost:5000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","type":"signup"}'
```

### 2. Verify OTP
```bash
curl -X POST http://localhost:5000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","otp":"123456","name":"Test User"}'
```

### 3. Register Push Token
```bash
curl -X POST http://localhost:5000/api/users/register-push-token \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ACCESS_TOKEN" \
  -d '{"token":"ExponentPushToken[xxx]"}'
```

### 4. Get Profile
```bash
curl -X GET http://localhost:5000/api/users/me \
  -H "Authorization: Bearer ACCESS_TOKEN"
```

---

## 🗄️ Database Setup

### MongoDB Atlas

1. Go to [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas)
2. Create account
3. Create free cluster
4. Get connection string
5. Add to `.env` as `MONGODB_URI`

**Collections:**
- `users` - User accounts
- `expenses` - Expense records
- `friends` - Friend profiles
- `daycompletions` - Day tracking
- `otptokens` - OTP storage
- `notificationlogs` - Notification history

---

## 📧 Brevo Setup

1. Go to [brevo.com](https://brevo.com)
2. Create free account
3. Go to Settings → API Keys
4. Copy API key
5. Add to `.env` as `BREVO_API_KEY`

**Email Format:**
- Sender: `noreply@spendapp.com` (update in `.env`)
- OTP template: HTML formatted
- Auto-cleanup: Yes

---

## ⏰ Cron Scheduler

### Current Times

- **10 PM**: `0 22 * * *` (22:00 UTC)
- **11 PM**: `0 23 * * *` (23:00 UTC)

### Customizing

Edit `src/scheduler/notificationJobs.js`:

```javascript
// Change to 8 AM and 9 AM
job1 = cron.schedule('0 8 * * *', ...);  // 8 AM
job2 = cron.schedule('0 9 * * *', ...);  // 9 AM
```

### Timezone

Update `.env`:
```env
CRON_TIMEZONE=Asia/Kolkata
```

List: https://en.wikipedia.org/wiki/List_of_tz_database_time_zones

---

## 🚀 Deployment (Render)

### 1. Push to GitHub

```bash
git add .
git commit -m "Initial backend"
git push origin main
```

### 2. Create Render Service

- Go to [render.com](https://render.com)
- New → Web Service
- Connect GitHub repo
- Build: `npm install`
- Start: `npm start`

### 3. Add Environment Variables

Settings → Environment → Add all from `.env`

### 4. Deploy

Click "Deploy" → Wait for build

**Your API URL**: `https://spend-app-backend.onrender.com`

---

## 🔒 Security Features

- ✅ JWT authentication
- ✅ OTP verification
- ✅ Password hashing (bcryptjs)
- ✅ CORS protection
- ✅ Helmet security headers
- ✅ Rate limiting ready
- ✅ Input validation (Joi)
- ✅ Environment variables
- ✅ MongoDB authentication

---

## 📊 Monitoring

### Logs

```bash
tail -f logs/app.log      # All logs
tail -f logs/error.log    # Errors only
```

### Health Check

```bash
curl http://localhost:5000/health
```

### Database Stats

```bash
# Check in MongoDB Atlas Dashboard
# Collections → Users → Stats
```

---

## 🐛 Troubleshooting

### MongoDB Connection Failed
- [ ] Check MONGODB_URI format
- [ ] Verify credentials
- [ ] Add IP to MongoDB whitelist
- [ ] Test connection string

### OTP Not Sending
- [ ] Verify BREVO_API_KEY
- [ ] Check BREVO_SENDER_EMAIL
- [ ] Confirm Brevo account active
- [ ] Check logs/error.log

### Notifications Not Received
- [ ] Verify Expo token registered
- [ ] Check notificationEnabled = true
- [ ] Verify timezone in .env
- [ ] Check cron job logs

---

## 📞 Support & Documentation

- Full API docs: See `SETUP_GUIDE.md`
- Database schema: See models in `src/models/`
- Brevo docs: https://developers.brevo.com
- Expo docs: https://docs.expo.dev
- MongoDB docs: https://docs.mongodb.com

---

## 📝 Notes

- Login tokens valid for **10 days** (refresh token)
- Access tokens valid for **15 minutes**
- OTP valid for **10 minutes**
- Max **5 OTP attempts**
- Notifications sent at **10 PM and 11 PM** (configurable)
- Timezone: **Asia/Kolkata** (change in .env)

---

## ✅ Production Checklist

- [ ] All environment variables set
- [ ] MongoDB Atlas cluster created
- [ ] Brevo account created and API key added
- [ ] JWT secrets are long and random
- [ ] CORS whitelist updated
- [ ] HTTPS enabled (auto on Render)
- [ ] Logs configured
- [ ] Email templates tested
- [ ] Push notifications tested
- [ ] Database backups enabled

---

## 📄 License

MIT License - Open source and free to use

---

**Status**: ✅ Production Ready  
**Version**: 1.0.0  
**Last Updated**: May 18, 2026

---

**Ready to go live!** 🚀
