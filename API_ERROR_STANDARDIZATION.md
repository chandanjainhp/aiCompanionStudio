# 🔴 API Error Response Standardization

## Standard Response Format

All API errors now follow a **single consistent format**:

```json
{
  "success": false,
  "message": "Human-readable error message",
  "errorCode": "ERROR_CATEGORY_###"
}
```

**HTTP Status Code:** Preserved in response header (400, 401, 404, 500, etc.)

---

## Examples

### 400 Bad Request
```json
{
  "success": false,
  "message": "At least one field is required",
  "errorCode": "VAL_001"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "User not authenticated",
  "errorCode": "AUTH_002"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "User not found",
  "errorCode": "RES_001"
}
```

### 409 Conflict (Duplicate)
```json
{
  "success": false,
  "message": "email already exists",
  "errorCode": "RES_003"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal Server Error",
  "errorCode": "SRV_001"
}
```

---

## Error Code Categories

| Category | Range | Example Codes |
|----------|-------|---|
| **Authentication** | AUTH_001-005 | AUTH_002 = Invalid/expired token |
| **Validation** | VAL_001-004 | VAL_001 = Invalid input |
| **Resource** | RES_001-003 | RES_001 = Not found, RES_003 = Conflict |
| **Server** | SRV_001+ | SRV_001 = Internal error |
| **Rate Limit** | RATE_001+ | RATE_001 = Too many requests |

**Full list:** See `server/src/constants/errorCodes.js`

---

## How to Use in Controllers

### ✅ CORRECT - Using StandardizedError Classes

```javascript
import { 
  BadRequestError,
  UnauthorizedError, 
  NotFoundError,
  ConflictError 
} from '../utils/errors.js';

// Validation error
if (!name) {
  throw new BadRequestError('Name is required');
}

// Authentication error
if (!userId) {
  throw new UnauthorizedError('User not authenticated');
}

// Resource not found
const user = await prisma.user.findUnique({ where: { id } });
if (!user) {
  throw new NotFoundError('User');
}

// Duplicate conflict
if (existingUser) {
  throw new ConflictError('Email already registered');
}
```

### ❌ WRONG - Do NOT use ApiError

```javascript
// ❌ OLD - Don't use this anymore
throw new ApiError(400, 'Name is required');

// ❌ WRONG - Missing errorCode
res.status(400).json({ 
  success: false, 
  message: 'Invalid input' 
});

// ❌ WRONG - Non-standard format
throw new Error('Something went wrong');
```

---

## Available Error Classes

```javascript
// src/utils/errors.js

// Generic - used for custom scenarios
new AppError(message, statusCode, errorCode, details)

// Specific - recommended for most cases
new BadRequestError(message)           // 400, VAL_001
new UnauthorizedError(message)         // 401, AUTH_002
new ForbiddenError(message)            // 403, AUTH_004
new NotFoundError(resourceName)        // 404, RES_001
new ConflictError(message)             // 409, RES_003
new ValidationError(message, errors)   // 422, VAL_001
new RateLimitError(message)            // 429, RATE_001
new InternalServerError(message)       // 500, SRV_001
```

---

## Error Handler Middleware

**File:** `server/src/middlewares/error-handler.js`

The error handler is **automatically invoked** when you `throw` an error in a controller:

```javascript
// Middleware processes error and sends standardized response
export const errorHandler = (error, req, res, next) => {
  // 1. Extract error details
  let statusCode = error.statusCode || 500;
  let message = error.message || 'Internal Server Error';
  let errorCode = error.errorCode || 'SRV_001';
  
  // 2. Map Prisma errors to standard codes
  if (error.code === 'P2002') {
    statusCode = 409;
    errorCode = 'RES_003'; // Conflict
  }
  
  // 3. Log error (development shows full stack, production shows summary)
  // 4. Send standardized response
  res.status(statusCode).json({
    success: false,
    message,
    errorCode,
  });
};
```

**Key Points:**
- ✅ HTTP status code is preserved in response header
- ✅ Error code identifies the type of error programmatically
- ✅ Message is human-readable for users
- ✅ Stack trace logged to server, not sent to client
- ✅ Development mode shows full error details, production shows summary

---

## Before & After Comparison

### Before (Inconsistent)
```javascript
// user.controller.js
throw new ApiError(401, 'User not authenticated');

// chat.controller.js  
throw new BadRequestError('Invalid input');

// Response 1: { success: false, message: '...' }
// Response 2: { success: false, message: '...', error: { code: 'VAL_001' } }
```

