# 📚 API Documentation - Apartmány Vita

## 🔐 Authentication

Všetky admin endpointy vyžadujú autentifikáciu cez NextAuth session.

**Admin emails:** `pirgozi1@gmail.com`

---

## 🏠 Apartments API

### GET `/api/apartments`
Získa zoznam všetkých aktívnych apartmánov.

**Response:**
```json
[
  {
    "id": "string",
    "name": "string",
    "slug": "string",
    "description": "string",
    "basePrice": "number",
    "maxGuests": "number",
    "images": ["string"],
    "amenities": ["string"]
  }
]
```

### GET `/api/apartments/available`
Zistí dostupné apartmány pre dané dátumy.

**Query params:**
- `checkIn` - YYYY-MM-DD
- `checkOut` - YYYY-MM-DD
- `guests` - number
- `children` - number (optional)

---

## 📅 Availability API

### GET `/api/beds24/availability`
Získa dostupnosť apartmánu z Beds24.

**Query params:**
- `apartment` - slug (design-apartman, lite-apartman, deluxe-apartman)
- `checkIn` - YYYY-MM-DD
- `checkOut` - YYYY-MM-DD
- `guests` - number
- `children` - number (optional)
- `userId` - string (optional, pre loyalty discount)

**Response:**
```json
{
  "success": true,
  "available": ["2025-10-10", "2025-10-11"],
  "booked": ["2025-10-12"],
  "prices": {
    "2025-10-10": 120,
    "2025-10-11": 120
  },
  "minStay": 1,
  "maxStay": 30
}
```

**Rate limit:** 60 req/min (general API limit)

---

## 💰 Pricing API

### POST `/api/pricing/calculate`
Vypočíta cenu rezervácie vrátane zliav.

**Request body:**
```json
{
  "apartmentId": "string",
  "apartmentSlug": "string",
  "basePrice": "number",
  "checkIn": "2025-10-10",
  "checkOut": "2025-10-15",
  "guests": 2,
  "children": 0,
  "userId": "string" // optional
}
```

**Response:**
```json
{
  "basePrice": 100,
  "nights": 5,
  "subtotal": 500,
  "loyaltyDiscount": 25,
  "longStayDiscount": 0,
  "stayDiscount": 50,
  "cleaningFee": 0,
  "cityTax": 20,
  "total": 425,
  "pricePerNight": 100,
  "breakdown": [...]
}
```

---

## 📝 Bookings API

### POST `/api/bookings/create`
Vytvorí novú rezerváciu v Beds24.

**Request body:**
```json
{
  "apartment": "design-apartman",
  "arrival": "2025-10-10",
  "departure": "2025-10-15",
  "numAdult": 2,
  "numChild": 0,
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "+421940728676",
  "price": 425
}
```

**Rate limit:** 3 req/min ⚠️

**Response:**
```json
{
  "success": true,
  "bookId": "12345",
  "status": "new"
}
```

### GET `/api/bookings`
Získa rezervácie používateľa (vyžaduje auth).

### GET `/api/bookings/[id]`
Získa detail rezervácie.

---

## 💳 Payments API

### POST `/api/payments/create-intent`
Vytvorí Stripe payment intent.

**Request body:**
```json
{
  "amount": 425,
  "apartmentId": "design-apartman",
  "guestEmail": "john@example.com",
  "guestName": "John Doe",
  "checkIn": "2025-10-10",
  "checkOut": "2025-10-15",
  "bookingData": {
    "checkIn": "2025-10-10",
    "checkOut": "2025-10-15",
    "guests": 2,
    "children": 0
  },
  "guestInfo": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "+421940728676",
    "country": "Slovakia",
    "city": "Bratislava"
  },
  "pricing": {
    "total": 425,
    "subtotal": 500,
    "loyaltyDiscount": 25,
    "cleaningFee": 0,
    "cityTax": 20,
    "nights": 5
  }
}
```

**Rate limit:** 5 req/min ⚠️

---

## 👤 User API

### GET `/api/user/profile`
Získa profil používateľa (vyžaduje auth).

### PUT `/api/user/profile`
Aktualizuje profil používateľa (vyžaduje auth).

### GET `/api/user/stats`
Získa štatistiky používateľa (vyžaduje auth).

---

## 📧 Contact API

### POST `/api/contact`
Odošle kontaktnú správu.

**Request body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+421940728676", // optional
  "subject": "Otázka",
  "message": "Text správy"
}
```

**Rate limit:** 5 req/min ⚠️

---

## 🔐 Admin API

**Všetky admin endpointy vyžadujú admin autorizáciu!**

### GET `/api/admin/apartments`
Získa všetky apartmány (vrátane neaktívnych).

### PATCH `/api/admin/apartments/[id]`
Aktualizuje apartmán.

### POST `/api/admin/upload`
Uploadne obrázok do Vercel Blob Storage.

### GET `/api/admin/seo`
Získa všetky SEO metadata.

### POST `/api/admin/seo`
Vytvorí/aktualizuje SEO metadata.

---

## 🔍 SEO API

### GET `/api/sitemap`
Vygeneruje XML sitemap.

### GET `/api/robots`
Vráti robots.txt.

---

## 💬 Chat API

### POST `/api/chat`
Odošle správu AI chatbotovi.

**Request body:**
```json
{
  "message": "Aká je cena apartmánu?",
  "conversationHistory": [],
  "language": "sk",
  "sessionId": "string",
  "userId": "string" // optional
}
```

**Rate limit:** 20 req/min

---

## 📊 Analytics API

### POST `/api/analytics/events`
Zaloguje analytics event.

### POST `/api/analytics/web-vitals`
Zaloguje web vitals metriky.

### GET `/api/analytics/dashboard`
Získa analytics dashboard data (admin only).

---

## ⚙️ Utility API

### GET `/api/health`
Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-10-04T12:00:00Z"
}
```

### POST `/api/cache/clear`
Vyčistí cache (admin only).

### POST `/api/revalidate`
Revaliduje Next.js cache (admin only).

---

## 🚨 Rate Limits

| Endpoint | Limit | Window |
|----------|-------|--------|
| `/api/bookings/create` | 3 req | 1 min |
| `/api/payments/*` | 5 req | 1 min |
| `/api/auth/*` | 5 req | 15 min |
| `/api/contact` | 5 req | 1 min |
| `/api/chat` | 20 req | 1 min |
| General API | 60 req | 1 min |

**Headers:**
- `X-RateLimit-Limit` - max requests
- `X-RateLimit-Remaining` - remaining requests
- `X-RateLimit-Reset` - reset time (ISO 8601)

---

## 🔒 Security

### Debug Endpoints (BLOCKED in production)
- `/api/debug/*`
- `/api/beds24-debug*`
- `/api/test-pricing*`
- `/beds24-setup`
- `/invite-to-token`

### Admin Authorization
- Email whitelist: `pirgozi1@gmail.com`
- DB flag: `user.isAdmin = true`
- Double-layer security

---

## 📝 Error Responses

### 400 Bad Request
```json
{
  "error": "Invalid request data",
  "details": [...]
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized: Admin access required"
}
```

### 429 Too Many Requests
```json
{
  "error": "Príliš veľa požiadaviek. Počkajte chvíľu."
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

---

## 🔗 External APIs

### Beds24 API
- **Base URL:** `https://api.beds24.com/v2`
- **Auth:** Long Life Token / Refresh Token
- **Rate limit:** 30 req/min

### Stripe API
- **Mode:** Live / Test
- **Webhooks:** `/api/webhooks/stripe`

---

**Last updated:** 4. október 2025  
**Version:** 1.0.0
