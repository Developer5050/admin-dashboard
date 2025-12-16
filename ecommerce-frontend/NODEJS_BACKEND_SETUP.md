# Node.js Backend Setup Guide - Signup & Login

## Overview (Jumla)

Yeh guide aapko step-by-step batayega ke kaise aap apne ecommerce admin panel ke liye Node.js backend bana sakte hain MongoDB aur JWT authentication ke saath. Is guide mein hum Signup aur Login functionality implement karenge.

---

## Prerequisites (Pehle se Zaroori)

Aapke system mein yeh cheezein honi chahiye:
- Node.js (v18 ya usse zyada)
- npm ya yarn package manager
- MongoDB (local ya MongoDB Atlas cloud)
- Code editor (VS Code recommended)
- Postman ya Thunder Client (API testing ke liye)

---

## Step 1: Project Setup (Project Ki Shuruaat)

### 1.1 New Folder Banana

1. Apne system mein ek naya folder banayein, jaise:
   ```
   ecommerce-backend
   ```

2. Terminal/Command Prompt khol kar us folder mein jayein:
   ```bash
   cd ecommerce-backend
   ```

### 1.2 Node.js Project Initialize Karna

1. Terminal mein yeh command run karein:
   ```bash
   npm init -y
   ```
   Ye aapke liye `package.json` file banayega.

2. Ab `package.json` file khol kar manually yeh fields update karein:
   - `"name": "ecommerce-backend"`
   - `"version": "1.0.0"`
   - `"description": "Ecommerce Admin Backend API"`
   - `"main": "server.js"` ya `"index.js"`

### 1.3 Required Dependencies Install Karna

Terminal mein yeh sab dependencies install karein:

```bash
npm install express mongoose jsonwebtoken bcryptjs dotenv cors cookie-parser
```

**Dependencies ka kaam:**
- `express` - Web server framework
- `mongoose` - MongoDB ke liye ODM (Object Data Modeling)
- `jsonwebtoken` - JWT tokens generate/verify karne ke liye
- `bcryptjs` - Password hashing ke liye
- `dotenv` - Environment variables manage karne ke liye
- `cors` - Cross-Origin Resource Sharing enable karne ke liye
- `cookie-parser` - Cookies parse karne ke liye

### 1.4 Dev Dependencies Install Karna

Development ke liye yeh install karein:

```bash
npm install --save-dev nodemon
```

`nodemon` automatically server restart karta hai jab aap code change karte hain.

### 1.5 Project Structure Banana

Apni project ki structure aise banayein:

```
ecommerce-backend/
├── server.js              (Main server file)
├── .env                   (Environment variables)
├── .gitignore
├── package.json
├── config/
│   └── db.js             (MongoDB connection)
├── models/
│   └── User.js           (User schema/model)
├── routes/
│   └── authRoutes.js     (Authentication routes)
├── controllers/
│   └── authController.js (Business logic)
├── middleware/
│   └── authMiddleware.js (JWT verification)
└── utils/
    └── generateToken.js  (JWT token generation)
```

---

## Step 2: Environment Variables Setup (.env File)

### 2.1 .env File Banana

