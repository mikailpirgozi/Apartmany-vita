# 🔧 Vercel Production Fix - Apartmány Vita

## 🚨 PROBLÉM

### Symptómy:
- **Localhost**: ✅ Rezervácia funguje perfektne, pricing sa načíta správne
- **Vercel Produkcia**: ❌ Pri prechode do ďalšieho kroku rezervácie sa stránka refreshne a vráti späť

### Error na produkcii:
```
Error validating datasource `db`: the URL must start with the protocol `prisma://` or `prisma+postgres://`
```

### URL kde sa to deje:
```
https://apartmany-vita.vercel.app/apartments/deluxe-apartman?error=pricing&details=%0AInvalid%20%60prisma.apartment.findUnique()%60%20invocation%3A%0A%0A%0AError%20validating%20datasource%20%60db%60%3A%20the%20URL%20must%20start%20with%20the%20protocol%20%60prisma%3A%2F%2F%60%20or%20%60prisma%2Bpostgres%3A%2F%2F%60
```

---

## 🔍 ANALÝZA PRÍČINY

### Kde sa chyba objavuje:
Súbor: `/src/app/(main)/booking/page.tsx` (riadky 27-38)

```typescript
// CRITICAL: Validate database connection FIRST
const { validateDatabaseUrl, getDatabaseInfo } = await import('@/lib/db-check');
const dbValidation = validateDatabaseUrl();

if (!dbValidation.valid) {
  console.error('❌ DATABASE ERROR:', {
    error: dbValidation.error,
    info: getDatabaseInfo()
  });
  // In production, this should never happen - redirect with clear error
  redirect('/apartments?error=database-config');
}
```

### Prečo sa to deje:

1. **Localhost** - `DATABASE_URL` je nastavená správne ako `postgresql://...`
2. **Vercel** - `DATABASE_URL` **NIE JE NASTAVENÁ** alebo je **NEPLATNÁ**

---

## ✅ RIEŠENIE

### 🎯 Krok 1: Skontrolujte Vercel Environment Variables

1. Choďte na **Vercel Dashboard**: https://vercel.com
2. Vyberte projekt **"apartmany-vita"**
3. Kliknite na **"Settings"** → **"Environment Variables"**

### 🎯 Krok 2: Nastavte DATABASE_URL

**KRITICKÉ: Musíte nastaviť `DATABASE_URL` v troch prostediach:**

#### Pre PostgreSQL (Supabase, Railway, Neon, atď.):
```env
DATABASE_URL=postgresql://username:password@host:port/database
```

**Príklad (Supabase):**
```env
DATABASE_URL=postgresql://postgres.xxxxxxxxxxxx:[YOUR-PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres
```

**Príklad (Railway):**
```env
DATABASE_URL=postgresql://postgres:FhMsbTSJYcndpebXfFIqmlcIamWpdCSG@shinkansen.proxy.rlwy.net:20490/railway
```

**Príklad (Neon):**
```env
DATABASE_URL=postgresql://username:password@ep-xxx-xxx.eu-central-1.aws.neon.tech/neondb?sslmode=require
```

#### Pre Prisma Accelerate/Data Proxy:
Ak používate Prisma Accelerate, URL začína `prisma://`:
```env
DATABASE_URL=prisma://accelerate.prisma-data.net/?api_key=YOUR_API_KEY
```

---

### 🎯 Krok 3: Nastavte všetky potrebné premenné

V **Vercel Settings → Environment Variables** pridajte:

#### 🔴 KRITICKÉ (bez týchto aplikácia nebude fungovať):

```env
# Database
DATABASE_URL=postgresql://your-database-url-here

# NextAuth
NEXTAUTH_SECRET=your-super-secret-key-min-32-characters
NEXTAUTH_URL=https://apartmany-vita.vercel.app

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-secret
```

#### 🟡 DÔLEŽITÉ (pre funkčnosť rezervácií a platieb):