### After (Consistent)
```javascript
// user.controller.js
throw new UnauthorizedError('User not authenticated');

// chat.controller.js
throw new BadRequestError('Invalid input');

// Response 1: { success: false, message: '...', errorCode: 'AUTH_002' }
// Response 2: { success: false, message: '...', errorCode: 'VAL_001' }
```

---

## Frontend Integration

### Parse Errors Reliably

```typescript
// Frontend code (TypeScript)
try {
  const response = await fetch('/api/v1/projects', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  const data = await response.json();
  
  if (!data.success) {
    // Now you can reliably check error code
    switch (data.errorCode) {
      case 'AUTH_002': // Token expired
        navigateTo('/login');
        break;
      case 'VAL_001': // Validation error
        showFieldErrors(data.message);
        break;
      case 'RES_001': // Not found
        navigate('/not-found');
        break;
      default:
        showGenericError(data.message);
    }
  }
} catch (error) {
  console.error('Request failed:', error);
}
```

---

## Controller Migration Guide

### Step 1: Update Imports
```javascript
// ❌ OLD
import { ApiError } from '../utils/ApiError.js';

// ✅ NEW
import { 
  BadRequestError,
  UnauthorizedError,
  NotFoundError,
  ConflictError 
} from '../utils/errors.js';
```

### Step 2: Replace Error Throws

| Old Pattern | New Pattern |
|---|---|
| `throw new ApiError(400, msg)` | `throw new BadRequestError(msg)` |
| `throw new ApiError(401, msg)` | `throw new UnauthorizedError(msg)` |
| `throw new ApiError(404, msg)` | `throw new NotFoundError(resource)` |
| `throw new ApiError(409, msg)` | `throw new ConflictError(msg)` |

### Step 3: Test
1. Run controller function
2. Check response includes `errorCode`
3. Verify HTTP status code in response headers

---

## Rules to Follow

### ✅ DO

- ✅ Always throw error objects, never string messages
- ✅ Use specific error classes (UnauthorizedError, BadRequestError, etc.)
- ✅ Provide helpful, user-friendly error messages
- ✅ Include error codes for programmatic error handling
- ✅ Let error handler middleware format the response

### ❌ DON'T

- ❌ Create custom response formats in controllers
- ❌ Send errors without proper HTTP status codes
- ❌ Return errors as `{ error: {...} }` at top level
- ❌ Expose sensitive details (stack traces, SQL queries) to frontend
- ❌ Use generic "Something went wrong" messages
- ❌ Bypass the error handler by catching and responding in controller

---

## Testing Errors

### Manual Test
```bash
# Test 404 error
curl -X GET http://localhost:3000/api/v1/users/nonexistent \
  -H "Authorization: Bearer YOUR_TOKEN"

# Expected response:
# {
#   "success": false,
#   "message": "User not found",
#   "errorCode": "RES_001"
# }
```

### Verify in DevTools
1. Open browser DevTools (F12)
2. Go to Network tab
3. Make API request that fails
4. Click on request
5. Check Response tab
6. Verify: `{ success: false, message: '...', errorCode: '...' }`

---

## Migration Status

| File | Status | Notes |
|------|--------|-------|
| `error-handler.js` | ✅ Updated | Enforces standard format |
| `errors.js` | ✅ Ready | All error classes defined |
| `errorCodes.js` | ✅ Ready | Comprehensive error catalog |
| `user.controller.js` | ✅ Updated | Example of proper usage |
| `chat.controller.js` | ⏳ Pending | Use BadRequestError, NotFoundError |
| `project.controller.js` | ⏳ Pending | Use ForbiddenError, ConflictError |
| Other controllers | ⏳ Pending | Follow same pattern |

---

## Troubleshooting

### Frontend still seeing inconsistent errors
**Cause:** Some controllers still use old ApiError  
**Fix:** Run migration on remaining controller files

### Error handler not catching errors
**Cause:** Error not thrown properly, or caught before reaching handler  
**Fix:** Ensure:
1. You `throw` the error (don't return it)
2. Controller is wrapped with `asyncHandler`
3. Error handler is registered as LAST middleware

### Error code is missing from response
**Cause:** Error thrown without proper error class  
**Fix:** Replace `throw new Error()` with `throw new BadRequestError()`

---

## Success Response Format (For Reference)

While this guide focuses on errors, note that success responses follow a different format:

```json
{
  "success": true,
  "data": { /* actual data */ },
  "message": "Success message"
}
```

**Key difference:**
- Errors: `{ success: false, message, errorCode }`
- Success: `{ success: true, data, message }`

Error responses do NOT include `data` field.

