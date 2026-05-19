# Environment Variables Configuration

This document explains all required environment variables for the Spend App Backend in production.

## Database

### MONGODB_URI
**Type:** String (MongoDB Connection String)  
**Required:** ✅ Yes  
**Example:** `mongodb+srv://username:password@cluster.mongodb.net/spendapp?retryWrites=true&w=majority`

**Description:**  
MongoDB Atlas connection string. Get this from your MongoDB Atlas cluster dashboard.

**Setup Steps:**
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster (free tier: M0)
3. Click "Connect" → "Drivers" → Copy the connection string
4. Replace `<username>` and `<password>` with your database user credentials
5. Replace `myFirstDatabase` with `spendapp` (or your preferred name)

---

## Authentication

### JWT_SECRET
**Type:** String (Random cryptographic key)  
**Required:** ✅ Yes  
**Example:** `your-super-secret-jwt-key-min-32-characters-long!`

**Description:**  
Secret key for signing and verifying JWT tokens. Must be at least 32 characters for security.

**Generate a strong JWT_SECRET:**
```bash
# On macOS/Linux
openssl rand -base64 32

# On Windows PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))

# Online generator (not recommended for production)
# https://randomkeygen.com/
```

**Best Practices:**
- Use a cryptographically secure random string
- Minimum 32 characters
- Change this value in production
- Never commit this to version control

---

## Email Service (Brevo/Sendinblue)

### BREVO_API_KEY
**Type:** String (Brevo API Key)  
**Required:** ✅ Yes  
**Example:** `xkeysib-abcd1234efgh5678ijkl9012mnop3456`

**Description:**  
API key for Brevo (formerly Sendinblue) email service. Used for:
- Sending OTP emails
- Sending password reset emails
- Monthly keep-alive emails

