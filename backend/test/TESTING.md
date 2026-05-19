# Complete Testing Guide - Spend App

## 1. API BASE URL
```
http://localhost:5000/api
```

---

## 2. TEST DATA - Sample Users

### Test User 1 - Basic User
```json
Email: testuser1@gmail.com
Phone: 9876543210
Password: Test@123456
Name: John Doe
Currency: USD
```

### Test User 2 - Premium User
```json
Email: testuser2@gmail.com
Phone: 9876543211
Password: Test@123456
Name: Jane Smith
Currency: INR
```

### Test Admin for Password Reset
```json
Email: kishorekichuper@gmail.com
Phone: 9876543212
Password: TestPass@123
Name: Admin User
Currency: USD
```

---

## 3. AUTHENTICATION ENDPOINTS

### 3.1 OTP Login (Register/Login)
**Endpoint:** `POST /api/auth/otp-login`
```json
{
  "email": "testuser1@gmail.com",
  "phone": "9876543210"
}
```
**Expected Response:**
```json
{
  "success": true,
  "message": "OTP sent to email",
  "userId": "user_id_here"
}
```

### 3.2 Verify OTP
**Endpoint:** `POST /api/auth/verify-otp`
```json
{
  "email": "testuser1@gmail.com",
  "otp": "123456"
}
```
**Expected Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "accessToken": "jwt_token_here",
  "refreshToken": "refresh_token_here",
  "user": { /* user data */ }
}
```

### 3.3 Refresh Token
**Endpoint:** `POST /api/auth/refresh-token`
```json
{
  "refreshToken": "refresh_token_from_login"
}
```

---

## 4. PASSWORD MANAGEMENT ENDPOINTS

### 4.1 Forgot Password (WITH EMAIL VALIDATION)
**Endpoint:** `POST /api/auth/forgot-password`
```json
{
  "email": "testuser1@gmail.com"
}
```
**Expected Response:**
```json
{
  "success": true,
  "message": "If email exists, reset link has been sent"
}
```
**Important:** This endpoint checks if email exists in database:
- ✅ If email EXISTS → Generates reset token, saves to DB, sends email
- ❌ If email DOES NOT EXIST → Still returns 200 OK (for security, doesn't reveal if email exists)

**Database Check After Calling This:**
```javascript
// In MongoDB Compass, query:
db.users.findOne({ email: "testuser1@gmail.com" }, { passwordResetToken: 1, passwordResetExpiry: 1 })
// Should show token fields populated if email exists
```

### 4.2 Verify Reset Token
**Endpoint:** `POST /api/auth/verify-reset-token`
```json
{
  "email": "testuser1@gmail.com",
  "token": "token_from_email_or_forgot_password_response"
}
```
**Expected Response:**
```json
{
  "success": true,
  "message": "Token is valid"
}
```

### 4.3 Reset Password (REQUIRES VALID TOKEN)
**Endpoint:** `POST /api/auth/reset-password`
```json
{
  "email": "testuser1@gmail.com",
  "token": "reset_token_here",
  "newPassword": "NewPassword@123"
}
```
**Expected Response:**
```json
{
  "success": true,
  "message": "Password reset successful"
}
```

### 4.4 Change Password (REQUIRES AUTHENTICATION)
**Endpoint:** `POST /api/users/change-password`
**Headers:**
```
Authorization: Bearer your_access_token_here
```
**Body:**
```json
{
  "currentPassword": "Test@123456",
  "newPassword": "NewPassword@123"
}
```
**Expected Response:**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

---

## 5. USER ENDPOINTS

### 5.1 Get User Profile
**Endpoint:** `GET /api/users/profile`
**Headers:**
```
Authorization: Bearer your_access_token_here
```
**Expected Response:**
```json
{
  "success": true,
  "user": { /* user data */ }
}
```

### 5.2 Update User Profile
**Endpoint:** `PUT /api/users/profile`
**Headers:**
```
Authorization: Bearer your_access_token_here
```
**Body:**
```json
{
  "name": "Updated Name",
  "email": "newemail@gmail.com",
  "currency": "EUR",
  "phone": "9876543213"
}
```

---

## 6. EXPENSE ENDPOINTS

### 6.1 Create Expense
**Endpoint:** `POST /api/expenses`
**Headers:**
```
Authorization: Bearer your_access_token_here
```
**Body:**
```json
{
  "amount": 500,
  "category": "Food",
  "description": "Lunch at cafe",
  "date": "2026-05-18T12:00:00Z",
  "splitWith": []
}
```

### 6.2 Get All Expenses
**Endpoint:** `GET /api/expenses`
**Headers:**
```
Authorization: Bearer your_access_token_here
```

### 6.3 Update Expense
**Endpoint:** `PUT /api/expenses/:id`
**Headers:**
```
Authorization: Bearer your_access_token_here
```

### 6.4 Delete Expense
**Endpoint:** `DELETE /api/expenses/:id`
**Headers:**
```
Authorization: Bearer your_access_token_here
```

---

## 7. FRIEND ENDPOINTS

### 7.1 Add Friend
**Endpoint:** `POST /api/friends`
**Headers:**
```
Authorization: Bearer your_access_token_here
```
**Body:**
```json
{
  "friendEmail": "testuser2@gmail.com"
}
```

### 7.2 Get All Friends
**Endpoint:** `GET /api/friends`
**Headers:**
```
Authorization: Bearer your_access_token_here
```

### 7.3 Remove Friend
**Endpoint:** `DELETE /api/friends/:friendId`
**Headers:**
```
Authorization: Bearer your_access_token_here
```

---

## 8. NOTIFICATION ENDPOINTS

### 8.1 Get Notification Logs
**Endpoint:** `GET /api/notifications/logs`
**Headers:**
```
Authorization: Bearer your_access_token_here
```

### 8.2 Get Notification Stats
**Endpoint:** `GET /api/notifications/stats`
**Headers:**
```
Authorization: Bearer your_access_token_here
```

---

## 9. ANALYTICS ENDPOINTS

### 9.1 Get Daily Spending Stats
**Endpoint:** `GET /api/analytics/daily?date=2026-05-18`
**Headers:**
```
Authorization: Bearer your_access_token_here
```

### 9.2 Get Monthly Spending Stats
**Endpoint:** `GET /api/analytics/monthly?month=5&year=2026`
**Headers:**
```
Authorization: Bearer your_access_token_here
```

---

## 10. COMPLETE TESTING WORKFLOW

### Step 1: Register a New User
1. Call `POST /api/auth/otp-login` with email and phone
2. Get OTP from email or database
3. Call `POST /api/auth/verify-otp` with OTP
4. Store `accessToken` and `refreshToken`

### Step 2: Test Forgot Password Flow
1. Call `POST /api/auth/forgot-password` with ANY email
2. **Database Validation:**
   - ✅ If email exists: Check `db.users.findOne({ email: "..." })` should have `passwordResetToken` populated
   - ❌ If email doesn't exist: Response still 200 OK for security, no token in database
3. Call `POST /api/auth/verify-reset-token` to validate token
4. Call `POST /api/auth/reset-password` to set new password
5. Try logging in with new password

### Step 3: Test Change Password (Authenticated)
1. Login and get `accessToken`
2. Call `POST /api/users/change-password` with current and new password
3. Logout and login with new password to verify

### Step 4: Add Test Expenses
1. Login as testuser1
2. Create 5-10 expenses with different categories
3. Verify all expenses saved with timestamps
4. Add split expenses with testuser2

### Step 5: Test Notifications
1. Register for push notifications (set `expoPushToken`)
2. Check notification logs in database
3. Verify timestamps are stored correctly

### Step 6: Mark Day as Complete
1. Call `POST /api/days/complete` to mark today as done
2. No notifications should be sent for today

---

## 11. TESTING CHECKLIST

### Backend Endpoints ✅
- [ ] OTP Login endpoint
- [ ] OTP Verification endpoint
- [ ] Refresh Token endpoint
- [ ] Forgot Password endpoint (validates email exists)
- [ ] Verify Reset Token endpoint
- [ ] Reset Password endpoint
- [ ] Change Password endpoint
- [ ] Get User Profile endpoint
- [ ] Update User Profile endpoint
- [ ] Create Expense endpoint
- [ ] Get All Expenses endpoint
- [ ] Update Expense endpoint
- [ ] Delete Expense endpoint
- [ ] Add Friend endpoint
- [ ] Get Friends endpoint
- [ ] Remove Friend endpoint
- [ ] Get Notifications endpoint
- [ ] Get Analytics endpoint

### Database Storage ✅
- [ ] User data saved with timestamps
- [ ] Password reset token saved in database
- [ ] Expenses saved with date/time
- [ ] Friends list stored correctly
- [ ] Notifications logged with date/time

### Email System ✅
- [ ] OTP email sends successfully
- [ ] Forgot password email sends only if email exists
- [ ] Email contains reset link with token
- [ ] Email template renders correctly

### Push Notifications ✅
- [ ] 10 PM job triggers daily
- [ ] 11 PM job triggers daily
- [ ] Notifications only send if user has expenses
- [ ] Notifications don't send if day is marked complete
- [ ] Brevo keep-alive job runs monthly

### Frontend Integration ✅
- [ ] Frontend connects to backend API
- [ ] Authentication flow works end-to-end
- [ ] Forgot password with validation works
- [ ] Expenses sync to database
- [ ] Friends list syncs
- [ ] Notifications display correctly

---

## 12. IMPORTANT VALIDATIONS

### Email Existence Validation (Forgot Password)
```
POST /api/auth/forgot-password with email: "existinguser@gmail.com"
→ ✅ Token saved to database
→ ✅ Email sent with reset link

