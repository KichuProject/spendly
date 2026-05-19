# Automation System - Implementation & Testing Guide

Complete guide for the Spend App Backend Automation System including Push Notifications and Brevo Keep-Alive.

---

## System Architecture

### Components

1. **Push Notification System**
   - Checks user day completion status at 10 PM
   - Sends reminder notifications if day not complete
   - Retry notifications at 11 PM if still incomplete
   - Prevents duplicate notifications per day

2. **Brevo Keep-Alive System**
   - Sends monthly automated email on 1st and 15th
   - Keeps Brevo API active (prevents deactivation)
   - Prevents ~3 month inactivity timeout

3. **Scheduler (node-cron)**
   - Timezone-aware job scheduling
   - Automatic retry on failure
   - Graceful shutdown on server stop

---

## Job Schedules

### 1. Daily 10 PM Notification Job

**Schedule:** `0 22 * * *` (Every day at 10 PM)  
**Timezone:** User-configured (CRON_TIMEZONE env var)  
**Purpose:** First reminder to log expenses

**Process:**
1. Get all users with notifications enabled
2. For each user:
   - Check if already notified at 10 PM today
   - Check if day is marked complete
   - If not complete: Send push notification
   - Log to database
   - Update user's lastNotificationDate
3. Return statistics (sent, skipped, failed)

**Log Output:**
```
🔔 10PM Notification Job Started - 2026-05-18T22:00:00.000Z
📊 Found 150 active users with push tokens
✅ Notification sent to user@example.com at 10PM
...
📈 10PM Job Summary:
   ✅ Sent: 42
   ⏭️  Skipped: 108
   ❌ Failed: 0
   📊 Total: 150
```

---

### 2. Daily 11 PM Notification Job

**Schedule:** `0 23 * * *` (Every day at 11 PM)  
**Timezone:** User-configured (CRON_TIMEZONE env var)  
**Purpose:** Final reminder before midnight

**Process:**
1. Same as 10 PM job
2. Sends different message: "Last Chance!"
3. Prevents duplicate notifications (check database)

---

### 3. Monthly Brevo Keep-Alive Jobs

**Schedule 1:** `0 2 1 * *` (1st of every month at 2 AM)  
**Schedule 2:** `0 2 15 * *` (15th of every month at 2 AM - redundancy)

**Purpose:** Keep Brevo API active

**Process:**
1. Create keep-alive email content
2. Send to BREVO_SENDER_EMAIL
3. Log success/failure
4. Return result

**Log Output:**
```
📧 Brevo Keep-Alive Job Started - 2026-06-01T02:00:00.000Z
✅ Keep-Alive Email Status: SUCCESS
   📨 Message ID: 123456789
   ⏰ Timestamp: 2026-06-01T02:00:15.123Z
```

---

## Database Models & Fields

### User Model Additions

```javascript
{
  expoPushToken: String,           // Expo push token
  lastNotificationDate: Date,      // Last notification sent time
  lastNotificationType: String,    // '10PM' or '11PM'
  notificationEnabled: Boolean,    // User preference
  passwordResetToken: String,      // For forgot password
  passwordResetExpiry: Date,       // Token expiry time
  password: String,                // Hashed password
  passwordChangedAt: Date          // Last password change
}
```

### NotificationLog Model

```javascript
{
  userId: ObjectId,           // Reference to User
  type: String,               // '10PM' or '11PM'
  reason: String,             // Why notification was sent
  title: String,              // Notification title
  body: String,               // Notification body
  status: String,             // 'sent', 'failed', 'skipped'
  errorMessage: String,       // Error details if failed
  deviceToken: String,        // Token used to send
  response: Mixed,            // Expo API response
  dateKey: String,            // YYYY-MM-DD
  sentAt: Date,               // When it was sent
  createdAt: Date,            // Document creation time
  updatedAt: Date             // Last update time
}
```

---

## API Endpoints

### Register Push Token

**Endpoint:** `POST /api/users/register-push-token`

