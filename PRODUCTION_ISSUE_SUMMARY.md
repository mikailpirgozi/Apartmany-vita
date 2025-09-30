# 📋 Production Issue Summary & Resolution

## 🔍 ANALÝZA PROBLÉMU

### Čo sa stalo:

**Localhost (✅ FUNGUJE):**
- Rezervácia prebieha správne
- Pricing sa načíta z Beds24 API
- Všetko funguje perfektne
- Logy ukazujú úspešné volanie API a kalkuláciu ceny

**Production Vercel (❌ NEFUNGUJE):**
- Pri pokuse prejsť na ďalší krok rezervácie dôjde k refresh
- Stránka sa vráti späť na výber dátumov
- URL obsahuje error: `?error=pricing&details=Invalid prisma.apartment.findUnique() invocation`
- Chybová hláška: `Error validating datasource 'db': the URL must start with the protocol 'prisma://' or 'prisma+postgres://'`

### Kde problém vzniká:

**Súbor:** `/src/app/(main)/booking/page.tsx`  
**Riadky:** 27-38

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

### Prečo to nefunguje:

1. **Chýbajúca `DATABASE_URL`** - V Vercel environment variables nie je nastavená databázová URL
2. **Prisma nemôže inicializovať klienta** - Bez `DATABASE_URL` Prisma zlyhá
3. **Validácia zlyhá** - `validateDatabaseUrl()` vracia `valid: false`
4. **Redirect späť** - Aplikácia redirectne užívateľa na apartments page

---

## ✅ RIEŠENIE

### Hlavný problém:

**`DATABASE_URL` NIE JE NASTAVENÁ V VERCEL**

### Čo treba urobiť:

1. **Nastaviť `DATABASE_URL` v Vercel Dashboard**
2. **Nastaviť ostatné environment variables (Beds24, Stripe, NextAuth)**
3. **Redeploy aplikáciu**
4. **Otestovať booking flow**

---

## 📂 ČO SME VYTVORILI

### 1. Komplexný návod: `VERCEL_PRODUCTION_FIX.md`

**Obsahuje:**
- ✅ Detailnú analýzu problému
- ✅ Krok-za-krokom návod na nastavenie Vercel
- ✅ Všetky potrebné environment variables
- ✅ Návod na nastavenie Stripe integration
- ✅ Návod na nastavenie databázy (Vercel Postgres, Supabase, Railway, Neon)
- ✅ Troubleshooting guide
- ✅ Checklist pre produkciu

### 2. Rýchly návod: `VERCEL_QUICK_FIX.md`

**Obsahuje:**
- ⚡ 5-minútové riešenie
- ⚡ Iba najdôležitejšie kroky
- ⚡ Copy-paste environment variables
- ⚡ Debugging endpoint
- ⚡ Checklist

### 3. Testing endpoint: `/api/test-env/route.ts`

**Funkcie:**
- 🔍 Testuje všetky kritické environment variables
- 🔍 Vracia status READY/NOT_READY
- 🔍 Identifikuje chybajúce premenné
- 🔍 Overí validitu existujúcich premenných

**Použitie:**
```bash
curl https://apartmany-vita.vercel.app/api/test-env
```

### 4. Database connection test script: `scripts/test-database-connection.js`

**Funkcie:**
- 🧪 Testuje `DATABASE_URL` lokálne
- 🧪 Validuje formát connection string
- 🧪 Identifikuje problémy

**Použitie:**
```bash
node scripts/test-database-connection.js
```

### 5. Production verification script: `scripts/verify-production.sh`

**Funkcie:**
- ✅ Testuje všetky kritické endpointy
- ✅ Overí database connection
- ✅ Overí Beds24 integration
- ✅ Overí environment variables
- ✅ Komplexný report

**Použitie:**
```bash
./scripts/verify-production.sh https://apartmany-vita.vercel.app
```

### 6. Updated `vercel.json`

