# Beds24 API Integration

## Overview
Táto aplikácia je integrovaná s Beds24 API pre správu dostupnosti apartmánov, cien a rezervácií.

## API Configuration

### API Key
```
AbDalfEtyekmentOsVeb
```

### Property ID
```
357931
```

### Room IDs
```
Deluxe Apartmán: 161445
Lite Apartmán: 168900
Design Apartmán: 227484
Malý Apartmán: (treba nastaviť)
```

### Base URL
```
https://beds24.com/api/v2
```

## Environment Variables

Nastavte tieto premenné v `.env.local`:

```env
# Beds24 API Configuration
BEDS24_API_KEY=AbDalfEtyekmentOsVeb
BEDS24_BASE_URL=https://beds24.com/api/v2
BEDS24_PROP_ID=your_property_id_here

# Beds24 Room Mappings
BEDS24_ROOM_MALY=room_id_for_maly_apartman
BEDS24_ROOM_DESIGN=room_id_for_design_apartman
BEDS24_ROOM_LITE=room_id_for_lite_apartman
BEDS24_ROOM_DELUXE=room_id_for_deluxe_apartman
```

## Testing

### 1. API Test Endpoint
```
GET /api/beds24/test?propId=xxx&roomId=xxx
```

### 2. Admin Test Page
Navštívte `/admin/beds24-test` pre interaktívne testovanie API pripojenia.

## Available Functions

### Core Service (`src/services/beds24.ts`)

#### `getAvailability(request: AvailabilityRequest)`
Získa dostupnosť apartmánov pre dané obdobie.

```typescript
const availability = await beds24Service.getAvailability({
  propId: 'your_prop_id',
  startDate: '2024-01-01',
  endDate: '2024-01-07',
  roomId: 'room_id' // optional
});
```

#### `getRoomRates(propId, roomId, startDate, endDate)`
Získa dynamické ceny pre dané obdobie.

```typescript
const rates = await beds24Service.getRoomRates(
  'prop_id',
  'room_id', 
  '2024-01-01',
  '2024-01-07'
);
```

#### `createBooking(bookingData: BookingData)`
Vytvorí novú rezerváciu v Beds24.

```typescript
const booking = await beds24Service.createBooking({
  propId: 'prop_id',
  roomId: 'room_id',
  checkIn: '2024-01-01',
  checkOut: '2024-01-07',
  numAdult: 2,
  numChild: 0,
  guestFirstName: 'John',
  guestName: 'Doe',
  guestEmail: 'john@example.com',
  guestPhone: '+421123456789',
  totalPrice: 500
});
```

#### `updateBookingStatus(bookId, status)`
Aktualizuje stav rezervácie.

```typescript
await beds24Service.updateBookingStatus('book_id', 'confirmed');
```

#### `getBooking(bookId)`
Získa detaily rezervácie.

```typescript
const booking = await beds24Service.getBooking('book_id');
```

### Helper Functions

#### `getApartmentAvailability(apartmentSlug, startDate, endDate)`
Získa dostupnosť pre konkrétny apartmán podľa slug.

```typescript
const availability = await getApartmentAvailability(
  'maly-apartman',
  new Date('2024-01-01'),
  new Date('2024-01-07')
);
```

#### `createApartmentBooking(apartmentSlug, bookingData)`
Vytvorí rezerváciu pre konkrétny apartmán.

```typescript
const booking = await createApartmentBooking('maly-apartman', {
  checkIn: '2024-01-01',
  checkOut: '2024-01-07',
  numAdult: 2,
  numChild: 0,
  guestFirstName: 'John',
  guestName: 'Doe',
  guestEmail: 'john@example.com',
  guestPhone: '+421123456789',
  totalPrice: 500
});
```

## Apartment Mapping

Aplikácia mapuje apartmány na Beds24 room IDs:

- `maly-apartman` → `BEDS24_ROOM_MALY`
- `design-apartman` → `BEDS24_ROOM_DESIGN`
- `lite-apartman` → `BEDS24_ROOM_LITE`
- `deluxe-apartman` → `BEDS24_ROOM_DELUXE`

## Error Handling

Všetky API volania majú implementované error handling:

- Network errors
- API response errors
- Invalid data format
- Missing required parameters

## Testing Utilities

### Test Functions (`src/lib/beds24-test.ts`)

- `testBeds24Connection()` - Testuje základné API pripojenie
- `testPropertyAccess(propId)` - Testuje prístup k property
- `testRoomAvailability(propId, roomId)` - Testuje dostupnosť izieb
- `runBeds24Tests(propId?, roomId?)` - Spustí všetky testy

## API Endpoints

### Availability Endpoint
```
GET /api/beds24/availability?apartment=maly-apartman&startDate=2024-01-01&endDate=2024-01-07
```

**Response:**
```json
{
  "success": true,
  "data": {
    "available": ["2024-01-01", "2024-01-02"],
    "booked": ["2024-01-03"],
    "prices": {
      "2024-01-01": 100,
      "2024-01-02": 120
    },
    "minStay": 1,
    "maxStay": 30
  },
  "apartment": "maly-apartman",
  "roomId": "room_maly",
  "startDate": "2024-01-01",
  "endDate": "2024-01-07"
}
```

### Booking Endpoint
```
POST /api/beds24/booking
```

