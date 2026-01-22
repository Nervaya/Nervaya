# Authentication & Authorization Flow Documentation

## Overview
This document describes the complete authentication and authorization flow in the Nervaya application.

## Authentication Flow

### 1. User Registration (Signup)

```
User → Frontend (Signup Form)
  ↓
POST /api/auth/signup
  ↓
Rate Limiting Check (3 attempts/hour per IP)
  ↓
Input Validation & Sanitization
  ↓
Password Validation (strength requirements)
  ↓
Email Validation
  ↓
Check if user exists
  ↓
Hash Password (bcrypt, 10 rounds)
  ↓
Create User in Database
  ↓
Generate JWT Token
  ↓
Set HttpOnly Cookie (server-side)
  ↓
Return User Data (without password)
```

**Key Security Features:**
- Rate limiting prevents abuse
- Strong password requirements enforced
- Password hashed before storage
- Role manipulation prevented (users can't set themselves as ADMIN)
- Secure cookie set server-side

### 2. User Login

```
User → Frontend (Login Form)
  ↓
POST /api/auth/login
  ↓
Rate Limiting Check (5 attempts/15min per IP)
  ↓
Input Validation & Sanitization
  ↓
Find User by Email (with password field)
  ↓
Compare Password (bcrypt)
  ↓
Generate JWT Token
  ↓
Set HttpOnly Cookie (server-side)
  ↓
Return User Data (without password)
```

**Key Security Features:**
- Rate limiting prevents brute force attacks
- Generic error messages prevent user enumeration
- Password comparison always runs (consistent timing)
- Secure cookie set server-side

### 3. Token Structure

```typescript
JWT Payload:
{
  userId: string,    // User's MongoDB _id
  role: Role,        // 'ADMIN' or 'CUSTOMER'
  exp: number        // Expiration timestamp
}
```

**Token Configuration:**
- Algorithm: HS256
- Expiration: 7 days (configurable via JWT_EXPIRES_IN)
- Secret: From JWT_SECRET environment variable

### 4. Cookie Configuration

```typescript
{
  httpOnly: true,           // Prevents JavaScript access (XSS protection)
  secure: true,             // HTTPS only in production
  sameSite: 'strict',       // CSRF protection
  path: '/',                // Available site-wide
  maxAge: 604800            // 7 days in seconds
}
```

## Authorization Flow

### 1. Route Protection (Middleware)

```
Request → Next.js Middleware
  ↓
Check if route is protected
  ↓
Extract token from cookie
  ↓
Verify token (JWT verification)
  ↓
Check user role
  ↓
Allow/Deny access
  ↓
Add security headers
```

**Protected Routes:**
- `/dashboard` - Requires authentication
- `/account` - Requires authentication
- `/admin/*` - Requires ADMIN role

**Auth Routes (redirect if authenticated):**
- `/login` - Redirects to home if already logged in
- `/signup` - Redirects to home if already logged in

### 2. API Route Protection

```
API Request → API Route Handler
  ↓
requireAuth() middleware
  ↓
Extract token from cookie
  ↓
Verify token
  ↓
Check role (if required)
  ↓
Attach user to request
  ↓
Execute route handler
```

**Protected API Endpoints:**
- `POST /api/therapists` - Requires ADMIN
- `PUT /api/therapists/[id]` - Requires ADMIN
- `DELETE /api/therapists/[id]` - Requires ADMIN
- `POST /api/upload` - Requires authentication

**Public API Endpoints:**
- `GET /api/therapists` - Public (anyone can view)
- `GET /api/therapists/[id]` - Public (anyone can view)
- `GET /api/navigation` - Public (role-based menu)

### 3. Role-Based Access Control (RBAC)

**Roles:**
- `CUSTOMER` - Default role for regular users
- `ADMIN` - Administrative access

**Access Matrix:**

| Endpoint | CUSTOMER | ADMIN |
|----------|----------|-------|
| GET /api/therapists | ✅ | ✅ |
| POST /api/therapists | ❌ | ✅ |
| PUT /api/therapists/[id] | ❌ | ✅ |
| DELETE /api/therapists/[id] | ❌ | ✅ |
| POST /api/upload | ✅ | ✅ |
| /admin/* | ❌ | ✅ |

## Security Layers

### Layer 1: Input Validation
- Type checking
- Format validation (email, password)
- Sanitization (trim, lowercase)
- Size limits

### Layer 2: Authentication
- JWT token verification
- Cookie validation
- Token expiration check

### Layer 3: Authorization
- Role verification
- Route protection
- API endpoint protection

### Layer 4: Rate Limiting
- Login attempts: 5 per 15 minutes
- Signup attempts: 3 per hour
- IP-based tracking

### Layer 5: Security Headers
- X-Content-Type-Options
- X-Frame-Options
- X-XSS-Protection
- Referrer-Policy
- Strict-Transport-Security (production)

## Error Handling

### Authentication Errors
- **401 Unauthorized**: Invalid or missing token
- **403 Forbidden**: Insufficient permissions
- **429 Too Many Requests**: Rate limit exceeded

### Error Messages
- Generic messages prevent information disclosure
- "Invalid email or password" for both invalid email and wrong password
- No user enumeration possible

## Logout Flow

```
User → Frontend (Logout Button)
  ↓
POST /api/auth/logout
  ↓
Clear HttpOnly Cookie (server-side)
  ↓
Return success response
  ↓
Dispatch auth-state-changed event
  ↓
Redirect to login page
```

## Token Refresh

**Current Implementation:**
- Tokens expire after 7 days
- No refresh token mechanism
- Users must re-login after expiration

**Recommended Enhancement:**
- Implement refresh tokens
- Short-lived access tokens (15-30 min)
- Long-lived refresh tokens (7-30 days)
- Token rotation on refresh

## Security Best Practices Implemented

✅ **Password Security**
- Bcrypt hashing (10 salt rounds)
- Strong password requirements
- Password field excluded from queries

✅ **Token Security**
- JWT with expiration
- Secure secret management
- HttpOnly cookies

✅ **Input Security**
- Validation and sanitization
- Type checking
- Size limits

✅ **Rate Limiting**
- Prevents brute force attacks
- IP-based tracking
- Configurable limits

✅ **Error Handling**
- Generic error messages
- No information disclosure
- Proper status codes

✅ **Headers Security**
- XSS protection
- Clickjacking protection
- MIME sniffing protection
- HSTS for production

## Common Security Scenarios

### Scenario 1: Unauthenticated Access Attempt
```
User tries to access /admin/dashboard
  ↓
Middleware checks for token
  ↓
No token found
  ↓
Redirect to /login
```

### Scenario 2: Invalid Token
```
User has expired/invalid token
  ↓
Middleware verifies token
  ↓
Token verification fails
  ↓
Clear invalid cookie
  ↓
Redirect to /login
```

### Scenario 3: Insufficient Permissions
```
CUSTOMER tries to POST /api/therapists
  ↓
API route checks authentication
  ↓
User authenticated but not ADMIN
  ↓
Return 403 Forbidden
```

### Scenario 4: Brute Force Attack
```
Attacker tries multiple login attempts
  ↓
Rate limiter tracks attempts
  ↓
After 5 failed attempts
  ↓
Return 429 Too Many Requests
  ↓
Block for 15 minutes
```

## Testing the Flow

### Manual Testing Steps

1. **Test Signup:**
   ```bash
   POST /api/auth/signup
   Body: { email, password, name }
   Expected: 201, cookie set, user data returned
   ```

2. **Test Login:**
   ```bash
   POST /api/auth/login
   Body: { email, password }
   Expected: 200, cookie set, user data returned
   ```

3. **Test Protected Route:**
   ```bash
   GET /dashboard (without cookie)
   Expected: Redirect to /login
   ```

4. **Test Admin Route:**
   ```bash
   GET /admin/dashboard (as CUSTOMER)
   Expected: Redirect to /dashboard
   ```

5. **Test API Protection:**
   ```bash
   POST /api/therapists (without auth)
   Expected: 401 Unauthorized
   ```

6. **Test Rate Limiting:**
   ```bash
   POST /api/auth/login (5 times with wrong password)
   Expected: 429 on 6th attempt
   ```

---

**Last Updated:** $(date)  
**Version:** 1.0