**Pridané:**
- ✅ Production NODE_ENV
- ✅ API cache headers
- ✅ Function timeout configuration

---

## 🎯 ĎALŠIE KROKY

### Krok 1: Nastavte Environment Variables vo Vercel (KRITICKÉ!)

```
1. Choďte do Vercel Dashboard
2. Settings → Environment Variables
3. Pridajte všetky premenné z VERCEL_QUICK_FIX.md
```

**Minimálne potrebné:**
- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_SECRET` - Min 32 znakov
- `NEXTAUTH_URL` - https://apartmany-vita.vercel.app
- `BEDS24_LONG_LIFE_TOKEN` - API token
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe key
- `STRIPE_SECRET_KEY` - Stripe secret

### Krok 2: Vytvorte alebo pripojte databázu

**Option A: Vercel Postgres (najjednoduchšie)**
```
1. Vercel Dashboard → Storage → Create Database → Postgres
2. Vercel automaticky nastaví DATABASE_URL
```

**Option B: Supabase**
```
1. Vytvorte projekt na supabase.com
2. Skopírujte connection string
3. Pridajte ako DATABASE_URL do Vercel
```

**Option C: Railway, Neon, alebo iný provider**
```
1. Vytvorte PostgreSQL databázu
2. Skopírujte connection string
3. Pridajte ako DATABASE_URL do Vercel
```

### Krok 3: Nastavte Stripe

```
1. Choďte na dashboard.stripe.com/apikeys
2. Skopírujte test keys (pk_test_... a sk_test_...)
3. Pridajte do Vercel
4. Nastavte webhook (dashboard.stripe.com/webhooks)
```

### Krok 4: Redeploy

```
Option A: Vercel Dashboard → Deployments → Redeploy
Option B: git commit --allow-empty -m "redeploy" && git push
```

### Krok 5: Otestujte

```
# 1. Environment check
curl https://apartmany-vita.vercel.app/api/test-env

# 2. Booking flow test
Choďte na: https://apartmany-vita.vercel.app
→ Vyberte apartmán
→ Vyberte dátumy
→ Kliknite "Rezervovať"
→ Mali by ste vidieť booking form (nie redirect späť!)

# 3. Automated tests
./scripts/verify-production.sh https://apartmany-vita.vercel.app
```

---

## 📊 PRIORITY CHECKLIST

### 🔴 KRITICKÉ (bez týchto nič nefunguje):

- [ ] `DATABASE_URL` nastavená vo Vercel
- [ ] Databáza vytvorená a dostupná
- [ ] Prisma migrations spustené (`npx prisma migrate deploy`)
- [ ] `NEXTAUTH_SECRET` nastavený (min 32 znakov)
- [ ] `NEXTAUTH_URL` nastavená na production URL

### 🟡 DÔLEŽITÉ (pre funkčné rezervácie):

- [ ] `BEDS24_LONG_LIFE_TOKEN` nastavený
- [ ] Všetky `BEDS24_PROP_ID_*` a `BEDS24_ROOM_ID_*` nastavené
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` nastavený
- [ ] `STRIPE_SECRET_KEY` nastavený
- [ ] Stripe webhook nakonfigurovaný

### 🟢 VOLITEĽNÉ (nice-to-have):

