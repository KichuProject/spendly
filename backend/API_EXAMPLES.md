# API Examples & cURL Commands

Complete examples for testing the Spend App Backend API

---

## 🔐 Authentication

### 1. Send OTP for Signup

```bash
curl -X POST http://localhost:5000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "type": "signup"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "OTP sent to your email",
  "email": "newuser@example.com",
  "expiresIn": 600
}
```

---

### 2. Verify OTP & Create Account

```bash
curl -X POST http://localhost:5000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "otp": "123456",
    "name": "John Doe"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Authentication successful",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "email": "newuser@example.com",
    "name": "John Doe",
    "currency": "INR",
    "isEmailVerified": true,
    "isActive": true,
    "createdAt": "2026-05-18T10:30:00Z"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 900
}
```

**Save these tokens:**
- `accessToken` - Use for authenticated requests (valid 15 min)
- `refreshToken` - Use to refresh access token (valid 10 days)

---

### 3. Send OTP for Login

```bash
curl -X POST http://localhost:5000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "existing@example.com",
    "type": "login"
  }'
```

---

### 4. Verify OTP for Login

```bash
curl -X POST http://localhost:5000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "existing@example.com",
    "otp": "654321"
  }'
```

---

### 5. Refresh Access Token

When access token expires (15 min), use refresh token to get new one:

```bash
curl -X POST http://localhost:5000/api/auth/refresh-token \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }'
```

**Response:**
```json
{
  "success": true,
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 900
}
```

---

### 6. Resend OTP

```bash
curl -X POST http://localhost:5000/api/auth/resend-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "type": "signup"
  }'
```

---

### 7. Logout

```bash
curl -X POST http://localhost:5000/api/auth/logout \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## 👤 User & Profile

### 8. Register Expo Push Token

**This is critical for receiving push notifications!**

```bash
curl -X POST http://localhost:5000/api/users/register-push-token \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "token": "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Push token registered successfully",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "name": "John Doe",
    "expoPushToken": "ExponentPushToken[...]",
    "notificationEnabled": true
  }
}
```

---

### 9. Get User Profile

```bash
curl -X GET http://localhost:5000/api/users/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "name": "John Doe",
    "currency": "INR",
    "phone": "+91-9876543210",
    "isEmailVerified": true,
    "isActive": true,
    "lastLogin": "2026-05-18T15:30:00Z",
    "createdAt": "2026-05-18T10:30:00Z",
    "updatedAt": "2026-05-18T15:30:00Z"
  }
}
```

---

### 10. Update Profile

```bash
curl -X PUT http://localhost:5000/api/users/me \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "name": "John Updated",
    "currency": "USD",
    "phone": "+1-234-567-8900"
  }'
```

---

### 11. Enable Notifications

```bash
curl -X POST http://localhost:5000/api/users/enable-notifications \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

### 12. Disable Notifications

```bash
curl -X POST http://localhost:5000/api/users/disable-notifications \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## 🧪 Quick Test Script

Save as `test-api.sh`:

```bash
#!/bin/bash

API="http://localhost:5000/api"
EMAIL="test@example.com"
NAME="Test User"

echo "📧 Step 1: Sending OTP..."
OTP_RESPONSE=$(curl -s -X POST $API/auth/send-otp \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"type\":\"signup\"}")

echo $OTP_RESPONSE | jq .

echo ""
echo "📱 Step 2: Check your email for OTP (enter it below)"
read -p "Enter OTP: " OTP

echo ""
echo "🔑 Step 3: Verifying OTP..."
AUTH_RESPONSE=$(curl -s -X POST $API/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"otp\":\"$OTP\",\"name\":\"$NAME\"}")

echo $AUTH_RESPONSE | jq .

ACCESS_TOKEN=$(echo $AUTH_RESPONSE | jq -r '.accessToken')
REFRESH_TOKEN=$(echo $AUTH_RESPONSE | jq -r '.refreshToken')

echo ""
echo "✅ Tokens Received!"
echo "Access Token: $ACCESS_TOKEN"
echo "Refresh Token: $REFRESH_TOKEN"

echo ""
echo "👤 Step 4: Getting Profile..."
curl -s -X GET $API/users/me \
  -H "Authorization: Bearer $ACCESS_TOKEN" | jq .

echo ""
echo "✅ API Test Complete!"
```

Run it:
```bash
chmod +x test-api.sh
./test-api.sh
```

---

## 📍 Common Response Codes

| Code | Meaning | Example |
|------|---------|---------|
| 200 | Success | OTP sent successfully |
| 201 | Created | User created |
| 400 | Bad Request | Invalid email format |
| 401 | Unauthorized | Invalid token or OTP |
| 404 | Not Found | User not found |
| 409 | Conflict | Email already registered |
| 500 | Server Error | Database connection error |

---

## 🚨 Error Responses

### Invalid OTP

```json
{
  "success": false,
  "message": "Invalid OTP"
}
```

### Token Expired

```json
{
  "success": false,
  "message": "Access token expired",
  "code": "TOKEN_EXPIRED"
}
```

### Missing Token

```json
{
  "success": false,
  "message": "Authorization header missing or invalid"
}
```

### Email Already Exists

```json
{
  "success": false,
  "message": "Email already registered. Please login instead."
}
```

---

## 🔑 Using Tokens in Frontend

### React/React Native Example

```javascript
// Save tokens after login
const { accessToken, refreshToken, user } = authResponse;

// Store in secure storage
await SecureStore.setItemAsync('accessToken', accessToken);
await SecureStore.setItemAsync('refreshToken', refreshToken);

// Use in requests
const response = await fetch('http://localhost:5000/api/users/me', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
  },
});

// Handle token expiry
if (response.status === 401) {
  // Refresh token
  const refreshResponse = await fetch(
    'http://localhost:5000/api/auth/refresh-token',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    }
  );

  const { accessToken: newToken } = await refreshResponse.json();
  
  // Save new token
  await SecureStore.setItemAsync('accessToken', newToken);
  
  // Retry original request
  return fetch('http://localhost:5000/api/users/me', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${newToken}`,
    },
  });
}
```

---

## 🧠 Pro Tips

### 1. Save Access Token for 15 Min
```javascript
const expiryTime = Date.now() + (900 * 1000); // 15 min from now
```

### 2. Auto-Refresh Before Expiry
```javascript
setTimeout(() => {
  // Refresh token 1 minute before expiry
  refreshAccessToken();
}, (900 - 60) * 1000);
```

### 3. Always Include Authorization Header
```javascript
headers: {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json',
}
```

### 4. Handle 401 Globally
```javascript
// In your API client
if (response.status === 401) {
  // Token expired, refresh it
  // Then retry request
}
```

---

## 📊 Testing with Postman

1. Create new collection: "Spend App"
2. Add requests for each endpoint
3. Use environment variables:
   - `base_url` = http://localhost:5000
   - `accessToken` = (get from login response)
   - `refreshToken` = (get from login response)

4. In request URL: `{{base_url}}/api/auth/send-otp`
5. In headers: `Authorization: Bearer {{accessToken}}`

---

## ✅ Checklist for Integration

- [ ] OTP sending working
- [ ] OTP verification working
- [ ] Tokens received and stored
- [ ] Access token used in requests
- [ ] Refresh token works
- [ ] Push token registered
- [ ] Profile fetched successfully
- [ ] Notifications enabled/disabled

---

**Ready to integrate!** 🚀