POST /api/auth/forgot-password with email: "nonexistent@gmail.com"
→ 200 OK (for security, doesn't reveal user doesn't exist)
→ ❌ No token in database
→ ❌ No email sent
```

### Password Reset Token Validation
```
Token must be:
- Present in database
- Not expired (1 hour expiry)
- Match the hashed value stored

If invalid:
- 400 Bad Request with error message
- Do NOT reset password
```

### Password Requirements
- Minimum 8 characters
- Mix of uppercase and lowercase
- At least one number
- At least one special character

---

## 13. DATABASE QUERIES FOR VERIFICATION

### Check if test data exists
```javascript
db.users.countDocuments()  // Should be > 0
db.expenses.countDocuments()  // Should have expenses
db.friends.countDocuments()  // Should have friend relationships
```

### Verify password reset token
```javascript
db.users.findOne(
  { email: "testuser1@gmail.com" },
  { passwordResetToken: 1, passwordResetExpiry: 1, email: 1 }
)
// Should show encrypted token and expiry date
```

### Check notification logs
```javascript
db.notificationlogs.find({ createdAt: { $gte: new Date("2026-05-18") } })
// Should show today's notification attempts
```

### Verify timestamps
```javascript
db.expenses.findOne({}, { createdAt: 1, updatedAt: 1 })
// Both should be ISO8601 format with timestamps
```