Project root mein `.env` naam ki file banayein aur yeh variables add karein:

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ecommerce-admin
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random
JWT_EXPIRE=7d
NODE_ENV=development
```

**Important Notes:**
- `MONGODB_URI`: Agar aap MongoDB Atlas use kar rahe hain to wahan se connection string copy karein
- `JWT_SECRET`: Koi bhi random, long string use karein (minimum 32 characters)
- `JWT_EXPIRE`: Token kitne din tak valid rahega (e.g., "7d", "24h", "30d")

### 2.2 .gitignore File Banana

`.gitignore` file banayein taake sensitive files git mein na jayein:

```
node_modules/
.env
.DS_Store
*.log
```

---

## Step 3: MongoDB Connection Setup

### 3.1 MongoDB Local Install Karna (Optional)

Agar aap local MongoDB use karna chahte hain:
1. MongoDB official website se download karein
2. Install karein
3. MongoDB service start karein

### 3.2 MongoDB Atlas Setup (Recommended)

Cloud MongoDB ke liye:
1. [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) pe account banayein
2. Free cluster create karein
3. Database Access mein user banayein (username aur password)
4. Network Access mein IP address add karein (0.0.0.0/0 for all IPs - development ke liye)
5. Connect button pe click karein aur "Connect your application" choose karein
6. Connection string copy karein aur `.env` file mein `MONGODB_URI` mein paste karein

### 3.3 Database Connection Code

`config/db.js` file mein MongoDB connection code likhna hoga. Yeh file database se connect karegi.

---

## Step 4: User Model/Schema Banana

### 4.1 User Schema Design

User model mein yeh fields hone chahiye:
- `name` (String, required)
- `email` (String, required, unique)
- `password` (String, required, hashed)
- `role` (String, default: "staff")
- `image_url` (String, optional)
- `created_at` (Date, default: current date)
- `updated_at` (Date)

### 4.2 Model File

`models/User.js` file mein Mongoose schema define karna hoga.

**Important Points:**
- Password ko directly store nahi karna, pehle hash karna hai
- Email ko unique aur required banana hai
- Timestamps automatically add karne ke liye Mongoose options use karein

---

## Step 5: JWT Token Utilities

### 5.1 Token Generation Function

`utils/generateToken.js` file mein function banana hoga jo:
- User ID ko token mein embed kare
- JWT_SECRET use kare
- Expiration time set kare
- Token return kare

### 5.2 Token Verification Middleware

`middleware/authMiddleware.js` file mein middleware banana hoga jo:
- Request se token extract kare (cookies ya headers se)
- Token ko verify kare
- Valid token pe user info attach kare
- Invalid token pe error return kare

---

## Step 6: Authentication Controllers

### 6.1 Signup Controller

`controllers/authController.js` mein `signup` function banana hoga jo:

1. **Validation:**
   - Email format check kare
   - Password strength check kare (minimum 6-8 characters)
   - Required fields check kare

2. **User Check:**
   - Database mein check kare ke email already exist to nahi karta
   - Agar exist karta hai to error return kare

3. **Password Hashing:**
   - Plain password ko bcrypt se hash kare
   - Hash kiya hua password store kare

4. **User Creation:**
   - New user database mein save kare
   - User create hone ke baad password field remove kare (response mein)

5. **Token Generation:**
   - JWT token generate kare
   - Token ko cookie mein set kare
   - User data aur success message return kare

### 6.2 Login Controller

`controllers/authController.js` mein `login` function banana hoga jo:

1. **Validation:**
   - Email aur password check kare

2. **User Find:**
   - Database mein email se user find kare
   - Agar user nahi mila to error return kare

3. **Password Verification:**
   - Database se stored hash password le
   - User ke diye gaye password ko bcrypt se compare kare
   - Agar match nahi kiya to error return kare

4. **Token Generation:**
   - Valid user pe JWT token generate kare
   - Token ko cookie mein set kare
   - User data (password ke bina) return kare

### 6.3 Get Current User

`controllers/authController.js` mein `getMe` function banana hoga jo:
- Middleware se user ID le
- Database se user find kare
- User data return kare (password ke bina)

### 6.4 Logout Controller

`controllers/authController.js` mein `logout` function banana hoga jo:
- Cookie se token remove kare
- Success message return kare

---

## Step 7: Authentication Routes

### 7.1 Routes File

`routes/authRoutes.js` file mein routes define karni hongi:

1. **POST /api/auth/signup**
   - Signup controller ko call kare

2. **POST /api/auth/login**
   - Login controller ko call kare

3. **GET /api/auth/me**
   - Auth middleware use kare
   - Get current user controller ko call kare

4. **POST /api/auth/logout**
   - Logout controller ko call kare

### 7.2 Route Protection

Protected routes (jaise `/api/auth/me`) ke liye:
- Auth middleware use karni hogi
- Middleware token verify karegi
- Valid token pe hi request aage jayegi

---

## Step 8: Main Server File

### 8.1 Server Setup

`server.js` file mein:

1. **Express App Initialize:**
   - Express app create karein
   - Middleware setup karein (body-parser, cors, cookie-parser)

2. **Database Connection:**
   - MongoDB connection function call karein
   - Connection success/failure handle karein

3. **Routes:**
   - Auth routes ko mount karein

4. **Error Handling:**
   - Global error handler middleware add karein

5. **Server Start:**
   - Port listen karein
   - Success message print karein

### 8.2 Middleware Configuration

- **CORS:** Frontend URL ko allow karein
- **Body Parser:** JSON aur URL-encoded data parse karein
- **Cookie Parser:** Cookies ko parse karein
- **Error Handler:** Centralized error handling

---

## Step 9: Error Handling

### 9.1 Error Types

Different types ke errors handle karein:

1. **Validation Errors:**
   - Missing fields
   - Invalid email format
   - Weak password

2. **Authentication Errors:**
   - Invalid credentials
   - Token missing
   - Token expired

3. **Database Errors:**
   - Duplicate email
   - Connection errors

### 9.2 Error Response Format

Consistent error response format use karein:
```json
{
  "success": false,
  "message": "Error message here",
  "errors": {
    "field": "Field specific error"
  }
}
```

---

## Step 10: Security Best Practices

### 10.1 Password Security

- Minimum 6-8 characters required
- Password ko hash karke store karein (never plain text)
- bcrypt salt rounds: minimum 10

### 10.2 JWT Security

- Strong JWT_SECRET use karein (minimum 32 characters)
- Token expiration time set karein (7 days recommended)
- Tokens ko httpOnly cookies mein store karein
- Secure flag use karein (production mein)

### 10.3 CORS Configuration

- Specific frontend URLs ko allow karein
- Credentials allow karein (cookies ke liye)

### 10.4 Rate Limiting (Optional)

- Login attempts limit karein
- express-rate-limit package use kar sakte hain

---

## Step 11: Integration with Next.js Frontend

### 11.1 Environment Variables (Frontend)

Next.js project mein `.env.local` file mein add karein:

```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### 11.2 API Calls Update