**Headers:**
```
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Request Body:**
```json
{
  "expoPushToken": "ExponentPushToken[abcd1234efgh5678ijkl9012]"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Push token registered successfully",
  "user": {
    "_id": "userId",
    "email": "user@example.com",
    "name": "John Doe",
    "expoPushToken": "ExponentPushToken[abcd1234efgh5678ijkl9012]",
    "notificationEnabled": true
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Invalid Expo push token format"
}
```

---

## Testing & Debugging

### 1. Manual Testing (Local Development)

#### Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your credentials
```

#### Start Server
```bash
npm start
# Output:
# ✅ MongoDB connected
# ✅ Automation scheduler initialized
# 🚀 Server running on port 5000
# ✅ All automation jobs initialized successfully!
```

#### Test Endpoints

**Health Check:**
```bash
curl http://localhost:5000/health
```

**Get Job Status:**
```bash
curl http://localhost:5000/api/scheduler/status
```

#### Trigger Jobs Manually (for testing)

**Note:** You would need to add these endpoints to the API. Add to `app.js`:

```javascript
app.post('/api/scheduler/test-notification', async (req, res) => {
  const { testNotificationJob } = require('./src/scheduler/cronJobs');
  const result = await testNotificationJob('10PM');
  res.json(result);
});

app.post('/api/scheduler/test-brevo', async (req, res) => {
  const { testBrevoKeepAliveJob } = require('./src/scheduler/cronJobs');
  const result = await testBrevoKeepAliveJob();
  res.json(result);
});
```

Then test:
```bash
# Test 10 PM notification job
curl -X POST http://localhost:5000/api/scheduler/test-notification

# Test Brevo keep-alive
curl -X POST http://localhost:5000/api/scheduler/test-brevo
```

---

### 2. Testing in Production (Render)

#### Verify Jobs Started
Check logs in Render Dashboard:
```
✅ MongoDB connected
✅ Automation scheduler initialized
🚀 Server running on port 5000
✅ 10 PM notification job scheduled (22:00)
✅ 11 PM notification job scheduled (23:00)
✅ Brevo keep-alive job scheduled (1st of month, 02:00)
✅ All automation jobs initialized successfully!
```

#### Monitor Notification Logs
```bash
# Check notification logs in MongoDB
db.notificationlogs.find({ dateKey: "2026-05-18" }).sort({ sentAt: -1 }).limit(10)
```

#### Monitor Email Logs (Brevo)
Go to Brevo Dashboard → Analytics → Sent Emails

---

### 3. Debugging Issues

#### Problem: Jobs not running at scheduled time

**Check:**
1. Server is running: `curl http://localhost:5000/health`
2. Timezone is correct: Check `CRON_TIMEZONE` env var
3. MongoDB connection: Check logs for "✅ MongoDB connected"
4. Job initialized: Check for "✅ X job scheduled"

**Debug:**
```javascript
// Add to cronJobs.js for verbose logging
logger.info(`Current server time: ${new Date()}`);
logger.info(`Configured timezone: ${process.env.CRON_TIMEZONE}`);
```

#### Problem: Notifications not sending

**Check:**
1. User has valid `expoPushToken`
2. `notificationEnabled` is `true`
3. Day is not already marked complete
4. User has at least 1 expense today (or check `notificationEnabled`)

**Verify in MongoDB:**
```bash
db.users.findOne({ email: "user@example.com" }, { expoPushToken: 1, notificationEnabled: 1 })

# Should return:
# {
#   "_id": ObjectId(...),
#   "expoPushToken": "ExponentPushToken[...]",
#   "notificationEnabled": true
# }
```

#### Problem: Brevo keep-alive failing

**Check:**
1. `BREVO_API_KEY` is valid
2. `BREVO_SENDER_EMAIL` is verified in Brevo dashboard
3. Brevo account has API access enabled

**Test API Key:**
```bash
curl -H "api-key: YOUR_API_KEY" https://api.brevo.com/v3/account | jq '.email'
# Should return your email
```

---

## Log Files & Monitoring

### Log Output Structure

```
════════════════════════════════════════════════════════════
🔔 10PM Notification Job Started - 2026-05-18T22:00:00.000Z
════════════════════════════════════════════════════════════
📊 Found 150 active users with push tokens
✅ Notification sent to alice@example.com at 10PM
✅ Notification sent to bob@example.com at 10PM
⏭️ User charlie@example.com already notified at 10PM today
❌ Failed to send notification to dave@example.com: Invalid token format

📈 10PM Job Summary:
   ✅ Sent: 42
   ⏭️  Skipped: 108
   ❌ Failed: 1
   📊 Total: 151
════════════════════════════════════════════════════════════
```

### Viewing Logs

**Local Development:**
```bash
npm start
# Logs appear directly in terminal
```

**Render Production:**
```
Render Dashboard → Logs
# Real-time streaming logs
```

**MongoDB Logs:**
```bash
db.notificationlogs.aggregate([
  { $match: { dateKey: "2026-05-18" } },
  { $group: { 
    _id: "$type", 
    count: { $sum: 1 },
    sent: { $sum: { $cond: ["$status": "sent", 1, 0] } }
  }}
])
```

---

## Performance Optimization

### 1. Database Indexes

Critical indexes already created:

```javascript
// User indexes
userSchema.index({ email: 1 });
userSchema.index({ passwordResetToken: 1, passwordResetExpiry: 1 });

// NotificationLog indexes
notificationLogSchema.index({ userId: 1, dateKey: 1, type: 1 });
notificationLogSchema.index({ userId: 1, sentAt: -1 });
notificationLogSchema.index({ status: 1 });
```

### 2. Query Optimization

**Good Practices Used:**
- Only fetch users with `expoPushToken` and `notificationEnabled`
- Use `select()` to exclude unnecessary fields
- Batch operations where possible
- Index on `dateKey` for daily queries

---

## Maintenance & Monitoring

### Daily Checklist

- [ ] Check notification send rate: `> 30% of users`
- [ ] Monitor failed notifications: `< 5%`
- [ ] Verify no duplicate notifications: Check `dateKey` + `type` uniqueness

### Weekly Checklist

- [ ] Review error logs
- [ ] Check database storage growth
- [ ] Verify scheduled jobs are running
- [ ] Monitor API response times

### Monthly Checklist

- [ ] Clean old notification logs (> 30 days): `db.notificationlogs.deleteMany({ sentAt: { $lt: new Date(Date.now() - 30*24*60*60*1000) } })`
- [ ] Verify Brevo keep-alive email was sent
- [ ] Review password reset usage
- [ ] Update dependencies: `npm update`

---

## Troubleshooting Commands

### Reset notification state for testing
```javascript
// MongoDB
db.notificationlogs.deleteMany({ dateKey: "2026-05-18", type: "10PM" })
db.users.updateMany({}, { lastNotificationType: null, lastNotificationDate: null })
```

### Check job execution time
```javascript
// Add to cronJobs.js
const start = Date.now();
// ... job code ...
const duration = Date.now() - start;
logger.info(`Job completed in ${duration}ms`);
```

### Monitor memory usage
```bash
# On Render, check in dashboard
# or in Node.js:
console.log(process.memoryUsage());
```

---

## Disaster Recovery

### If jobs stop running

1. Check server status: `curl http://localhost:5000/health`
2. Restart server (Render auto-restart if running on Render)
3. Check logs for errors
4. Verify environment variables

### If Brevo API fails

1. Check API key validity
2. Check account status in Brevo dashboard
3. Verify sender email is verified
4. Check rate limits (1000 emails/day free tier)

### If notifications accumulate in queue

1. Reduce batch size in `sendBatchNotifications`
2. Add retry logic with exponential backoff
3. Split large batches

---

## Next Steps

1. **Deploy to Render:**
   - Set all environment variables
   - Deploy backend
   - Verify jobs initialize in logs

2. **Monitor for 24 hours:**
   - Check 10 PM job execution
   - Check 11 PM job execution
   - Monitor success rate

3. **Test End-to-End:**
   - Register push token from frontend
   - Mark day incomplete at 9:55 PM
   - Wait for 10 PM notification
   - Receive push notification on device

4. **Production Validation:**
   - Check Brevo dashboard for emails
   - Monitor notification statistics
   - Set up alerting for failures

