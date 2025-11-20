# API Toast Integration Guide

## Overview

The API client now includes automatic toast notifications for API responses, with built-in support for translations and customizable behavior.

## Features

✅ **Automatic error toasts** (enabled by default)
✅ **Optional success toasts** (opt-in)
✅ **Translation support** for API messages
✅ **Customizable messages** (override API response)
✅ **Detailed error info** in description
✅ **Network error handling**

## Configuration Options

```typescript
interface ApiRequestConfig {
  requiresAuth?: boolean;
  skipTokenRefresh?: boolean;
  showSuccessToast?: boolean;    // Default: false
  showErrorToast?: boolean;      // Default: true
  successMessage?: string;       // Override API response message
  errorMessage?: string;         // Override error message
  translateResponse?: boolean;   // Reserved for future translation of API messages
}
```

## Usage Examples

### 1. Silent API Call (Default)
No toasts shown:
```typescript
// Only errors shown (default behavior)
const data = await api.get('/tickets', { 
  requiresAuth: true 
});
```

### 2. Show Success Toast with API Message
```typescript
// Shows success toast with message from API response
await api.post('/payment-methods', paymentData, {
  requiresAuth: true,
  showSuccessToast: true,  // ✅ Shows API response message
});
```

### 3. Custom Success Message
```typescript
// Override API message with custom message
await api.put('/profile', profileData, {
  requiresAuth: true,
  showSuccessToast: true,
  successMessage: 'Profile updated successfully!',
});
```

### 4. Disable Error Toasts (Manual Handling)
```typescript
// No automatic error toast - handle manually
try {
  await api.delete('/ticket/123', {
    requiresAuth: true,
    showErrorToast: false,  // ❌ Disabled
  });
} catch (error) {
  // Handle error manually with custom logic
  if (error instanceof AuthError) {
    showCustomErrorDialog(error.message);
  }
}
```

### 5. Custom Error Message
```typescript
// Override API error with custom message
await api.post('/transfer-ticket', transferData, {
  requiresAuth: true,
  errorMessage: 'Failed to transfer ticket. Please try again.',
});
```

### 6. Full Configuration
```typescript
await api.post('/purchase-ticket', ticketData, {
  requiresAuth: true,
  showSuccessToast: true,
  showErrorToast: true,
  successMessage: 'Ticket purchased successfully!',
  errorMessage: 'Purchase failed. Please check your payment method.',
});
```

## How It Works

### Success Flow
1. API returns 200-299 status
2. If `showSuccessToast: true`:
   - Uses `successMessage` if provided
   - Otherwise uses API response `message` field
   - Falls back to "Success"
3. Toast displays with translation key 'api.success'

### Error Flow
1. API returns error status or network error
2. If `showErrorToast: true` (default):
   - Uses `errorMessage` if provided
   - Otherwise uses API response error message
   - Shows error details in description
3. Toast displays with appropriate translation key

### Toast Keys for Translation

Add these to your `messages/en.json`:
```json
{
  "api": {
    "success": "Success",
    "error": "Error",
    "networkError": "Network Error",
    "unexpectedError": "Unexpected Error"
  }
}
```

## Real-World Examples

### Example 1: Delete with Confirmation
```typescript
const handleDelete = async (id: string) => {
  try {
    await api.delete(`/notifications/${id}`, {
      requiresAuth: true,
      showSuccessToast: true,
      successMessage: 'Notification deleted',
    });
    
    // Update UI
    setNotifications(prev => prev.filter(n => n.id !== id));
  } catch (error) {
    // Error already shown via toast
    console.error(error);
  }
};
```

### Example 2: Update with Loading State
```typescript
const [isLoading, setIsLoading] = useState(false);

const handleUpdate = async (data: ProfileData) => {
  setIsLoading(true);
  try {
    await api.put('/auth/profile', data, {
      requiresAuth: true,
      showSuccessToast: true,  // Shows API message
    });
    
    await fetchProfile();  // Refresh data
  } catch (error) {
    // Error toast already shown automatically
  } finally {
    setIsLoading(false);
  }
};
```

### Example 3: Silent Background Request
```typescript
// Fetch data silently without user notification
useEffect(() => {
  const loadData = async () => {
    try {
      const data = await api.get('/stats', {
        requiresAuth: true,
        showErrorToast: false,  // Silent errors
      });
      setStats(data);
    } catch (error) {
      // Handle silently or log
      console.error('Stats load failed', error);
    }
  };
  
  loadData();
}, []);
```

### Example 4: Form Submission
```typescript
const onSubmit = async (formData: FormData) => {
  try {
    const result = await api.post('/tickets/purchase', formData, {
      requiresAuth: true,
      showSuccessToast: true,
      showErrorToast: true,
      successMessage: 'Ticket purchased! Check your email.',
      errorMessage: 'Purchase failed. Please try again.',
    });
    
    router.push(`/tickets/${result.id}`);
  } catch (error) {
    // Error already displayed to user
  }
};
```

## Benefits

### 🎯 Consistency
- All API errors shown consistently across the app
- Same UX pattern everywhere

### 🚀 Less Boilerplate
**Before:**
```typescript
try {
  await api.post('/data', body);
  toast.success('...', 'Success!');
} catch (error) {
  toast.error('...', error.message);
}
```

**After:**
```typescript
await api.post('/data', body, {
  showSuccessToast: true
});
// Toasts handled automatically!
```

### 🌍 Translation Ready
- Toast utility already supports translations
- API messages displayed with translation fallback
- Easy to add translation for API response messages in future

### 🛠️ Flexible
- Enable/disable per request
- Custom messages when needed
- Error details automatically included

## Migration Guide

### Existing Code
Your existing code continues to work:
```typescript
// Still works - errors shown automatically
await api.post('/endpoint', data, { requiresAuth: true });
```

### Add Success Toasts
Simply add the flag:
```typescript
// Now shows success toast too
await api.post('/endpoint', data, { 
  requiresAuth: true,
  showSuccessToast: true  // ← Just add this
});
```

### Disable Auto Errors
For custom error handling:
```typescript
await api.get('/endpoint', { 
  showErrorToast: false  // ← Disable auto toast
});
```

## Best Practices

### ✅ DO
- Use automatic toasts for most CRUD operations
- Override messages for better UX
- Disable toasts for background/silent requests
- Let errors show automatically

### ❌ DON'T
- Don't add manual toasts if using automatic ones
- Don't disable error toasts without handling errors
- Don't forget to handle exceptions in try/catch

## Future Enhancements

### Planned Features
- [ ] Automatic translation of API messages based on locale
- [ ] Toast action buttons (undo, retry, etc.)
- [ ] Grouped toasts for batch operations
- [ ] Custom toast duration per request type

## Support

For questions or issues, check:
- `/src/lib/toast.tsx` - Toast implementation
- `/src/lib/apiClient.ts` - API client with toast integration
- Existing auth pages for reference implementations