```env
# Beds24 API
BEDS24_LONG_LIFE_TOKEN=PhvqHilqz7fKf5HT8Rq3Ks0zCLwrBOlyBfZ/BqyEKt8HfdfJYLRudz2/v2+WoZZdl7DPIyaPsd6nSGVzedFdVhYoFQn/oZTrX9xVrajrkwKBInhZ9fA9VXIRYEagRsVb6oqylGGn+PtnE+qDhNFAvA==
BEDS24_BASE_URL=https://api.beds24.com/v2

# Apartment/Room IDs
BEDS24_PROP_ID_DELUXE=161445
BEDS24_ROOM_ID_DELUXE=357931
BEDS24_PROP_ID_LITE=168900
BEDS24_ROOM_ID_LITE=357932
BEDS24_PROP_ID_DESIGN=227484
BEDS24_ROOM_ID_DESIGN=483027

# Stripe Payment (Použite test keys pre testovanie!)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key
STRIPE_SECRET_KEY=sk_test_your_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

#### 🟢 VOLITEĽNÉ (pre pokročilé funkcie):

```env
# Email (Resend)
RESEND_API_KEY=re_your_api_key
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Redis Cache (Optional)
REDIS_URL=redis://default:password@host:port

# AI Chatbot
OPENAI_API_KEY=sk-your-openai-api-key

# Analytics
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

---

### 🎯 Krok 4: Deployment Environment Configuration

**DÔLEŽITÉ**: Nastavte premenné pre všetky prostredia:

1. **Production** - pre produkčnú verziu (apartmany-vita.vercel.app)
2. **Preview** - pre preview deployments (pull requests)
3. **Development** - pre lokálny development (nie je potrebné, ak máte .env.local)

V Vercel pri každej premennej zaškrtnite:
- ✅ **Production**
- ✅ **Preview**
- ⬜ **Development** (netreba)

---

### 🎯 Krok 5: Stripe Configuration

#### A. Získajte Stripe API kľúče

1. Choďte na: https://dashboard.stripe.com/apikeys
2. Prihláste sa / vytvorte účet
3. Pre **testovanie** použijte **Test keys**:
   - Publishable key: `pk_test_...`
   - Secret key: `sk_test_...`

4. Pre **produkciu** použijte **Live keys**:
   - Publishable key: `pk_live_...`
   - Secret key: `sk_live_...`

#### B. Nastavte v Vercel

```env
# Pre TESTOVANIE (odporúčané začať s týmto):
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51...
STRIPE_SECRET_KEY=sk_test_51...

# Pre PRODUKCIU (až po testovaní):
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_51...
STRIPE_SECRET_KEY=sk_live_51...
```

#### C. Webhook Secret (pre payment notifications)