**Setup Steps:**
1. Go to [Brevo Dashboard](https://app.brevo.com)
2. Create an account (free tier: 300 emails/day)
3. Go to Settings → SMTP & API
4. Copy your API Key (v3)
5. Store in `.env` file

**Verify API Key:**
```bash
curl -H "api-key: YOUR_API_KEY" https://api.brevo.com/v3/account
```

---

### BREVO_SENDER_EMAIL
**Type:** String (Email address)  
**Required:** ✅ Yes  
**Example:** `noreply@spendapp.com`

**Description:**  
The sender email address for all emails sent via Brevo. This should be a valid email domain configured in your Brevo account.

**Setup Steps:**
1. In Brevo Dashboard → Settings → Senders
2. Verify or add your sender email
3. Use that email in `BREVO_SENDER_EMAIL`

**Note:**
- Can be the same email used for API key account
- Or a custom domain email (if domain verified)

---

## Push Notifications (Expo)

### EXPO_PUSH_URL
**Type:** String (URL)  
**Required:** ✅ Yes  
**Default:** `https://exp.host/--/api/v2/push/send`  
**Example:** `https://exp.host/--/api/v2/push/send`

**Description:**  
Endpoint for Expo Push API. This is a fixed URL provided by Expo.

**Documentation:** [Expo Push Notifications API](https://docs.expo.dev/push-notifications/overview/)

---

## Scheduling

### CRON_TIMEZONE
**Type:** String (IANA Timezone)  
**Required:** ✅ Yes  
**Default:** `Asia/Kolkata`  
**Examples:**
- `Asia/Kolkata` (IST - India)
- `America/New_York` (EST/EDT)
- `Europe/London` (GMT/BST)
- `Asia/Tokyo` (JST)
- `Australia/Sydney` (AEDT/AEST)

**Description:**  
Timezone for cron job scheduling. All scheduled jobs will use this timezone.

**Available Timezones:**
```
America: New_York, Chicago, Denver, Los_Angeles
Europe: London, Paris, Berlin, Amsterdam
Asia: Tokyo, Shanghai, Hong_Kong, Singapore, Bangkok, Kolkata, Dubai
Australia: Sydney, Melbourne
```

**Complete timezone list:** [IANA Timezone Database](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones)

---

## Server

### PORT
**Type:** Integer  
**Required:** ❌ No (Default: 5000)  
**Example:** `5000`

**Description:**  
Port number for Express server. In production, use Render's PORT environment variable.

---

### NODE_ENV
**Type:** String  
**Required:** ❌ No (Default: 'development')  
**Options:** `development`, `production`  
**Example:** `production`

**Description:**  
Node environment. Use `production` on Render.

**Effect:**
- `development`: Verbose logging, hot reload
- `production`: Optimized, minimal logs

---

### FRONTEND_URL
**Type:** String (URL)  
**Required:** ❌ No  
**Example:** `https://spendly.com`

**Description:**  
Frontend URL for CORS configuration. Allows cross-origin requests from frontend.

---

## Complete Example .env File

```bash
# ==================== DATABASE ====================
MONGODB_URI=mongodb+srv://spend_user:password@cluster.mongodb.net/spendapp?retryWrites=true&w=majority

# ==================== AUTHENTICATION ====================
JWT_SECRET=your-super-secret-jwt-key-min-32-characters-long!

# ==================== EMAIL SERVICE ====================
BREVO_API_KEY=xkeysib-abcd1234efgh5678ijkl9012mnop3456
BREVO_SENDER_EMAIL=noreply@spendapp.com

# ==================== PUSH NOTIFICATIONS ====================
EXPO_PUSH_URL=https://exp.host/--/api/v2/push/send

# ==================== SCHEDULING ====================
CRON_TIMEZONE=Asia/Kolkata

# ==================== SERVER ====================
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://spendly.com
```

---

## Environment Variables by Service

### For Render Deployment

1. **Create .env file in backend folder:**
```bash
MONGODB_URI=your_mongo_uri
JWT_SECRET=your_jwt_secret
BREVO_API_KEY=your_brevo_key
BREVO_SENDER_EMAIL=your_sender_email
EXPO_PUSH_URL=https://exp.host/--/api/v2/push/send
CRON_TIMEZONE=Asia/Kolkata
NODE_ENV=production
FRONTEND_URL=your_frontend_url
```

2. **Or set in Render Dashboard:**
   - Go to Dashboard → Settings → Environment
   - Add each variable
   - Deploy

### For Local Development

Create `.env` in `backend/` folder:
```bash
MONGODB_URI=mongodb://localhost:27017/spendapp
JWT_SECRET=dev-secret-key-for-testing-only
BREVO_API_KEY=your_test_brevo_key
BREVO_SENDER_EMAIL=test@example.com
EXPO_PUSH_URL=https://exp.host/--/api/v2/push/send
CRON_TIMEZONE=Asia/Kolkata
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

---

## Security Best Practices

### ✅ DO:
- Generate strong random JWT_SECRET (min 32 chars)
- Use environment variables for all secrets
- Rotate secrets periodically
- Use separate API keys for dev/staging/production
- Enable 2FA on Brevo/MongoDB accounts
- Restrict MongoDB access to Render IP only
- Store .env file in .gitignore

### ❌ DON'T:
- Commit .env to version control
- Use weak or guessable secrets
- Share credentials in messages/emails
- Use same keys across environments
- Log sensitive values
- Expose secrets in error messages

---

## Verification Checklist

Before deploying to production:

- [ ] MONGODB_URI is valid and points to production cluster
- [ ] JWT_SECRET is cryptographically secure (32+ chars)
- [ ] BREVO_API_KEY is verified and working
- [ ] BREVO_SENDER_EMAIL is verified in Brevo dashboard
- [ ] CRON_TIMEZONE matches your target timezone
- [ ] NODE_ENV=production
- [ ] All variables are set in Render environment
- [ ] .env file is in .gitignore
- [ ] MongoDB IP whitelist includes Render IPs

---

## Testing Environment Variables

### Test MongoDB Connection
```bash
node -e "const mongoose = require('mongoose'); mongoose.connect(process.env.MONGODB_URI).then(() => console.log('✅ Connected')).catch(e => console.log('❌', e.message));"
```

### Test Brevo API Key
```bash
curl -H "api-key: $BREVO_API_KEY" https://api.brevo.com/v3/account | jq '.email'
```

### Test Server Startup
```bash
npm start
# Check for: "🚀 Server running on port 5000"
# Check for: "✅ All automation jobs initialized successfully!"
```

---

## Troubleshooting

### "MONGODB_URI is not configured"
- Check if MONGODB_URI is set
- Verify connection string format
- Check MongoDB Atlas network access (whitelist Render IPs)

### "BREVO_API_KEY is not configured"
- Verify API key in Brevo dashboard
- Check for typos
- Ensure API key starts with "xkeysib-"

### "Invalid timezone"
- Check CRON_TIMEZONE spelling
- Use IANA timezone format (e.g., "Asia/Kolkata")

### "Notifications not sending"
- Verify EXPO_PUSH_URL is correct
- Check user has valid expoPushToken
- Check notificationEnabled is true

---

## Support

For help with:
- **MongoDB:** [MongoDB Docs](https://docs.mongodb.com/)
- **Brevo:** [Brevo Help Center](https://help.brevo.com/)
- **Expo:** [Expo Documentation](https://docs.expo.dev/)
- **Render:** [Render Docs](https://render.com/docs)

