# ⚡ QUICK REFERENCE CARD

## 🚀 Quick Start

```bash
npm install
cp .env.example .env
# Edit .env with your keys
npm run dev
```

Server: `http://localhost:5000`

---

## 🔐 Authentication Flow

```
1. POST /api/auth/send-otp { email, type: "signup" }
   → Check Brevo for OTP

2. POST /api/auth/verify-otp { email, otp, name }
   → Get: accessToken (15m), refreshToken (10d)

3. Use accessToken for all authenticated requests
   Header: Authorization: Bearer {accessToken}

4. When token expires → POST /api/auth/refresh-token
   → Get new accessToken
```

---

## 📱 Push Notification Setup

```bash
# 1. Get Expo token in React Native
import * as Notifications from 'expo-notifications';
const token = await Notifications.getExpoPushTokenAsync();

# 2. Register token after login
POST /api/users/register-push-token
Authorization: Bearer {accessToken}
{ "token": "ExponentPushToken[...]" }

# 3. Automatic notifications at 10 PM & 11 PM
```

---

## 🔑 Environment Variables (MUST HAVE)

```env
MONGODB_URI=mongodb+srv://...
JWT_SECRET=min_32_characters_long
JWT_REFRESH_SECRET=min_32_characters_long
BREVO_API_KEY=xkeysib-...
BREVO_SENDER_EMAIL=noreply@spendapp.com
CRON_TIMEZONE=Asia/Kolkata
```

---

## 📚 API Quick Reference

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/api/auth/send-otp` | POST | ❌ | Send OTP |
| `/api/auth/verify-otp` | POST | ❌ | Verify & login |
| `/api/auth/refresh-token` | POST | ❌ | Get new token |
| `/api/auth/logout` | POST | ✅ | Logout |
| `/api/users/register-push-token` | POST | ✅ | Register for notifications |
| `/api/users/me` | GET | ✅ | Get profile |
| `/api/users/me` | PUT | ✅ | Update profile |
| `/api/users/enable-notifications` | POST | ✅ | Enable notifications |
| `/api/users/disable-notifications` | POST | ✅ | Disable notifications |

---

## 🧪 Test Commands

```bash
# 1. Send OTP
curl -X POST http://localhost:5000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","type":"signup"}'

# 2. Verify OTP (check email)
curl -X POST http://localhost:5000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","otp":"123456","name":"Test"}'

# 3. Get tokens from response, then:
curl -X GET http://localhost:5000/api/users/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## 📂 Project Structure

```
backend/
├── server.js              ← Start here
├── src/
│   ├── app.js            ← Express config
│   ├── config/           ← Database, env
│   ├── models/           ← Schemas
│   ├── controllers/      ← Handlers
│   ├── routes/           ← Endpoints
│   ├── services/         ← Business logic
│   ├── scheduler/        ← Cron jobs
│   ├── middlewares/      ← Auth, errors
│   └── utils/            ← Helpers
├── logs/                 ← Auto-created
└── .env                  ← Your secrets
```

---

## 🔔 Notification System

**Automatic at 10 PM (configurable timezone):**
- Check all users with push tokens
- If day NOT complete OR balance = 0 → send notification
- Log to notificationLogs collection

**At 11 PM (if ignored):**
- Check same conditions
- If not already notified → send again
- Max 2 per day per user

**Stored in User model:**
- `expoPushToken` - Expo token
- `notificationEnabled` - true/false
- `lastNotificationDate` - Last sent time
- `lastNotificationType` - "10PM" or "11PM"

---

## 🎯 Token Duration

```
Access Token:  15 minutes  (for API requests)
Refresh Token: 10 DAYS     (persistent login)
OTP:           10 minutes  (email verification)
```

---

## 📊 Database Collections

```javascript
users           // User accounts + push tokens
expenses        // Expense records
friends         // Friend profiles
daycompletions  // Day tracking
otptokens       // OTP storage (auto-deleted)
notificationlogs // Notification history
```

---

## 🚨 Common Errors

| Error | Fix |
|-------|-----|
| MongoDB connection error | Check MONGODB_URI in .env |
| OTP not sending | Verify BREVO_API_KEY |
| 401 Unauthorized | Include Authorization header with token |
| Token expired | Use refreshToken to get new one |
| CORS error | Update FRONTEND_URL in .env |

---

## 🌍 Timezones (CRON_TIMEZONE)

```
Asia/Kolkata        (India)
America/New_York    (USA)
Europe/London       (UK)
Europe/Paris        (France)
UTC                 (UTC/GMT)
```

Full list: https://en.wikipedia.org/wiki/List_of_tz_database_time_zones

---

## 🔐 Security Checklist

- [ ] JWT secrets are 32+ characters
- [ ] MONGODB_URI is secure
- [ ] .env file not committed to git
- [ ] FRONTEND_URL includes https://
- [ ] BREVO_API_KEY protected
- [ ] Use HTTPS in production
- [ ] MongoDB whitelist enabled

---

## 📈 Scaling Tips

1. **Add indexes** for frequently queried fields
2. **Use caching** for expensive queries
3. **Implement rate limiting** on auth endpoints
4. **Monitor cron jobs** - add alerting
5. **Use CDN** for static files
6. **Set up backups** for MongoDB

---

## 🔗 Useful Commands

```bash
npm run dev          # Start development
npm start            # Production start
npm run lint         # Code quality
npm test             # Run tests
npm run seed         # Seed database
```

---

## 🎓 File Purposes

| File | Purpose |
|------|---------|
| `server.js` | App entry point |
| `app.js` | Express setup |
| `authService.js` | Auth logic |
| `brevoService.js` | Email sending |
| `notificationService.js` | Push notifications |
| `notificationJobs.js` | Cron scheduler |
| `authMiddleware.js` | JWT verification |
| `User.js` | User schema |
| `NotificationLog.js` | Track notifications |

---

## 💾 Storing Tokens (React Native)

```javascript
import * as SecureStore from 'expo-secure-store';

// Save after login
await SecureStore.setItemAsync('accessToken', token);
await SecureStore.setItemAsync('refreshToken', token);

// Use in requests
const token = await SecureStore.getItemAsync('accessToken');
headers: { 'Authorization': `Bearer ${token}` }

// Delete on logout
await SecureStore.deleteItemAsync('accessToken');
```

---

## 🧪 Testing Checklist

- [ ] Send OTP works
- [ ] Verify OTP creates user
- [ ] Tokens received
- [ ] Access token validates requests
- [ ] Refresh token gets new token
- [ ] Push token registers
- [ ] Profile fetches
- [ ] Logout works

---

## 📞 Support

**Logs**: Check `logs/app.log` and `logs/error.log`  
**Docs**: See README.md, SETUP_GUIDE.md, API_EXAMPLES.md  
**Debug**: Enable `LOG_LEVEL=debug` in .env

---

## 🎯 Next Steps

1. ✅ Install dependencies
2. ✅ Setup .env file
3. ✅ Start server: `npm run dev`
4. ✅ Test authentication
5. ✅ Integrate with frontend
6. ✅ Test push notifications
7. ✅ Deploy to Render

---

**Version**: 1.0.0 | **Status**: Production Ready | **Last Updated**: May 18, 2026