1. V Stripe Dashboard choďte na: **Developers → Webhooks**
2. Kliknite **"Add endpoint"**
3. Endpoint URL: `https://apartmany-vita.vercel.app/api/webhooks/stripe`
4. Vyberte events: `checkout.session.completed`, `payment_intent.succeeded`
5. Skopírujte **Signing secret** (začína `whsec_...`)
6. Pridajte do Vercel:
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
   ```

---

### 🎯 Krok 6: Database Setup (ak ešte nemáte)

#### Option A: Vercel Postgres (Najjednoduchšie)

1. V Vercel Dashboard kliknite **"Storage"**
2. Kliknite **"Create Database"** → **"Postgres"**
3. Vercel automaticky nastaví `DATABASE_URL`
4. Po vytvorení spustite migrations:
   ```bash
   npx prisma migrate deploy
   ```

#### Option B: Supabase (Doporučené)

1. Choďte na: https://supabase.com
2. Vytvorte nový projekt
3. Skopírujte **Connection String** (Settings → Database → Connection String)
4. Pridajte do Vercel:
   ```env
   DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.xxxx.supabase.co:5432/postgres
   ```

#### Option C: Railway

1. Choďte na: https://railway.app
2. Vytvorte PostgreSQL database
3. Skopírujte **Public URL**
4. Pridajte do Vercel

#### Option D: Neon (Serverless Postgres)

1. Choďte na: https://neon.tech
2. Vytvorte database
3. Skopírujte connection string
4. Pridajte do Vercel

---

### 🎯 Krok 7: Prisma Schema Update (ak používate Prisma Accelerate)

Ak chcete použiť Prisma Accelerate pre lepší výkon:

1. Upravte `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
     directUrl = env("DIRECT_DATABASE_URL") // Optional: pre migrations
   }
   ```

2. V Vercel pridajte:
   ```env
   DATABASE_URL=prisma://accelerate.prisma-data.net/?api_key=YOUR_API_KEY
   DIRECT_DATABASE_URL=postgresql://your-direct-connection-string
   ```

---

### 🎯 Krok 8: Regenerate Prisma Client & Redeploy

1. Po nastavení všetkých premenných v Vercel:
   - Kliknite **"Deployments"**
   - Kliknite na najnovší deployment
   - Kliknite **"Redeploy"**

2. Alebo pushte novú zmenu do GitHub:
   ```bash
   git commit --allow-empty -m "Trigger Vercel redeploy"
   git push
   ```

---

## 🧪 TESTOVANIE

### 1. Skontrolujte Deployment Logs

V Vercel → Deployments → Najnovší deployment → **View Function Logs**

Hľadajte:
```
✅ Prisma Client initialized successfully
✅ Database connection successful
```

Ak vidíte:
```
❌ DATABASE ERROR
❌ Prisma Client initialization failed
```
→ `DATABASE_URL` nie je správne nastavená

### 2. Testujte Booking Flow

1. Choďte na: https://apartmany-vita.vercel.app
2. Vyberte apartmán (napr. Deluxe Apartmán)
3. Vyberte dátumy a počet hostí
4. Kliknite "Rezervovať"
5. **Skontrolujte, či sa dostanete na booking page** (nie redirect späť)

### 3. Skontrolujte Browser Console

Otvorte Developer Tools (F12) → Console

**Chyby, ktoré by tam NEMALI byť:**
```
❌ Failed to calculate pricing
❌ Database connection error
❌ Prisma validation error
```

**Správne logy:**
```
✅ Pricing calculated successfully
✅ 2025-10-13: Available (calendar data)
✅ Dynamic prices from Beds24 Calendar API
```

### 4. Testujte Stripe Integration

1. V booking flow vyberte extras (ak sú dostupné)
2. Kliknite "Pokračovať na platbu"
3. Mali by ste vidieť Stripe checkout session
4. Použijte test kartu: `4242 4242 4242 4242` (Expiry: akýkoľvek budúci dátum, CVC: akékoľvek 3 čísla)

---

## 🔍 DIAGNOSTIKA

### Ako overiť, že DATABASE_URL je správne nastavená:

1. V Vercel → Settings → Environment Variables
2. Hľadajte `DATABASE_URL`
3. Skontrolujte hodnotu:
   - ✅ Začína `postgresql://` alebo `prisma://`
   - ✅ Obsahuje username, password, host, port, database
   - ❌ Je prázdna
   - ❌ Obsahuje `${VARIABLE_NAME}` (nesprávna syntax)

### Test Connection (Lokálne):

```bash
# 1. Nastavte DATABASE_URL lokálne na tú istú hodnotu ako na Vercel
export DATABASE_URL="postgresql://your-vercel-db-url"

# 2. Testujte pripojenie
npx prisma db pull

# 3. Ak funguje, Vercel by mal fungovať tiež
```

---

## 🛠️ POKROČILÉ RIEŠENIE PROBLÉMOV

### Problém: "Stripe is not defined"

**Riešenie:**
```env
# Skontrolujte, že máte nastavené:
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
```

**Dôležité:** Premenné začínajúce `NEXT_PUBLIC_` musia byť nastavené v Vercel!

### Problém: "Beds24 API returns 401 Unauthorized"