**Request Body:**
```json
{
  "apartment": "maly-apartman",
  "checkIn": "2024-01-01",
  "checkOut": "2024-01-07",
  "numAdult": 2,
  "numChild": 0,
  "guestFirstName": "John",
  "guestName": "Doe",
  "guestEmail": "john@example.com",
  "guestPhone": "+421123456789",
  "totalPrice": 500
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "bookId": "12345",
    "status": "new",
    "checkIn": "2024-01-01",
    "checkOut": "2024-01-07",
    "totalPrice": 500,
    "guestName": "John Doe",
    "guestEmail": "john@example.com"
  },
  "message": "Booking created successfully"
}
```

## Next Steps

1. **Nastavte Property ID**: Získajte váš Beds24 Property ID a nastavte ho v environment variables
2. **Nastavte Room IDs**: Mapujte vaše apartmány na Beds24 Room IDs
3. **Testujte API**: Použite testovaciu stránku `/admin/beds24-test`
4. **Integrujte do booking flow**: Pripojte Beds24 API do existujúceho booking systému
5. **Testujte dostupnosť**: Použite `/api/beds24/availability` endpoint
6. **Testujte rezervácie**: Použite `/api/beds24/booking` endpoint

## 🔑 **API V2 AUTHENTICATION SETUP:**

**❌ Problém: Používame nesprávny autentifikačný postup!**

**✅ Správny postup pre API V2:**

### **Krok 1: Vytvorte Invite Code**
1. **Choďte do Account → Account Access → Create Invite Code**
2. **Nastavte scopes:**
   - ✅ `read:properties`
   - ✅ `read:inventory`
   - ✅ `read:bookings`
   - ✅ `read:bookings-personal`
3. **Povolte "Allow linked properties"**
4. **Vytvorte invite code**

### **Krok 2: Vymeňte Invite Code za Token**
```bash
curl -X POST "https://beds24.com/api/v2/authentication/setup" \
  -H "Content-Type: application/json" \
  -d '{"inviteCode": "VÁŠ_INVITE_CODE"}'
```

### **Krok 3: Použite Token v API Calls**
```bash
curl -X GET "https://beds24.com/api/v2/properties" \
  -H "token: VÁŠ_TOKEN" \
  -H "Content-Type: application/json"
```

**⚠️ DÔLEŽITÉ:** API V2 používa token, nie API key!

## 🚨 **PROBLÉM S ÚČTOM:**

**❌ Váš účet nemá prístup k API V2 funkciám:**

- **Chýba možnosť vytvoriť invite code**
- **API V1 je zastarané (404 error)**
- **API V2 vyžaduje invite code**

### **RIEŠENIE:**

**Kontaktujte Beds24 podporu:**

1. **Obráťte sa na podporu Beds24**
2. **Opýtajte sa, ako aktivovať API V2 alebo invite code**
3. **Zistite, či je potrebný upgrade účtu**
4. **Požiadajte o alternatívne riešenie**

**Bez prístupu k API V2 funkciám nie je možné pokračovať v integrácii!**

## 🧪 **TESTOVANÉ MOŽNOSTI:**

**✅ Otestované všetky možné kombinácie:**

### **API V2 Headers:**
- `token: AbDalfEtyekmentOsVeb` → **401 "Token not valid"**
- `api-key: AbDalfEtyekmentOsVeb` → **401 "Token is missing"**
- `Authorization: Bearer AbDalfEtyekmentOsVeb` → **401 "Token is missing"**
- `X-API-Key: AbDalfEtyekmentOsVeb` → **401 "Token is missing"**

### **API V1 Headers:**
- Všetky kombinácie → **404 error** (API V1 je zastarané)

### **Endpointy:**
- `/properties`, `/rooms`, `/inventory`, `/bookings` → **Neúspešné**
- `/getBookings`, `/getProperties` → **404 error**

## 🚨 **FINÁLNY ZÁVER:**

**❌ Integrácia nie je možná bez invite code**
**❌ API V1 je zastarané (404)**
**❌ API V2 vyžaduje invite code**

**Jediné riešenie: Kontaktovať Beds24 podporu!**

3. **Apartmán Vita Design (227484):** 
   - propKey = `VitaDesign2024Key`

## 📋 **KONTROLA DĹŽKY:**
- `VitaDeluxe2024Key` = 16 znakov ✅
- `VitaLite2024Key1` = 16 znakov ✅  
- `VitaDesign2024Key` = 16 znakov ✅

## 🔧 **POSTUP NASTAVENIA:**

### **Krok 1: Nastavte API kľúč v Account Access**
- Account → Account Access → API Key 1
- API Key: `AbDalfEtyekmentOsVeb`
- Kliknite "Save"

### **Krok 2: Nastavte propKey pre každú property**
- Properties → Access → API Access
- Pre každú property zadajte príslušný propKey
- Kliknite "Save" pre každú property

## Troubleshooting

### Common Issues

1. **401 Unauthorized**: Skontrolujte API key a propKey
2. **404 Not Found**: Skontrolujte Property ID a Room IDs
3. **403 Forbidden**: Skontrolujte API permissions v Beds24
4. **Rate Limiting**: Beds24 má rate limits, implementujte retry logic ak je potrebné

### Debug Mode

Pre debug informácie skontrolujte:
- Browser console
- Server logs
- Network tab v developer tools
