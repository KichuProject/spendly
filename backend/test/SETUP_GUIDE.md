# Spend App Backend - Setup & Deployment Guide

**Production-Ready Backend with:**
- ✅ Node.js + Express
- ✅ MongoDB Atlas (Mongoose)
- ✅ OTP Authentication (Brevo Email)
- ✅ JWT Tokens (15 min access, 10 days refresh)
- ✅ Expo Push Notifications (Daily 10 PM & 11 PM)
- ✅ Cron Scheduler for Notifications
- ✅ Render.com Deployment Ready

---

## 📋 Prerequisites

- Node.js 18+ and npm 9+
- MongoDB Atlas Account (free tier available)
- Brevo Account (free tier available, formerly Sendinblue)
- Render Account (for deployment)
- Expo Account (for push notifications)

---

## 🚀 Quick Start (Development)

### 1. Clone & Install

```bash
cd backend
npm install
```

### 2. Setup Environment Variables

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/spend-db
JWT_SECRET=your_secret_key
JWT_REFRESH_SECRET=your_refresh_secret
BREVO_API_KEY=your_brevo_api_key
BREVO_SENDER_EMAIL=noreply@spendapp.com
CRON_TIMEZONE=Asia/Kolkata
```

### 3. Start Development Server

```bash
npm run dev
```

Server runs on `http://localhost:5000`

---

## 🔐 Environment Variables Explained

### Database
- **MONGODB_URI**: MongoDB Atlas connection string
  - Format: `mongodb+srv://user:pass@cluster.mongodb.net/db-name`
  - Get from MongoDB Atlas → Connect → Connection String

### Authentication
- **JWT_SECRET**: Sign access tokens (minimum 32 characters)
- **JWT_REFRESH_SECRET**: Sign refresh tokens (minimum 32 characters)
- **JWT_EXPIRY**: Access token duration (default: 15m)
- **JWT_REFRESH_EXPIRY**: Refresh token duration (default: 10d - 10 days)

### Email (OTP)
- **BREVO_API_KEY**: API key from Brevo account
  - Get from: https://app.brevo.com/settings/keys/api
- **BREVO_SENDER_EMAIL**: Email address for sending OTPs

### Notifications
- **CRON_TIMEZONE**: Timezone for cron jobs
  - Common: `Asia/Kolkata`, `America/New_York`, `Europe/London`
  - Full list: https://en.wikipedia.org/wiki/List_of_tz_database_time_zones

### Frontend
- **FRONTEND_URL**: Allowed CORS origins (comma-separated)

---

## 📚 API Endpoints

### Authentication

#### Send OTP
```bash
POST /api/auth/send-otp
Content-Type: application/json

{
  "email": "user@example.com",
  "type": "signup"  // or "login"
}
```

#### Verify OTP
```bash
POST /api/auth/verify-otp
Content-Type: application/json

{
  "email": "user@example.com",
  "otp": "123456",
  "name": "John Doe"  // required for signup
}
```

#### Refresh Token
```bash
POST /api/auth/refresh-token
Content-Type: application/json

{
  "refreshToken": "jwt_refresh_token"
}
```

#### Logout
```bash
POST /api/auth/logout
Authorization: Bearer {accessToken}
```

### User & Notifications

#### Register Push Token
```bash
POST /api/users/register-push-token
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "token": "ExponentPushToken[xxxxxx]"
}
```

#### Get Profile
```bash
GET /api/users/me
Authorization: Bearer {accessToken}
```

#### Update Profile
```bash
PUT /api/users/me
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "name": "John Updated",
  "currency": "USD",
  "phone": "+1-234-567-8900"
}
```

#### Enable/Disable Notifications
```bash
POST /api/users/enable-notifications
POST /api/users/disable-notifications
Authorization: Bearer {accessToken}
```

---

## 🔔 Push Notification System

### How It Works

1. **10 PM Job**: Check all users
   - If day NOT marked complete → send notification
   - If today's balance = 0 → send notification
   - Max 2 notifications per day

2. **11 PM Job**: If user ignored first notification
   - Send second reminder
   - Only if condition still true

3. **Duplicate Prevention**: 
   - Checks `notificationLogs` collection
   - Never sends same type twice in same day

### Notification Flow

```
User App
  ↓
[Register Push Token] → POST /api/users/register-push-token
  ↓
Backend stores: expoPushToken in User model
  ↓
Cron Job (10 PM)
  ├─ Get all users with tokens
  ├─ Check day completion status
  ├─ Check today's expense balance
  ├─ Send push via Expo API
  └─ Log in notificationLogs collection
  ↓
User receives notification on phone
```

---

## 📦 Database Collections

### Users
```javascript
{
  _id: ObjectId,
  email: "user@example.com",
  name: "John Doe",
  isEmailVerified: true,
  expoPushToken: "ExponentPushToken[...]",
  lastNotificationDate: Date,
  lastNotificationType: "10PM" | "11PM",
  notificationEnabled: true,
  currency: "INR",
  phone: "+91-...",
  isActive: true,
  lastLogin: Date,
  loginStreak: 15,
  createdAt: Date,
  updatedAt: Date
}
```

### Expenses
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  amount: 1200,
  reason: "Team Lunch",
  category: "Food",
  emoji: "🍽️",
  date: Date,
  dateKey: "2026-05-18",
  type: "split",
  splits: [...],
  notes: "With team",
  tags: ["office"],
  createdAt: Date,
  updatedAt: Date
}
```

### DayCompletions
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  dateKey: "2026-05-18",
  date: Date,
  isComplete: true,
  completedAt: Date,
  notes: "All expenses logged",
  createdAt: Date,
  updatedAt: Date
}
```

