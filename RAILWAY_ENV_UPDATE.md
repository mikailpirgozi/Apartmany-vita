# Railway Environment Variables Update

## Beds24 API V2 Migration - Environment Variables

### New Variables to Add:
```
BEDS24_LONG_LIFE_TOKEN=PhvqHilqz7fKf5HT8Rq3Ks0zCLwrBOlyBfZ/BqyEKt8HfdfJYLRudz2/v2+WoZZdl7DPIyaPsd6nSGVzedFdVhYoFQn/oZTrX9xVrajrkwKBInhZ9fA9VXIRYEagRsVb6oqylGGn+PtnE+qDhNFAvA==
BEDS24_BASE_URL=https://api.beds24.com/v2
```

### Variables to Update:
- `BEDS24_API_KEY` → **REMOVE** (replaced by BEDS24_LONG_LIFE_TOKEN)
- `BEDS24_BASE_URL` → **UPDATE** to `https://api.beds24.com/v2`

### Variables to Keep (unchanged):
- `BEDS24_PROP_ID=357931`
- `BEDS24_PROP_ID_DESIGN=227484`
- `BEDS24_PROP_ID_LITE=168900`
- `BEDS24_PROP_ID_DELUXE=161445`
- `BEDS24_ROOM_ID_DESIGN=483027`
- `BEDS24_ROOM_ID_LITE=357932`
- `BEDS24_ROOM_ID_DELUXE=357931`

## Railway Dashboard Steps:

1. **Go to Railway Dashboard**
2. **Select your project**
3. **Go to Variables tab**
4. **Add new variables:**
   - `BEDS24_LONG_LIFE_TOKEN` = `PhvqHilqz7fKf5HT8Rq3Ks0zCLwrBOlyBfZ/BqyEKt8HfdfJYLRudz2/v2+WoZZdl7DPIyaPsd6nSGVzedFdVhYoFQn/oZTrX9xVrajrkwKBInhZ9fA9VXIRYEagRsVb6oqylGGn+PtnE+qDhNFAvA==`
   - `BEDS24_BASE_URL` = `https://api.beds24.com/v2`
5. **Remove old variable:**
   - `BEDS24_API_KEY` (delete this)
6. **Save changes**

## After Update:
- Railway will automatically redeploy the application
- Test the new V2 API at: `https://your-app.railway.app/beds24-v2-test`
- All existing functionality will continue to work with the new API

## Testing:
1. Visit `/beds24-v2-test` page
2. Test availability, rates, and bookings
3. Verify all apartment mappings work correctly