**Riešenie:**
```env
# Skontrolujte, že máte správny token:
BEDS24_LONG_LIFE_TOKEN=PhvqHilqz7fKf5HT8Rq3Ks0zCLwrBOlyBfZ/BqyEKt8HfdfJYLRudz2/v2+WoZZdl7DPIyaPsd6nSGVzedFdVhYoFQn/oZTrX9xVrajrkwKBInhZ9fA9VXIRYEagRsVb6oqylGGn+PtnE+qDhNFAvA==
```

### Problém: Deployment succeeds ale stránka je prázdna

**Riešenie:**
1. Skontrolujte Browser Console (F12)
2. Hľadajte JavaScript errors
3. Overte, že všetky `NEXT_PUBLIC_*` premenné sú nastavené

---

## 📋 CHECKLIST PRE PRODUKCIU

Pred spustením aplikácie overte:

### Database:
- [ ] `DATABASE_URL` je nastavená v Vercel
- [ ] Databáza je prístupná zvonku (public URL)
- [ ] Prisma migrations sú spustené (`npx prisma migrate deploy`)
- [ ] Seed data sú vložené (apartmány, atď.)

### Authentication:
- [ ] `NEXTAUTH_SECRET` je nastavený (min 32 charakterov)
- [ ] `NEXTAUTH_URL` je nastavený na produkčnú URL
- [ ] `GOOGLE_CLIENT_ID` a `GOOGLE_CLIENT_SECRET` sú nastavené
- [ ] Google OAuth redirect URI je nastavený v Google Cloud Console

### Beds24 Integration:
- [ ] `BEDS24_LONG_LIFE_TOKEN` je nastavený
- [ ] Všetky `BEDS24_PROP_ID_*` a `BEDS24_ROOM_ID_*` sú nastavené
- [ ] Beds24 API test endpoint funguje: `/api/beds24/test`

### Stripe Payment:
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` je nastavený
- [ ] `STRIPE_SECRET_KEY` je nastavený
- [ ] `STRIPE_WEBHOOK_SECRET` je nastavený
- [ ] Stripe webhook endpoint je nakonfigurovaný
- [ ] Test platba funguje s test kartou

### Optional Features:
- [ ] Email service (Resend API key)
- [ ] Redis cache (ak používate)
- [ ] OpenAI chatbot (ak používate)
- [ ] Google Analytics (ak používate)

---

## 🚀 RÝCHLY FIX - TL;DR

### Ak chcete rýchlo vyriešiť problém:

1. **Choďte do Vercel Dashboard**
2. **Settings → Environment Variables**
3. **Pridajte minimálne tieto premenné:**

```env
DATABASE_URL=postgresql://your-database-url-here
NEXTAUTH_SECRET=your-32-character-secret-here
NEXTAUTH_URL=https://apartmany-vita.vercel.app
BEDS24_LONG_LIFE_TOKEN=PhvqHilqz7fKf5HT8Rq3Ks0zCLwrBOlyBfZ/BqyEKt8HfdfJYLRudz2/v2+WoZZdl7DPIyaPsd6nSGVzedFdVhYoFQn/oZTrX9xVrajrkwKBInhZ9fA9VXIRYEagRsVb6oqylGGn+PtnE+qDhNFAvA==
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key
STRIPE_SECRET_KEY=sk_test_your_key
```

4. **Redeploy:**
   - Deployments → Redeploy
   - Alebo push prázdny commit: `git commit --allow-empty -m "redeploy" && git push`

5. **Testujte**: https://apartmany-vita.vercel.app

---

## 📞 Podpora

Ak problém pretrváva:

1. **Skontrolujte Vercel Function Logs**: Deployments → Function Logs
2. **Skontrolujte Browser Console**: F12 → Console
3. **Vytvorte GitHub Issue**: S error message a logmi

---

**✅ Po aplikovaní týchto krokov by rezervačný systém mal fungovať perfektne na Vercel!**
