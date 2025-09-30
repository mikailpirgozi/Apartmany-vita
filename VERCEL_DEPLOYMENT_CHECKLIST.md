# ✅ Vercel Deployment Checklist

## 🎯 Pre-Deployment (Pred nasadením)

### 1. Local Testing
- [ ] Aplikácia funguje na `localhost:3000`
- [ ] Booking flow funguje (výber dátumov → rezervácia → payment)
- [ ] Beds24 API volania fungujú
- [ ] Database connection funguje
- [ ] Stripe test payment funguje

### 2. Environment Variables Preparation
- [ ] Máte pripravené všetky API keys
- [ ] Máte DATABASE_URL od vášho database providera
- [ ] Máte Stripe test keys
- [ ] Máte Beds24 Long Life Token
- [ ] Máte Google OAuth credentials (optional)

### 3. Database Setup
- [ ] PostgreSQL databáza je vytvorená
- [ ] Database je dostupná zvonku (public URL)
- [ ] Prisma migrations sú pripravené
- [ ] Seed data sú pripravené (apartmány)

---

## 🚀 Deployment Steps (Nasadenie)

### 1. Create Vercel Project
```
1. Choďte na vercel.com
2. Kliknite "New Project"
3. Import GitHub repository
4. Vyberte "apartmany-vita"
5. Kliknite "Deploy" (nech prvý deployment zlyhá - to je OK)
```

### 2. Configure Environment Variables

#### 🔴 Kritické (MUST HAVE):
```env
DATABASE_URL=postgresql://user:pass@host:port/db
NEXTAUTH_SECRET=[32+ characters secret]
NEXTAUTH_URL=https://your-app.vercel.app
BEDS24_LONG_LIFE_TOKEN=your_token_here
```

#### 🟡 Dôležité (pre funkčnosť):
```env
# Beds24 Property/Room IDs
BEDS24_PROP_ID_DELUXE=161445
BEDS24_ROOM_ID_DELUXE=357931
BEDS24_PROP_ID_LITE=168900
BEDS24_ROOM_ID_LITE=357932
BEDS24_PROP_ID_DESIGN=227484
BEDS24_ROOM_ID_DESIGN=483027

# Stripe (use test keys first!)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

#### 🟢 Voliteľné:
```env
# Google OAuth
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

# Email
RESEND_API_KEY=...

# AI Chatbot
OPENAI_API_KEY=...
```

### 3. Deploy & Migrate Database
```bash
# Po nastavení environment variables v Vercel
# Spustite migrations na production database:

# Ak používate Vercel Postgres:
vercel env pull
npx prisma migrate deploy

# Ak používate external DB (Supabase, Railway, Neon):
DATABASE_URL="your_production_url" npx prisma migrate deploy
```

### 4. Seed Initial Data
```bash
# Vytvorte seed script alebo manuálne pridajte apartmány
# Príklad pomocou Prisma Studio:
DATABASE_URL="your_production_url" npx prisma studio
```

### 5. Redeploy Application
```
Vercel Dashboard → Deployments → Redeploy
```

---

## 🧪 Post-Deployment Testing (Po nasadení)

### 1. Environment Check
```bash
# Overte že všetky environment variables sú správne
curl https://your-app.vercel.app/api/test-env
```

**Očakávaný výsledok:**
```json
{
  "summary": {
    "status": "READY",
    "criticalIssues": [],
    "readyForBookings": true
  }
}
```

### 2. Manual Testing

#### Homepage
- [ ] https://your-app.vercel.app sa načíta
- [ ] Žiadne JavaScript errors v console
- [ ] Apartment cards sa zobrazujú

#### Apartment Detail Page
- [ ] https://your-app.vercel.app/apartments/deluxe-apartman funguje
- [ ] Obrázky sa načítajú
- [ ] Booking widget je viditeľný

#### Booking Flow
- [ ] Vyberte apartmán
- [ ] Vyberte check-in/check-out dátumy (napr. 2 týždne dopredu)
- [ ] Vyberte 2 dospelých
- [ ] Kliknite "Rezervovať"
- [ ] **KRITICKÉ**: Mali by ste sa dostať na `/booking?apartment=...` stránku
  - ❌ Ak sa vrátite späť → DATABASE_URL problém
  - ✅ Ak sa dostanete na booking form → OK!

#### Pricing Display
- [ ] Booking form zobrazuje ceny
- [ ] Ceny sa načítajú z Beds24
- [ ] Extras sú zobrazené s cenami
- [ ] Total price sa kalkuluje správne

#### Payment Flow (Test Mode)
- [ ] Kliknite "Pokračovať na platbu"
- [ ] Stripe checkout sa otvorí
- [ ] Použite test kartu: `4242 4242 4242 4242`
- [ ] Platba prejde
- [ ] Redirect na confirmation page

### 3. Automated Testing
```bash
# Spustite automated verification
./scripts/verify-production.sh https://your-app.vercel.app
```

**Očakávaný výsledok:**
```
✅ All tests passed!
🎉 Production deployment is working correctly!
```

---

## 🐛 Common Issues & Fixes

### Issue 1: "Database validation error"
**Symptom:** Booking page redirects back to apartment page  
**URL shows:** `?error=pricing&details=...prisma...`

**Fix:**
1. Overte `DATABASE_URL` vo Vercel
2. Musí začínať `postgresql://` alebo `prisma://`
3. Overte že databáza je accessible
4. Redeploy