Frontend mein jo files update karni hongi:

1. **Signup Route:**
   - `src/app/(authentication)/auth/sign-up/route.ts`
   - Backend ke `/api/auth/signup` endpoint ko call karein

2. **Login Route:**
   - `src/app/(authentication)/auth/sign-in/route.ts`
   - Backend ke `/api/auth/login` endpoint ko call karein

3. **Get User:**
   - `src/contexts/UserContext.tsx`
   - Backend ke `/api/auth/me` endpoint ko call karein

4. **Logout Route:**
   - `src/app/(authentication)/auth/sign-out/route.ts`
   - Backend ke `/api/auth/logout` endpoint ko call karein

### 11.3 Cookie Handling

- Backend se cookies automatically set hongi
- Frontend se requests mein `credentials: 'include'` use karein
- Cookies automatically send hongi har request ke saath

### 11.4 Middleware Update

`src/middleware.ts` file mein:
- Backend API se session verify karein
- Valid session pe hi dashboard access allow karein

---

## Step 12: Testing

### 12.1 Postman/Thunder Client Setup

1. **Signup Test:**
   - POST request to `http://localhost:5000/api/auth/signup`
   - Body: `{ "name": "Test User", "email": "test@example.com", "password": "password123" }`
   - Check response aur cookies

2. **Login Test:**
   - POST request to `http://localhost:5000/api/auth/login`
   - Body: `{ "email": "test@example.com", "password": "password123" }`
   - Check response aur cookies

3. **Get Current User:**
   - GET request to `http://localhost:5000/api/auth/me`
   - Cookies include karein
   - Check user data

4. **Logout Test:**
   - POST request to `http://localhost:5000/api/auth/logout`
   - Check cookie removal

### 12.2 Frontend Testing

1. Signup page se new user banayein
2. Login page se login karein
3. Dashboard access check karein
4. Logout functionality test karein

---

## Step 13: Common Issues & Solutions

### 13.1 MongoDB Connection Error

**Problem:** "MongoServerError: connection refused"

**Solution:**
- MongoDB service check karein (local)
- MongoDB Atlas mein IP whitelist karein
- Connection string verify karein

### 13.2 JWT Token Error

**Problem:** "jwt malformed" ya "invalid token"

**Solution:**
- JWT_SECRET verify karein
- Token expiration check karein
- Cookie settings verify karein

### 13.3 CORS Error

**Problem:** "Access-Control-Allow-Origin" error

**Solution:**
- CORS middleware mein frontend URL add karein
- Credentials: true set karein

### 13.4 Password Hash Error

**Problem:** Password match nahi ho raha

**Solution:**
- bcrypt compare function properly use karein
- Hash rounds verify karein

---

## Step 14: Production Deployment

### 14.1 Environment Variables

Production mein:
- Strong JWT_SECRET use karein
- MongoDB Atlas production cluster use karein
- NODE_ENV=production set karein

### 14.2 Security Checklist

- [ ] JWT_SECRET strong hai
- [ ] Passwords hashed hain
- [ ] CORS properly configured hai
- [ ] Error messages detailed nahi hain (security ke liye)
- [ ] HTTPS enabled hai
- [ ] Rate limiting enabled hai

---

## Additional Resources

### Useful Packages (Optional)

- `express-validator` - Request validation ke liye
- `express-rate-limit` - Rate limiting ke liye
- `helmet` - Security headers ke liye
- `morgan` - Request logging ke liye

### Learning Resources

- Express.js Official Documentation
- MongoDB Mongoose Documentation
- JWT.io - JWT token testing
- bcryptjs Documentation

---

## Summary (Khulasa)

Is guide mein humne cover kiya:

1. ✅ Node.js project setup
2. ✅ MongoDB connection
3. ✅ User model creation
4. ✅ JWT authentication
5. ✅ Signup functionality
6. ✅ Login functionality
7. ✅ Protected routes
8. ✅ Frontend integration
9. ✅ Error handling
10. ✅ Security best practices

Ab aap apna backend implement kar sakte hain. Har step ko carefully follow karein aur code likhte waqt comments add karein taake baad mein samajh aaye.

**Good Luck! 🚀**

---

## Next Steps

Backend complete hone ke baad:
1. Products API endpoints
2. Categories API endpoints
3. Orders API endpoints
4. File upload functionality
5. Admin role management

---

*Note: Yeh guide step-by-step instructions deti hai. Har step ko carefully follow karein aur code implement karte waqt security best practices ko follow karein.*