### NotificationLogs
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  type: "10PM" | "11PM",
  reason: "day_incomplete" | "balance_zero" | "both",
  title: "Expense Reminder",
  body: "Log your expenses",
  status: "sent" | "failed" | "skipped",
  errorMessage: null,
  dateKey: "2026-05-18",
  sentAt: Date,
  createdAt: Date
}
```

---

## 🧪 Testing

### Test Send OTP
```bash
curl -X POST http://localhost:5000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","type":"signup"}'
```

### Test Verify OTP
```bash
curl -X POST http://localhost:5000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","otp":"123456","name":"Test User"}'
```

### Test Push Token Registration
```bash
curl -X POST http://localhost:5000/api/users/register-push-token \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{"token":"ExponentPushToken[xxxxxx]"}'
```

---

## 🚀 Deployment on Render

### 1. Push Code to GitHub

```bash
git init
git add .
git commit -m "Initial backend setup"
git push origin main
```

### 2. Create Render Service

1. Go to [render.com](https://render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repo
4. Configure:
   - **Name**: spend-app-backend
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

### 3. Add Environment Variables

In Render Dashboard:
- Settings → Environment
- Add all variables from `.env.example`

### 4. Deploy

Click "Deploy" - Render will build and start your server

Your backend URL: `https://spend-app-backend.onrender.com`

---

## 🔍 Monitoring & Logs

### View Logs
```bash
npm run dev  # Development logs in terminal
```

### Log Files
```
logs/
├── app.log        # All info/warn/debug
└── error.log      # Only errors
```

### Monitor Notifications
Check `notificationLogs` collection in MongoDB:
```bash
db.notificationlogs.find({ userId: ObjectId("...") }).sort({ sentAt: -1 })
```

---

## ⚙️ Configuration

### Change Notification Times

In `src/scheduler/notificationJobs.js`:

```javascript
// Current: 10 PM (22:00) and 11 PM (23:00)
// Change cron expressions:

job10PM = cron.schedule(
  '0 22 * * *',  // Change these numbers
  async () => { ... }
);
```

Cron Format: `MM HH * * *`
- MM: Minutes (0-59)
- HH: Hours (0-23, in 24-hour format)

Examples:
- 8:00 AM → `'0 8 * * *'`
- 6:30 PM → `'30 18 * * *'`
- 12:00 PM → `'0 12 * * *'`

### Change Timezone

Update `CRON_TIMEZONE` in `.env`:
```env
CRON_TIMEZONE=Europe/London
```

---

## 🐛 Troubleshooting

### MongoDB Connection Error
```
Solution:
1. Check MONGODB_URI format
2. Verify username/password special characters
3. Add IP to MongoDB Atlas IP Whitelist
4. Enable "Allow any connection" in development
```

### OTP Not Sending
```
Solution:
1. Verify BREVO_API_KEY is correct
2. Check BREVO_SENDER_EMAIL format
3. Check Brevo account is active
4. Check email address is correct
5. Look for errors in logs/error.log
```

### Push Notifications Not Received
```
Solution:
1. Verify Expo token format: ExponentPushToken[...]
2. Check token is stored in User.expoPushToken
3. Check notificationEnabled = true
4. Check logs for sending errors
5. Verify Expo credentials
```

### CORS Errors
```
Solution:
1. Update FRONTEND_URL in .env
2. Include http:// or https://
3. Separate multiple URLs with comma
4. Restart server after changes
```

---

## 📝 Project Structure

```
backend/
├── server.js                    # Entry point
├── src/
│   ├── app.js                  # Express setup
│   ├── config/
│   │   ├── database.js         # MongoDB connection
│   │   └── env.js              # Env validation
│   ├── models/                 # Database schemas
│   ├── controllers/            # Request handlers
│   ├── routes/                 # API routes
│   ├── services/               # Business logic
│   │   ├── authService.js
│   │   ├── brevoService.js     # Email OTP
│   │   └── notificationService.js  # Push notifications
│   ├── scheduler/
│   │   └── notificationJobs.js # Cron jobs
│   ├── middlewares/            # Middleware
│   └── utils/                  # Helper functions
├── logs/                       # Application logs
├── package.json
├── .env.example
└── .env                        # Local only (DO NOT COMMIT)
```

---

## 📱 Frontend Integration

### 1. Get Expo Push Token (React Native)

```javascript
import * as Notifications from 'expo-notifications';

const getPushToken = async () => {
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') {
    alert('Permission not granted');
    return;
  }

  const token = await Notifications.getExpoPushTokenAsync();
  return token.data;
};
```

### 2. Register Token on Login

```javascript
const token = await getPushToken();

const response = await fetch(
  'https://your-backend.com/api/users/register-push-token',
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ token }),
  }
);
```

### 3. Handle Push Notifications

```javascript
Notifications.setNotificationHandler({
  handleNotification: async (notification) => {
    console.log('Notification received:', notification);
    return {
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    };
  },
});
```

---

## 🔒 Security Best Practices

1. **JWT Secrets**: Use long, random strings (min 32 chars)
2. **Environment Variables**: Never commit `.env` file
3. **HTTPS**: Always use HTTPS in production
4. **CORS**: Whitelist only trusted frontend URLs
5. **Rate Limiting**: Implement rate limits on auth endpoints
6. **Input Validation**: Validate all user inputs with Joi
7. **MongoDB**: Enable authentication and IP whitelist
8. **Secrets**: Rotate secrets periodically

---

## 📞 Support

For issues or questions:
- Check logs in `logs/` directory
- Review error messages carefully
- Verify all environment variables
- Test endpoints with curl/Postman
- Check MongoDB connection

---

## 📄 License

MIT License - Feel free to use and modify

---

**Version**: 1.0.0  
**Last Updated**: May 18, 2026  
**Status**: Production Ready ✅