### Issue 2: "Stripe is not defined"
**Symptom:** Console error: "Stripe is not defined"

**Fix:**
1. Pridajte `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` do Vercel
2. Musí začínať `pk_test_` alebo `pk_live_`
3. Redeploy

### Issue 3: "Failed to calculate pricing"
**Symptom:** Booking page shows "Nedostupné" alebo chyba pri pricing

**Fix:**
1. Overte `BEDS24_LONG_LIFE_TOKEN` vo Vercel
2. Overte `BEDS24_PROP_ID_*` a `BEDS24_ROOM_ID_*`
3. Test Beds24 API: `curl https://your-app.vercel.app/api/beds24/availability?propertyId=161445&checkIn=2025-11-01&checkOut=2025-11-03`
4. Redeploy

### Issue 4: "NextAuth configuration error"
**Symptom:** Cannot sign in / Auth errors

**Fix:**
1. Overte `NEXTAUTH_SECRET` (min 32 characters)
2. Overte `NEXTAUTH_URL` (správna production URL s `https://`)
3. Overte Google OAuth credentials (ak používate)
4. Redeploy

---

## 📊 Monitoring

### Daily Checks
- [ ] Aplikácia sa načíta
- [ ] Booking flow funguje
- [ ] Žiadne error logy vo Vercel

### Weekly Checks
- [ ] Database backups
- [ ] Stripe payments functioning
- [ ] Beds24 sync working
- [ ] No critical errors in Vercel logs

### Monthly Checks
- [ ] Review Vercel usage/costs
- [ ] Update dependencies
- [ ] Security audit
- [ ] Performance optimization

---

## 🔄 CI/CD Pipeline

### Automatic Deploys
- [ ] Push to `main` branch triggers deployment
- [ ] Preview deployments for pull requests
- [ ] Automatic Prisma generation during build

### Manual Deploys
- [ ] Can trigger manual redeploy from Vercel dashboard
- [ ] Can rollback to previous deployment
- [ ] Can promote preview to production

---

## 📱 Production URL Configuration

### Update URLs in Services

#### Beds24
```
Control Panel → Settings → API
Callback URL: https://your-app.vercel.app/api/webhooks/beds24
```

#### Stripe
```
Dashboard → Webhooks
Endpoint URL: https://your-app.vercel.app/api/webhooks/stripe
Events: checkout.session.completed, payment_intent.succeeded
```

#### Google OAuth
```
Google Cloud Console → Credentials
Authorized redirect URIs:
- https://your-app.vercel.app/api/auth/callback/google
```

---

## 🎉 Success Criteria

### Application is production-ready when:
- ✅ All tests pass (`verify-production.sh`)
- ✅ Environment check shows "READY" (`/api/test-env`)
- ✅ Can create booking from start to finish
- ✅ Payments work (test mode)
- ✅ No critical errors in Vercel logs
- ✅ Page load time < 3 seconds
- ✅ Mobile responsive works
- ✅ All apartment pages load
- ✅ Beds24 sync works

---

## 📞 Support Resources

### Documentation
- `VERCEL_PRODUCTION_FIX.md` - Detailed deployment guide
- `VERCEL_QUICK_FIX.md` - Quick 5-minute fix
- `PRODUCTION_ISSUE_SUMMARY.md` - Issue analysis

### Scripts
- `scripts/test-database-connection.js` - Test DATABASE_URL
- `scripts/verify-production.sh` - Verify deployment

### Endpoints
- `/api/test-env` - Environment variables check
- `/api/health` - Health check
- `/api/beds24/test` - Beds24 connection test

### External Links
- [Vercel Dashboard](https://vercel.com/dashboard)
- [Stripe Dashboard](https://dashboard.stripe.com)
- [Beds24 Control Panel](https://beds24.com/control3.php)

---

**✅ Follow this checklist step-by-step for successful Vercel deployment!**

**📅 Last Updated:** September 30, 2025  
**🎯 Version:** 1.0
