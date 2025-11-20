# API Migration Plan - Swagger v2.0

## Overview
The API has been restructured with role-based authentication and new features. This document outlines the migration plan.

## Key Changes

### 1. **Authentication Endpoints - Role-Based**

**OLD (Generic):**
- `/auth/login`
- `/auth/register`
- `/auth/reset-password-request`
- `/auth/reset-password`
- `/auth/send-otp`
- `/auth/verify-otp`

**NEW (Role-Specific):**
- `/auth/user/login` - User login
- `/auth/user/register` - User registration
- `/auth/user/reset-password` - User password reset
- `/auth/user/reset-password-request` - Request reset OTP
- `/auth/user/send-otp` - Send OTP
- `/auth/user/verify-otp` - Verify OTP
- `/auth/user/set-password` - Set password after OTP

Similar endpoints for:
- `/auth/organizer/*` - Organizer flows
- `/auth/admin/*` - Admin flows

### 2. **OTP Flow Changes**

**OLD:**
```json
{
  "identifier": "user@example.com",
  "otp_type": "registration"
}
```

**NEW:**
```json
{
  "identifier": "user@example.com",
  "otp_type": "registration",
  "role": "user"  // NEW: Required field
}
```

### 3. **Password Reset Flow**

**OLD:**
```json
{
  "reset_token": "token",
  "email_token": "email",
  "new_password": "pass",
  "confirm_password": "pass"
}
```

**NEW:**
```json
{
  "otp": "123456",           // Changed from reset_token
  "email_token": "email",
  "new_password": "pass",
  "confirm_password": "pass",
  "role": "user"            // NEW: Required field
}
```

### 4. **New Public Event Endpoints**

- `GET /public/events` - All approved events (paginated)
- `GET /public/events/{id}` - Event details
- `GET /public/events/featured` - Featured events (top 3)
- `GET /public/events/upcoming` - Upcoming events
- `GET /public/events/search?q=query` - Search events
- `GET /public/events/category/{category}` - Events by category
- `GET /public/categories` - All active categories
- `GET /public/company-info` - Company information

### 5. **User Ticket Endpoints**

- `GET /user/tickets` - Get user's tickets (paginated)
- `GET /user/tickets/stats` - Ticket statistics
- `GET /user/tickets/{id}` - Specific ticket details
- `GET /user/tickets/{id}/qr` - Ticket QR code
- `GET /user/events/{event_id}/tickets` - Tickets for specific event

### 6. **New Features**

#### Categories
- `GET /public/categories` - Public categories
- `GET /admin/categories` - Admin categories (including inactive)
- `POST /admin/categories` - Create category
- `PUT /admin/categories/{id}` - Update category
- `DELETE /admin/categories/{id}` - Delete category

#### Company Info
- `GET /public/company-info` - Public company info
- `GET /admin/company-info` - Admin company info
- `PUT /admin/company-info` - Update company info

#### Organizations (Organizer feature)
- `POST /admin/organizations` - Create organization
- `PUT /admin/organizations/{id}` - Update organization
- `DELETE /admin/organizations/{id}` - Delete organization
- `GET /organizer/organizations/{id}/users` - Get org users
- `POST /organizer/organizations/{id}/users` - Add user to org
- `PUT /organizer/organizations/{id}/users/{userId}` - Update org user
- `DELETE /organizer/organizations/{id}/users/{userId}` - Remove org user

#### Event Tiers (Pricing tiers)
- `POST /organizer/events/{id}/tiers` - Create tier
- `PUT /organizer/tiers/{tierID}` - Update tier
- `DELETE /organizer/tiers/{tierID}` - Delete tier

#### Payouts
- `GET /organizer/payout-requests` - Get organizer payouts
- `POST /organizer/payout-requests` - Request payout
- `GET /organizer/payout-summary` - Payout summary
- `GET /admin/payout-requests` - Admin: All payouts
- `PUT /admin/payout-requests/{id}` - Admin: Update payout status

## Migration Checklist

### Phase 1: Core Authentication (Priority: HIGH)
- [ ] Update authService.ts with role-based endpoints
- [ ] Update login to use `/auth/user/login`
- [ ] Update register to use `/auth/user/register`
- [ ] Update OTP flow to include `role` parameter
- [ ] Update password reset to use new OTP-based flow
- [ ] Update set-password endpoint for registration completion
- [ ] Update auth types for new request/response structures

### Phase 2: Public Events (Priority: HIGH)
- [ ] Create eventService.ts for public event endpoints
- [ ] Implement `/public/events` with pagination
- [ ] Implement `/public/events/{id}` for event details
- [ ] Implement `/public/events/featured`
- [ ] Implement `/public/events/upcoming`
- [ ] Implement `/public/events/search`
- [ ] Implement `/public/events/category/{category}`
- [ ] Update event types for new response structure

### Phase 3: User Tickets (Priority: HIGH)
- [ ] Update ticketService.ts with real API endpoints
- [ ] Implement `/user/tickets` (replace mock)
- [ ] Implement `/user/tickets/stats`
- [ ] Implement `/user/tickets/{id}`
- [ ] Implement `/user/tickets/{id}/qr`
- [ ] Update ticket types for API response structure

### Phase 4: Categories & Company Info (Priority: MEDIUM)
- [ ] Create categoryService.ts
- [ ] Implement `/public/categories`
- [ ] Create companyInfoService.ts
- [ ] Implement `/public/company-info`
- [ ] Update UI to display categories
- [ ] Update footer with company info

### Phase 5: Organizer Features (Priority: MEDIUM)
- [ ] Create organizerService.ts
- [ ] Implement organizer event CRUD
- [ ] Implement event tiers management
- [ ] Implement event analytics
- [ ] Implement ticket check-in/out
- [ ] Implement payout requests
- [ ] Create organizer dashboard pages

### Phase 6: Admin Features (Priority: LOW)
- [ ] Create adminService.ts
- [ ] Implement admin user management
- [ ] Implement event approval workflow
- [ ] Implement category management
- [ ] Implement payout management
- [ ] Create admin dashboard pages

## Breaking Changes

### 1. **Auth Endpoints**
```typescript
// OLD
await api.post('/auth/login', credentials)

// NEW
await api.post('/auth/user/login', credentials)
```

### 2. **OTP Requests**
```typescript
// OLD
{ identifier: "email", otp_type: "registration" }

// NEW  
{ identifier: "email", otp_type: "registration", role: "user" }
```

### 3. **Password Reset**
```typescript
// OLD
{ reset_token: "token", email_token: "email", ... }

// NEW
{ otp: "123456", email_token: "email", role: "user", ... }
```

### 4. **Event Structure**
Events now support:
- Multiple pricing tiers (not just single price)
- Categories array (not single category)
- New statuses: draft, pending, approved, held, rejected
- Sales status: active, paused, stopped
- Featured flag
- Commission rate

## Response Structure

All API responses follow this format:
```json
{
  "success": true,
  "message": "Success message",
  "data": {...},
  "timestamp": "2024-...",
  "request_id": "uuid",
  "error": {
    "code": "ERROR_CODE",
    "details": "Error details",
    "fields": {...}
  }
}
```

## Next Steps

1. Start with Phase 1 (Auth) - Most critical
2. Then Phase 2 (Public Events) - User-facing
3. Then Phase 3 (User Tickets) - Core functionality
4. Phases 4-6 can be done in parallel

## Testing Strategy

1. Create test file for each service
2. Test with actual API sandbox
3. Verify error handling
4. Verify toast integration
5. Test pagination
6. Test filters and search