- [ ] Google OAuth (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`)
- [ ] Email service (`RESEND_API_KEY`)
- [ ] Redis cache (`REDIS_URL`)
- [ ] AI Chatbot (`OPENAI_API_KEY`)

---

## 🐛 ZNÁME PROBLÉMY A RIEŠENIA

### Problém 1: "Stripe is not defined"

**Príčina:** `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` nie je nastavená  
**Riešenie:** Pridajte premennú do Vercel a redeploy

### Problém 2: "Failed to calculate pricing"

**Príčina:** Beds24 API token nie je nastavený alebo je neplatný  
**Riešenie:** Overte `BEDS24_LONG_LIFE_TOKEN` vo Vercel

### Problém 3: "Database connection error"

**Príčina:** `DATABASE_URL` je neplatná alebo databáza nie je dostupná  
**Riešenie:** Overte connection string a dostupnosť databázy

### Problém 4: "NextAuth configuration error"

**Príčina:** `NEXTAUTH_SECRET` je príliš krátky alebo chýba  
**Riešenie:** Vygenerujte nový secret (min 32 znakov)

---

## 🔗 UŽITOČNÉ ODKAZY

### Vercel
- Dashboard: https://vercel.com/dashboard
- Documentation: https://vercel.com/docs
- Environment Variables: https://vercel.com/docs/environment-variables

### Stripe
- Dashboard: https://dashboard.stripe.com
- API Keys: https://dashboard.stripe.com/apikeys
- Webhooks: https://dashboard.stripe.com/webhooks
- Test Cards: https://stripe.com/docs/testing#cards

### Database Providers
- Vercel Postgres: https://vercel.com/docs/storage/vercel-postgres
- Supabase: https://supabase.com
- Railway: https://railway.app
- Neon: https://neon.tech

### Beds24
- API Documentation: https://beds24.com/api/v2
- Control Panel: https://beds24.com/control3.php

---

## 📞 SUPPORT

### Ak problém pretrváva:

1. **Prečítajte si kompletný guide:**
   - `VERCEL_PRODUCTION_FIX.md` - Detailný návod
   - `VERCEL_QUICK_FIX.md` - Rýchly 5-min návod

2. **Použite debugging tools:**
   ```bash
   # Environment check
   curl https://apartmany-vita.vercel.app/api/test-env
   
   # Production verification
   ./scripts/verify-production.sh https://apartmany-vita.vercel.app
   ```

3. **Skontrolujte logy:**
   - Vercel Dashboard → Deployments → Function Logs
   - Browser Console (F12) → Console tab

4. **Vytvorte GitHub Issue:**
   - Priložte error message
   - Priložte deployment logs
   - Priložte screenshot problému

---

## 🎉 PO VYRIEŠENÍ

Po úspešnom nastavení Vercel produkcie budete môcť:

✅ Vytvárať rezervácie  
✅ Kalkulovať ceny dynamicky z Beds24  
✅ Prijímať platby cez Stripe  
✅ Posielať notifikácie emailom  
✅ Synchronizovať rezervácie s Beds24  

---

## 📝 POZNÁMKY

### Prečo localhost funguje ale Vercel nie?

**Localhost:**
- Používa `.env.local` súbor
- `DATABASE_URL` je definovaná lokálne
- Všetko funguje v development mode

**Vercel:**
- Používa Environment Variables z Vercel Dashboard
- `.env.local` súbor sa NEnahrá (je v `.gitignore`)
- Premenné musia byť nastavené manuálne v Vercel

### Prečo je DATABASE_URL taká dôležitá?

- Prisma ORM ju potrebuje pre pripojenie k databáze
- Bez nej Prisma nemôže inicializovať klienta
- Každý API endpoint ktorý používa databázu zlyhá
- Booking flow potrebuje databázu pre:
  - Načítanie apartmánov
  - Validáciu dostupnosti
  - Uloženie rezervácií
  - Autentifikáciu užívateľov

### Prečo používame validáciu v booking/page.tsx?

- Aby sme zabránili konfúznym Prisma chybám
- Aby sme poskytli jasné error messages
- Aby sme zachytili konfiguračné problémy skôr
- Aby sme mohli gracefully redirectnúť užívateľa

---

**✅ Tento dokument obsahuje všetko čo potrebujete vedieť o produkcii Vercel deployme pre Apartmány Vita!**

**📅 Vytvorené:** 30. September 2025  
**🔄 Posledná aktualizácia:** 30. September 2025  
**📝 Autor:** Cursor AI Assistant  
**🎯 Status:** Ready for deployment
