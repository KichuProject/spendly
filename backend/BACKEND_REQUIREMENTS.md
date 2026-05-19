# Spend App - Backend Requirements & Implementation Guide

## Table of Contents
1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Database Design](#database-design)
4. [API Endpoints](#api-endpoints)
5. [Authentication Flow](#authentication-flow)
6. [Project Structure](#project-structure)
7. [Setup & Installation](#setup--installation)
8. [Implementation Checklist](#implementation-checklist)

---

## Project Overview

**Spend App** is a React Native expense tracking application with split expense management. The backend is responsible for:

- **User Authentication**: OTP-based login/signup system
- **Expense Management**: Create, read, update, delete expenses with categorization
- **Split Tracking**: Track shared expenses between friends and manage settlements
- **Friend Management**: Manage friend profiles and calculate balances
- **Analytics**: Generate spending statistics and trends
- **Notifications**: Track incomplete days and send reminders

### Key Features:
- ✅ OTP-based authentication (no passwords)
- ✅ Expense CRUD with filters (date-based, category-based)
- ✅ Split expenses with multiple friends
- ✅ Real-time balance calculation
- ✅ Analytics & spending trends
- ✅ Day completion tracking
- ✅ Notification system for incomplete days

---

## Technology Stack

### Backend Framework
```
Node.js v18+ with Express.js
- Express: Fast, lightweight HTTP server
- Port: 5000 (configurable)
- Environment: Development/Production
```

### Database
```
MongoDB Atlas (Cloud)
- Collections: users, expenses, friends, dayCompletions, otpTokens
- Document-based NoSQL structure
- Automatic backups and scalability
```

### Authentication
```
JWT (JSON Web Tokens)
- Access Token: Short-lived (15 min)
- Refresh Token: Long-lived (7 days)
- OTP: For email verification (Twilio/SendGrid)
```

### Utilities & Libraries
```
- mongoose: MongoDB ODM (Object Data Modeling)
- jsonwebtoken: JWT creation and verification
- bcryptjs: Password hashing (for OTP storage)
- joi: Schema validation
- cors: Cross-origin requests
- dotenv: Environment variables
- axios: HTTP client (for OTP service)
```

---

## Database Design

### 1. Users Collection

```javascript
{
  _id: ObjectId,
  email: "user@example.com",           // unique, indexed
  name: "John Doe",                     // user's full name
  isEmailVerified: true,                // email verification status
  createdAt: 2026-05-18T10:00:00Z,     // account creation timestamp
  updatedAt: 2026-05-18T10:00:00Z,     // last update timestamp
  lastLogin: 2026-05-18T15:30:00Z,     // track last login
  phone: "+91-9876543210",              // optional phone number
  currency: "INR"                       // user's preferred currency
}
```

**Indexes:**
- `email` (unique): Fast email lookups for login
- `createdAt`: For filtering users by registration date

---

### 2. Expenses Collection

```javascript
{
  _id: ObjectId,
  userId: ObjectId,                          // reference to users collection
  amount: 1200.50,                          // expense amount
  reason: "Team Lunch",                     // expense description/category
  category: "Food",                         // auto-mapped from reason
  emoji: "🍽️",                              // category emoji
  date: 2026-05-17T00:00:00Z,              // expense date (at midnight)
  dateKey: "2026-05-17",                    // string key for date filtering
  type: "split",                            // "solo" or "split"
  splits: [
    {
      friendId: ObjectId,
      friendName: "Arjun Mehta",
      amount: 600.25,                       // how much this friend owes/is owed
      direction: "theyOwe",                 // "theyOwe" or "iOwe"
      paid: false                           // settlement status
    },
    {
      friendId: ObjectId,
      friendName: "Priya Sharma",
      amount: 600.25,
      direction: "theyOwe",
      paid: false
    }
  ],
  notes: "Contributed by Arjun, Priya",     // optional notes
  createdAt: 2026-05-18T10:00:00Z,
  updatedAt: 2026-05-18T10:00:00Z,
  tags: ["office", "group"]                 // optional tags for filtering
}
```

**Indexes:**
- `userId + date`: Fast filtering by user and date range
- `dateKey`: String-based date filtering
- `userId + splits.friendId`: Find all expenses with a specific friend
- `category`: Filter by expense category

---

### 3. Friends Collection

```javascript
{
  _id: ObjectId,
  userId: ObjectId,                    // reference to users collection
  name: "Arjun Mehta",                 // friend's name
  initials: "AM",                      // auto-generated from name
  gradientIndex: 0,                    // for UI avatar color
  gradient: ["#7C3AED", "#4F46E5"],   // gradient colors for avatar
  phone: "+91-9876543210",             // optional contact info
  email: "arjun@example.com",          // optional email
  profileImage: "url...",              // optional profile picture
  createdAt: 2026-05-10T10:00:00Z,
  updatedAt: 2026-05-18T10:00:00Z,
  isActive: true                       // soft delete flag
}
```

**Indexes:**
- `userId + name`: Find friend by name for specific user
- `userId`: Get all friends for a user
- `createdAt`: Sort friends by addition date

---

### 4. Day Completions Collection

```javascript
{
  _id: ObjectId,
  userId: ObjectId,                    // reference to users collection
  dateKey: "2026-05-17",               // YYYY-MM-DD format (unique per user per date)
  date: 2026-05-17T00:00:00Z,         // full date at midnight
  isComplete: true,                    // whether day expenses are tracked
  completedAt: 2026-05-18T09:30:00Z,  // when marked as complete
  createdAt: 2026-05-18T09:30:00Z,
  updatedAt: 2026-05-18T09:30:00Z
}
```

**Indexes:**
- `userId + dateKey`: Unique constraint for day completion status
- `userId + date`: Find incomplete days in a date range
- `isComplete`: Find all incomplete days for notifications

---

### 5. OTP Tokens Collection

```javascript
{
  _id: ObjectId,
  email: "user@example.com",           // email requesting OTP
  otp: "123456",                       // 6-digit OTP (hashed in production)
  purpose: "signup",                   // "signup" or "login"
  attempts: 2,                         // failed verification attempts
  maxAttempts: 5,                      // max allowed attempts
  expiresAt: 2026-05-18T10:10:00Z,    // OTP expiration (10 min from creation)
  createdAt: 2026-05-18T10:00:00Z,
  isVerified: false                    // whether OTP was verified
}
```

**Indexes:**
- `email + expiresAt`: Automatic TTL deletion of expired OTPs
- `email`: Fast OTP lookup

---

## API Endpoints

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

#### 1. Send OTP (Signup/Login)
```
POST /api/auth/send-otp
Content-Type: application/json

Request:
{
  "email": "user@example.com",
  "type": "signup"  // "signup" or "login"
}

Response (200):
{
  "success": true,
  "message": "OTP sent to email",
  "expiresIn": 600,  // seconds
  "data": {
    "email": "user@example.com",
    "otpId": "token_for_tracking"
  }
}

Error (400):
{
  "success": false,
  "message": "Invalid email format"
}
```

#### 2. Verify OTP & Get Tokens
```
POST /api/auth/verify-otp
Content-Type: application/json

Request:
{
  "email": "user@example.com",
  "otp": "123456",
  "name": "John Doe"  // required for signup, optional for login
}

Response (200):
{
  "success": true,
  "message": "Authentication successful",
  "data": {
    "user": {
      "_id": "user_id",
      "email": "user@example.com",
      "name": "John Doe"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 900  // seconds (15 min)
  }
}

Error (401):
{
  "success": false,
  "message": "Invalid or expired OTP"
}
```

#### 3. Refresh Token
```
POST /api/auth/refresh-token
Content-Type: application/json

Request:
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}

Response (200):
{
  "success": true,
  "data": {
    "accessToken": "new_jwt_token",
    "expiresIn": 900
  }
}

Error (401):
{
  "success": false,
  "message": "Invalid or expired refresh token"
}
```

#### 4. Logout
```
POST /api/auth/logout
Authorization: Bearer {accessToken}

Response (200):
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### Expense Endpoints

#### 1. Create Expense
```
POST /api/expenses
Authorization: Bearer {accessToken}
Content-Type: application/json

Request:
{
  "amount": 1200,
  "reason": "Team Lunch",
  "date": "2026-05-18",
  "type": "split",  // "solo" or "split"
  "splits": [
    {
      "friendId": "friend_id_1",
      "friendName": "Arjun Mehta",
      "amount": 600,
      "direction": "theyOwe",  // "theyOwe" or "iOwe"
      "paid": false
    }
  ],
  "notes": "Lunch with team"
}

Response (201):
{
  "success": true,
  "message": "Expense created successfully",
  "data": {
    "_id": "expense_id",
    "userId": "user_id",
    "amount": 1200,
    "reason": "Team Lunch",
    "category": "Food",
    "emoji": "🍽️",
    "date": "2026-05-18T00:00:00Z",
    "type": "split",
    "splits": [...],
    "createdAt": "2026-05-18T10:00:00Z"
  }
}
```

#### 2. Get All Expenses (with Filters)
```
GET /api/expenses
Authorization: Bearer {accessToken}

Query Parameters:
- ?dateFrom=2026-05-01&dateTo=2026-05-31  (date range)
- ?category=Food                            (filter by category)
- ?type=split                               (filter by type: solo/split)
- ?sortBy=date&order=desc                  (sorting)
- ?page=1&limit=20                         (pagination)

Response (200):
{
  "success": true,
  "data": {
    "expenses": [
      {
        "_id": "expense_id",
        "amount": 1200,
        "reason": "Team Lunch",
        "category": "Food",
        "emoji": "🍽️",
        "date": "2026-05-18T00:00:00Z",
        "type": "split",
        "splits": [...],
        "createdAt": "2026-05-18T10:00:00Z"
      }
    ],
    "total": 45,
    "page": 1,
    "limit": 20,
    "totalAmount": 45000
  }
}
```

#### 3. Get Expenses for Specific Date
```
GET /api/expenses/date/:dateKey
Authorization: Bearer {accessToken}

Parameters:
- dateKey: "2026-05-18" (YYYY-MM-DD format)

Response (200):
{
  "success": true,
  "data": {
    "expenses": [...],
    "totalAmount": 2500,
    "date": "2026-05-18"
  }
}
```

#### 4. Get Expenses for Past 7 Days
```
GET /api/expenses/week/past7
Authorization: Bearer {accessToken}

Response (200):
{
  "success": true,
  "data": {
    "expenses": [...],
    "totalAmount": 15000,
    "dateRange": {
      "from": "2026-05-11",
      "to": "2026-05-18"
    }
  }
}
```

#### 5. Get Single Expense
```
GET /api/expenses/:expenseId
Authorization: Bearer {accessToken}

Response (200):
{
  "success": true,
  "data": { ... expense object ... }
}
```

#### 6. Update Expense
```
PUT /api/expenses/:expenseId
Authorization: Bearer {accessToken}
Content-Type: application/json

Request:
{
  "amount": 1300,
  "reason": "Team Lunch Updated",
  "splits": [...]
}

Response (200):
{
  "success": true,
  "message": "Expense updated successfully",
  "data": { ... updated expense ... }
}
```

#### 7. Delete Expense
```
DELETE /api/expenses/:expenseId
Authorization: Bearer {accessToken}

Response (200):
{
  "success": true,
  "message": "Expense deleted successfully"
}
```

---

### Split Management Endpoints

#### 1. Update Split Payment Status
```
PUT /api/expenses/:expenseId/split/:friendId
Authorization: Bearer {accessToken}
Content-Type: application/json

Request:
{
  "paid": true  // mark as paid/unpaid
}

Response (200):
{
  "success": true,
  "message": "Split updated successfully",
  "data": { ... updated expense ... }
}
```

#### 2. Settle All with Friend
```
POST /api/expenses/settle/friend/:friendId
Authorization: Bearer {accessToken}

Response (200):
{
  "success": true,
  "message": "All expenses settled with friend",
  "data": {
    "friendId": "friend_id",
    "settledExpenses": 5,
    "totalAmount": 3000
  }
}
```

---

### Friend Endpoints

#### 1. Add Friend
```
POST /api/friends
Authorization: Bearer {accessToken}
Content-Type: application/json

Request:
{
  "name": "Arjun Mehta",
  "phone": "+91-9876543210",
  "email": "arjun@example.com"
}

Response (201):
{
  "success": true,
  "message": "Friend added successfully",
  "data": {
    "_id": "friend_id",
    "name": "Arjun Mehta",
    "initials": "AM",
    "gradientIndex": 0,
    "gradient": ["#7C3AED", "#4F46E5"],
    "createdAt": "2026-05-18T10:00:00Z"
  }
}
```

#### 2. Get All Friends
```
GET /api/friends
Authorization: Bearer {accessToken}

Query Parameters:
- ?sortBy=name&order=asc
- ?search=Arjun  (search by name)

Response (200):
{
  "success": true,
  "data": {
    "friends": [
      {
        "_id": "friend_id",
        "name": "Arjun Mehta",
        "initials": "AM",
        "gradient": ["#7C3AED", "#4F46E5"],
        "balance": 5000  // total they owe user
      }
    ],
    "total": 10
  }
}
```

#### 3. Get Friend Details
```
GET /api/friends/:friendId
Authorization: Bearer {accessToken}

Response (200):
{
  "success": true,
  "data": {
    "_id": "friend_id",
    "name": "Arjun Mehta",
    "initials": "AM",
    "gradient": ["#7C3AED", "#4F46E5"],
    "balance": {
      "theyOweMe": 2000,
      "iOweThem": 500,
      "net": 1500
    },
    "sharedExpenses": 12,
    "totalShared": 25000
  }
}
```

#### 4. Delete Friend
```
DELETE /api/friends/:friendId
Authorization: Bearer {accessToken}

Response (200):
{
  "success": true,
  "message": "Friend deleted successfully"
}
```

---

### Analytics Endpoints

#### 1. Get Category Breakdown
```
GET /api/analytics/breakdown
Authorization: Bearer {accessToken}

Query Parameters:
- ?dateFrom=2026-05-01&dateTo=2026-05-31
- ?timeframe=monthly  (daily/weekly/monthly)

Response (200):
{
  "success": true,
  "data": {
    "breakdown": [
      {
        "category": "Food",
        "emoji": "🍽️",
        "amount": 5000,
        "percentage": 25,
        "expenseCount": 10
      },
      {
        "category": "Transport",
        "emoji": "🚗",
        "amount": 3000,
        "percentage": 15,
        "expenseCount": 8
      }
    ],
    "totalSpending": 20000,
    "period": "May 2026"
  }
}
```

#### 2. Get Top Expenses
```
GET /api/analytics/top-expenses
Authorization: Bearer {accessToken}

Query Parameters:
- ?limit=10
- ?dateFrom=2026-05-01&dateTo=2026-05-31

Response (200):
{
  "success": true,
  "data": [
    {
      "_id": "expense_id",
      "amount": 5000,
      "reason": "Trip Planning",
      "category": "Travel",
      "emoji": "✈️",
      "date": "2026-05-15",
      "type": "split"
    }
  ]
}
```

#### 3. Get Friend Balance
```
GET /api/analytics/friend-balance/:friendId
Authorization: Bearer {accessToken}

Response (200):
{
  "success": true,
  "data": {
    "friendId": "friend_id",
    "friendName": "Arjun Mehta",
    "balance": {
      "theyOweMe": 3000,
      "iOweThem": 500,
      "net": 2500
    },
    "sharedExpenses": 15,
    "totalShared": 25000,
    "settlementStatus": {
      "settled": 8,
      "unsettled": 7,
      "lastExpense": "2026-05-18"
    }
  }
}
```

#### 4. Get Total Balances
```
GET /api/analytics/total-balance
Authorization: Bearer {accessToken}

Response (200):
{
  "success": true,
  "data": {
    "totalOweMe": 15000,      // total from all friends
    "totalIOwe": 5000,        // total to all friends
    "net": 10000,             // positive = friends owe me, negative = I owe
    "settlementStatus": {
      "settled": 20,
      "unsettled": 8
    },
    "friendCount": 5
  }
}
```

---

### Day Tracking Endpoints

#### 1. Mark Day as Complete
```
POST /api/days/mark-complete
Authorization: Bearer {accessToken}
Content-Type: application/json

Request:
{
  "dateKey": "2026-05-18"
}

Response (200):
{
  "success": true,
  "message": "Day marked as complete",
  "data": {
    "dateKey": "2026-05-18",
    "isComplete": true,
    "completedAt": "2026-05-18T09:30:00Z"
  }
}
```

#### 2. Unmark Day as Complete
```
POST /api/days/unmark-complete
Authorization: Bearer {accessToken}
Content-Type: application/json

Request:
{
  "dateKey": "2026-05-18"
}

Response (200):
{
  "success": true,
  "message": "Day marked as incomplete"
}
```

#### 3. Get Incomplete Days
```
GET /api/days/incomplete
Authorization: Bearer {accessToken}

Query Parameters:
- ?dateFrom=2026-05-01&dateTo=2026-05-31

Response (200):
{
  "success": true,
  "data": {
    "incompleteDays": ["2026-05-17", "2026-05-16", "2026-05-15"],
    "count": 3
  }
}
```

---

## Authentication Flow

### Signup Flow

```
┌─────────────────┐
│  User App       │
└────────┬────────┘
         │
         │ 1. Send email for OTP
         ├──────────────────────────────────────┐
         │                                      │
         │                            ┌─────────▼──────────┐
         │                            │  Backend API       │
         │                            │                    │
         │                            │ - Validate email   │
         │                            │ - Generate OTP     │
         │                            │ - Send via email   │
         │                            │ - Store OTP hash   │
         │                            └────────┬───────────┘
         │                                     │
         │ 2. OTP sent to email               │
         │◄──────────────────────────────────┤
         │                                     │
         │ 3. User enters OTP                 │
         │                                     │
         │ 4. Verify OTP + Create User        │
         ├──────────────────────────────────────┤
         │                                     │
         │                            ┌─────────▼──────────┐
         │                            │  Backend API       │
         │                            │                    │
         │                            │ - Verify OTP       │
         │                            │ - Create user doc  │
         │                            │ - Generate tokens  │
         │                            │ - Delete OTP       │
         │                            └────────┬───────────┘
         │                                     │
         │ 5. Tokens + User data              │
         │◄──────────────────────────────────┤
         │                                     │
         │ 6. Store tokens locally (AsyncStorage)
         │                                     │
    ┌────┴─────────┐
    │ Authenticated│
    └──────────────┘
```

### Login Flow

```
Same as signup but:
- OTP purpose: "login" instead of "signup"
- Check if user already exists
- Don't create new user document
- Return existing user data
```

---

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── database.js          # MongoDB connection setup
│   │   ├── env.js               # Environment variables validation
│   │   └── constants.js         # App constants (OTP expires, limits, etc)
│   │
│   ├── models/
│   │   ├── User.js              # User schema and model
│   │   ├── Expense.js           # Expense schema and model
│   │   ├── Friend.js            # Friend schema and model
│   │   ├── DayCompletion.js     # Day completion schema and model
│   │   └── OtpToken.js          # OTP token schema and model
│   │
│   ├── controllers/
│   │   ├── authController.js    # Authentication logic
│   │   ├── expenseController.js # Expense CRUD and queries
│   │   ├── friendController.js  # Friend management
│   │   ├── analyticsController.js # Analytics calculations
│   │   └── dayController.js     # Day completion tracking
│   │
│   ├── routes/
│   │   ├── authRoutes.js        # Auth endpoints
│   │   ├── expenseRoutes.js     # Expense endpoints
│   │   ├── friendRoutes.js      # Friend endpoints
│   │   ├── analyticsRoutes.js   # Analytics endpoints
│   │   └── dayRoutes.js         # Day tracking endpoints
│   │
│   ├── middlewares/
│   │   ├── authMiddleware.js    # JWT verification
│   │   ├── errorHandler.js      # Error handling
│   │   ├── validation.js        # Request validation with Joi
│   │   └── corsMiddleware.js    # CORS configuration
│   │
│   ├── services/
│   │   ├── authService.js       # OTP sending (Twilio/SendGrid)
│   │   ├── expenseService.js    # Business logic for expenses
│   │   ├── friendService.js     # Business logic for friends
│   │   └── analyticsService.js  # Complex analytics queries
│   │
│   ├── utils/
│   │   ├── dateUtils.js         # Date manipulation helpers
│   │   ├── tokenUtils.js        # JWT creation/verification
│   │   ├── hashUtils.js         # Hashing and encryption
│   │   └── logger.js            # Logging utility
│   │
│   └── app.js                   # Express app setup
│
├── .env                         # Environment variables (DO NOT COMMIT)
├── .env.example                 # Example env file (commit this)
├── package.json                 # Dependencies
├── server.js                    # Entry point
└── README.md                    # Setup instructions
```

---

## Setup & Installation

### Step 1: Initialize Node Project

```bash
cd backend
npm init -y
```

### Step 2: Install Dependencies

```bash
npm install express mongoose jsonwebtoken bcryptjs joi cors dotenv axios
npm install --save-dev nodemon
```

### Step 3: Create .env File

```env
# Server
NODE_ENV=development
PORT=5000
HOST=localhost

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/spend-db

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_REFRESH_SECRET=your_super_secret_refresh_key
JWT_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# OTP Service (Twilio or SendGrid)
OTP_SERVICE=twilio  # or 'sendgrid'

# Twilio
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_FROM_NUMBER=+1234567890

# SendGrid
SENDGRID_API_KEY=your_sendgrid_api_key
SENDGRID_FROM_EMAIL=noreply@spendapp.com

# OTP Settings
OTP_LENGTH=6
OTP_EXPIRY=600  # 10 minutes in seconds
OTP_MAX_ATTEMPTS=5
```

### Step 4: Setup package.json Scripts

```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "jest",
    "lint": "eslint src"
  }
}
```

### Step 5: Create MongoDB Atlas Cluster

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create account or login
3. Create new project: "Spend-App"
4. Create database cluster (Free tier available)
5. Get connection string
6. Add it to .env as MONGODB_URI

### Step 6: Start Backend Server

```bash
npm run dev
```

Server should run on `http://localhost:5000`

---

## Implementation Checklist

### Phase 1: Core Setup
- [ ] Initialize Node project with Express
- [ ] Setup MongoDB connection with Mongoose
- [ ] Create all database schemas and models
- [ ] Setup environment variables and configuration
- [ ] Create basic error handling and logging

### Phase 2: Authentication
- [ ] Implement OTP generation and sending (via email)
- [ ] Create `/auth/send-otp` endpoint
- [ ] Create `/auth/verify-otp` endpoint
- [ ] Implement JWT token generation
- [ ] Create `/auth/refresh-token` endpoint
- [ ] Create `/auth/logout` endpoint
- [ ] Add JWT verification middleware

### Phase 3: Expense Management
- [ ] Create Expense model with validation
- [ ] Implement expense CRUD endpoints
- [ ] Add date-based filtering
- [ ] Add category-based filtering
- [ ] Implement expense aggregation for analytics

### Phase 4: Friend Management
- [ ] Create Friend model
- [ ] Implement friend CRUD endpoints
- [ ] Add friend search functionality
- [ ] Calculate balance calculations between friends

### Phase 5: Split Expense Management
- [ ] Implement split creation logic
- [ ] Create payment settlement endpoints
- [ ] Add balance calculations
- [ ] Implement settle-all functionality

### Phase 6: Analytics
- [ ] Implement category breakdown queries
- [ ] Create spending trend calculations
- [ ] Implement friend-wise balance reports
- [ ] Add top expenses queries

### Phase 7: Day Tracking & Notifications
- [ ] Create day completion endpoints
- [ ] Implement incomplete day tracking
- [ ] Create notification endpoints

### Phase 8: Testing & Deployment
- [ ] Write unit tests for controllers
- [ ] Write integration tests for API endpoints
- [ ] Test with frontend application
- [ ] Deploy to production (Heroku/Railway/Render)

---

## Example Usage

### 1. Signup
```bash
# Send OTP
curl -X POST http://localhost:5000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","type":"signup"}'

# Verify OTP (check email for 6-digit code)
curl -X POST http://localhost:5000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","otp":"123456","name":"John Doe"}'
```

### 2. Create Expense
```bash
curl -X POST http://localhost:5000/api/expenses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "amount": 1200,
    "reason": "Team Lunch",
    "date": "2026-05-18",
    "type": "split",
    "splits": [
      {
        "friendId": "friend_id_1",
        "friendName": "Arjun",
        "amount": 600,
        "direction": "theyOwe"
      }
    ]
  }'
```

### 3. Get Analytics
```bash
curl -X GET 'http://localhost:5000/api/analytics/breakdown?dateFrom=2026-05-01&dateTo=2026-05-31' \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## Security Considerations

1. **JWT Tokens**: Store securely, use short expiry times
2. **OTP**: Hash before storing, implement rate limiting
3. **Password Hashing**: Use bcryptjs for sensitive data
4. **CORS**: Whitelist only frontend URLs
5. **Environment Variables**: Never commit .env file
6. **Database**: Enable authentication and IP whitelisting on MongoDB Atlas
7. **Rate Limiting**: Implement rate limiting on auth endpoints
8. **Input Validation**: Validate all user inputs with Joi
9. **HTTPS**: Use SSL/TLS in production

---

## Common Issues & Solutions

### MongoDB Connection Error
- Verify MongoDB URI in .env
- Check IP whitelist on MongoDB Atlas
- Ensure MongoDB network access is enabled

### OTP Not Sending
- Verify Twilio/SendGrid credentials
- Check API keys in .env
- Check email service logs

### CORS Errors
- Add frontend URL to CORS whitelist
- Check frontend making requests to correct domain/port

### JWT Token Expired
- Client should use refresh token to get new access token
- Implement token refresh logic on frontend

---

## Next Steps

1. Setup MongoDB Atlas cluster
2. Start implementing Phase 1 & 2
3. Test authentication flow with frontend
4. Gradually implement remaining phases
5. Deploy to production when ready

---

**Created**: May 18, 2026  
**Last Updated**: May 18, 2026  
**Version**: 1.0
