# Beds24 Service Split Plan

## 📊 Pôvodný súbor: `beds24.ts` (2499 riadkov)

### Štruktúra:
1. **Interfaces & Types** (riadky 1-56)
2. **Beds24Service Class** (riadky 58-2400)
   - Constructor & Config
   - Rate Limiting
   - Token Management
   - API Methods (availability, booking, calendar, pricing)
   - Response Parsers
3. **Exported Helper Functions** (riadky 2402-2499)

---

## 🎯 Nová modulárna štruktúra:

### `/services/beds24/`
```
├── types.ts                    ✅ DONE (type definitions)
├── auth.ts                     ✅ DONE (token management)
├── rate-limiter.ts             ✅ DONE (rate limiting)
├── api-client.ts               🔨 TODO (base API client)
├── availability.ts             🔨 TODO (availability checks)
├── booking.ts                  🔨 TODO (booking operations)
├── calendar.ts                 🔨 TODO (calendar API)
├── pricing.ts                  🔨 TODO (pricing logic)
├── parsers.ts                  🔨 TODO (response parsers)
├── service.ts                  🔨 TODO (main Beds24Service class)
└── index.ts                    🔨 TODO (exports)
```

---

## 📋 Detailný plán rozdelenia:

### 1. `api-client.ts` (~200 LOC)
**Obsahuje:**
- Base API client
- HTTP request handling
- Error handling
- Rate limiting integration

**Metódy:**
- `makeRequest()`
- `handleResponse()`
- `handleError()`

### 2. `availability.ts` (~400 LOC)
**Obsahuje:**
- Availability checking logic
- Date range validation

**Metódy z Beds24Service:**
- `getInventoryCalendar()`
- `getAvailabilityWithOffers()`
- `checkAvailability()`

### 3. `booking.ts` (~300 LOC)
**Obsahuje:**
- Booking creation
- Booking management

**Metódy z Beds24Service:**
- `createBooking()`
- `getBooking()`
- `cancelBooking()`

### 4. `calendar.ts` (~300 LOC)
**Obsahuje:**
- Calendar data fetching
- Date calculations

**Metódy z Beds24Service:**
- `getCalendarData()`
- `getMonthAvailability()`

### 5. `pricing.ts` (~200 LOC)
**Obsahuje:**
- Price calculations
- Discount logic

**Metódy z Beds24Service:**
- `getPricing()`
- `applyDiscounts()`
- `extractBeds24Price()`

### 6. `parsers.ts` (~800 LOC)
**Obsahuje:**
- Všetky response parsers
- Data transformation

**Metódy z Beds24Service:**
- `parseOffersResponse()`
- `parseInventoryAvailabilityResponseV2()`
- `parseInventoryOffersResponseV2()`
- `parseBookingsResponseV2()`
- `parseInventoryCalendarResponseV2()`
- `parseRatesResponseV2()`
- `parseBookingResponseV2()`

### 7. `service.ts` (~200 LOC)
**Obsahuje:**
- Main Beds24Service class
- Orchestrates all modules
- Public API

---

## ✅ Checklist:

- [x] Backup pôvodného súboru (`beds24.BACKUP.ts`)
- [x] Vytvorené základné moduly (types, auth, rate-limiter)
- [ ] Vytvoriť `api-client.ts`
- [ ] Vytvoriť `parsers.ts`
- [ ] Vytvoriť `availability.ts`
- [ ] Vytvoriť `booking.ts`
- [ ] Vytvoriť `calendar.ts`
- [ ] Vytvoriť `pricing.ts`
- [ ] Vytvoriť `service.ts` (main orchestrator)
- [ ] Aktualizovať `index.ts` (re-exports)
- [ ] Aktualizovať všetky importy v aplikácii
- [ ] Testovať že všetko funguje
- [ ] Odstrániť pôvodný `beds24.ts` (alebo premenovať na `.old`)

---

## 🔍 Závislosti (súbory ktoré importujú beds24):

Treba aktualizovať importy v:
- `/services/pricing.ts`
- `/services/apartments.ts`
- `/app/api/beds24/availability/route.ts`
- `/app/api/beds24/booking/route.ts`
- `/app/api/bookings/create/route.ts`
- `/app/api/payments/create-intent/route.ts`
- `/app/api/apartments/config/route.ts`

---

**Status:** 🚧 IN PROGRESS
**Backup:** ✅ `beds24.BACKUP.ts` (2499 riadkov)
**Cieľ:** 100% funkčnosť zachovaná
