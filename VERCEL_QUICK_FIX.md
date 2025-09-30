# ⚡ VERCEL QUICK FIX - 5 minút riešenie

## 🚨 Problém: Rezervácia nefunguje na Vercel produkci

### Chyba:
```
Error validating datasource `db`: the URL must start with the protocol 'prisma://' or 'prisma+postgres://'
```

---

## ✅ RÝCHLE RIEŠENIE (5 krokov)

### 1️⃣ Choďte do Vercel Dashboard

```
https://vercel.com/dashboard
→ Vyberte projekt "apartmany-vita"
→ Kliknite "Settings" (hore v menu)
→ Kliknite "Environment Variables" (v ľavom menu)
```

---

### 2️⃣ Pridajte DATABASE_URL

Kliknite **"Add New"** a pridajte:

**Name:**
```
DATABASE_URL
```

**Value:** (vyberte podľa vášho poskytovatela)

#### 🔹 Ak máte Vercel Postgres:
1. Choďte do "Storage" tab
2. Vytvorte Vercel Postgres database
3. Vercel automaticky nastaví `DATABASE_URL`

#### 🔹 Ak máte Supabase:
```
postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres
```
*(Nájdete v Supabase → Settings → Database → Connection String)*

#### 🔹 Ak máte Railway:
```
postgresql://postgres:[PASSWORD]@[HOST].railway.app:[PORT]/railway
```
*(Nájdete v Railway → PostgreSQL → Connect)*

#### 🔹 Ak máte Neon:
```
postgresql://[USER]:[PASSWORD]@ep-xxx-xxx.eu-central-1.aws.neon.tech/neondb?sslmode=require
```
*(Nájdete v Neon → Connection Details)*

**Environment:** Zaškrtnite všetky:
- ✅ Production
- ✅ Preview
- ✅ Development

Kliknite **"Save"**

---

### 3️⃣ Pridajte ostatné kritické premenné

Kliknite **"Add New"** pre každú premennú:

#### NEXTAUTH_SECRET
```
Name: NEXTAUTH_SECRET
Value: [Vygenerujte pomocou: openssl rand -base64 32]
       Alebo použite: https://generate-secret.vercel.app/32
Environment: ✅ Production, ✅ Preview
```

#### NEXTAUTH_URL
```
Name: NEXTAUTH_URL
Value: https://apartmany-vita.vercel.app
Environment: ✅ Production, ✅ Preview
```

#### BEDS24_LONG_LIFE_TOKEN
```
Name: BEDS24_LONG_LIFE_TOKEN
Value: PhvqHilqz7fKf5HT8Rq3Ks0zCLwrBOlyBfZ/BqyEKt8HfdfJYLRudz2/v2+WoZZdl7DPIyaPsd6nSGVzedFdVhYoFQn/oZTrX9xVrajrkwKBInhZ9fA9VXIRYEagRsVb6oqylGGn+PtnE+qDhNFAvA==
Environment: ✅ Production, ✅ Preview
```

#### Beds24 Property/Room IDs
```
BEDS24_PROP_ID_DELUXE=161445
BEDS24_ROOM_ID_DELUXE=357931
BEDS24_PROP_ID_LITE=168900
BEDS24_ROOM_ID_LITE=357932
BEDS24_PROP_ID_DESIGN=227484
BEDS24_ROOM_ID_DESIGN=483027
```

#### Stripe Keys (Pre testovanie použite test keys!)
```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
STRIPE_SECRET_KEY=sk_test_your_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

**Kde získať Stripe keys?**
1. Choďte na: https://dashboard.stripe.com/apikeys
2. Skopírujte "Publishable key" a "Secret key"
3. Pre webhook secret: Dashboard → Webhooks → Add endpoint

---

### 4️⃣ Redeploy aplikáciu

**Option A: Cez Vercel Dashboard**
```
1. Choďte do "Deployments" tab
2. Kliknite na najnovší deployment
3. Kliknite "Redeploy" (tri bodky → Redeploy)
4. Kliknite "Redeploy" (potvrďte)
```

**Option B: Cez Git push**
```bash
git commit --allow-empty -m "Trigger Vercel redeploy with env vars"
git push
```

---

### 5️⃣ Otestujte aplikáciu

```
1. Choďte na: https://apartmany-vita.vercel.app
2. Vyberte apartmán (napr. Deluxe Apartmán)
3. Vyberte dátumy: Check-in a Check-out
4. Vyberte počet hostí: 2 dospelých
5. Kliknite "Rezervovať"
6. ✅ Malo by vás presmerovať na booking page (NEMAL by redirect späť!)
```

---

## 🧪 DEBUG ENDPOINT

Po deploymente otestujte konfiguráciu:

```
https://apartmany-vita.vercel.app/api/test-env
```

**Ak je všetko OK, uvidíte:**
```json
{
  "summary": {
    "status": "READY",
    "criticalIssues": [],
    "readyForBookings": true
  }
}
```

**Ak niečo chýba, uvidíte:**
```json
{
  "summary": {
    "status": "NOT_READY",
    "criticalIssues": [
      "DATABASE_URL is not properly configured"
    ]
  }
}
```

---

## 🔍 AK TO STÁLE NEFUNGUJE

### 1. Skontrolujte Deployment Logs

```
Vercel Dashboard
→ Deployments
→ Najnovší deployment (kliknite naň)
→ "View Function Logs"
```

Hľadajte error messages ako:
```
❌ DATABASE ERROR
❌ Prisma Client initialization failed
❌ Invalid DATABASE_URL
```

### 2. Skontrolujte Browser Console

```
1. Otvorte stránku: https://apartmany-vita.vercel.app
2. Stlačte F12 (Developer Tools)
3. Choďte do "Console" tab
4. Pokúste sa vytvoriť rezerváciu
5. Hľadajte chybové hlášky
```

### 3. Overte Environment Variables

```
Vercel Dashboard
→ Settings
→ Environment Variables
→ Skontrolujte, že všetky premenné sú nastavené
→ Skontrolujte, že nemajú preklepy
```

**Najčastejšie chyby:**
- ❌ `DATABASE_URL` je prázdna
- ❌ `DATABASE_URL` neobsahuje správny protocol
- ❌ `NEXTAUTH_SECRET` je príliš krátky (min 32 znakov)
- ❌ `NEXTAUTH_URL` má `http://` namiesto `https://`
- ❌ Stripe keys majú zamenené test/live keys

---

## 📋 CHECKLIST

Skontrolujte, že máte všetko nastavené:

### Kritické (bez týchto nefunguje nič):
- [ ] `DATABASE_URL` - PostgreSQL connection string
- [ ] `NEXTAUTH_SECRET` - Min 32 znakov
- [ ] `NEXTAUTH_URL` - https://apartmany-vita.vercel.app
- [ ] `BEDS24_LONG_LIFE_TOKEN` - API token

### Dôležité (pre funkčnosť rezervácií):
- [ ] `BEDS24_PROP_ID_*` - Property IDs (3x)
- [ ] `BEDS24_ROOM_ID_*` - Room IDs (3x)
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key
- [ ] `STRIPE_SECRET_KEY` - Stripe secret key
- [ ] `STRIPE_WEBHOOK_SECRET` - Stripe webhook secret

### Voliteľné (nice-to-have):
- [ ] `GOOGLE_CLIENT_ID` - Google OAuth
- [ ] `GOOGLE_CLIENT_SECRET` - Google OAuth
- [ ] `RESEND_API_KEY` - Email service
- [ ] `OPENAI_API_KEY` - AI Chatbot

---

## 💡 PRO TIPS

### Tip 1: Použite Vercel CLI pre testovanie
```bash
# Nainštalujte Vercel CLI
npm i -g vercel

# Stiahnite production environment variables
vercel env pull .env.production

# Testujte lokálne s production env vars
vercel dev --env=production
```

### Tip 2: Duplikujte production env vars do preview
```bash
# V Vercel Dashboard môžete skopírovať všetky
# production env vars do preview environment
# kliknutím na "..." → "Copy to Preview"
```

### Tip 3: Používajte Vercel Postgres (najjednoduchšie)
```
1. Vercel Dashboard → Storage → Create Database → Postgres
2. Vercel automaticky nastaví DATABASE_URL
3. Profit! ✅
```

---

## 🆘 HELP

Ak problém pretrváva aj po týchto krokoch:

1. **Otvorte GitHub Issue:**
   ```
   https://github.com/[your-repo]/issues/new
   Priložte:
   - Deployment logs z Vercel
   - Browser console errors
   - Screenshots problému
   ```

2. **Overte dokumentáciu:**
   - Prečítajte si kompletný guide: `VERCEL_PRODUCTION_FIX.md`
   - Skontrolujte Prisma schema: `prisma/schema.prisma`

---

## ✅ ÚSPECH!

Ak vidíte tento flow:
```
1. Vyberte apartmán ✅
2. Vyberte dátumy ✅
3. Kliknite "Rezervovať" ✅
4. Presmerovanie na /booking?apartment=... ✅
5. Vidíte booking form s cenami ✅
6. Môžete pokračovať na platbu ✅
```

**🎉 Gratulujeme! Aplikácia funguje správne!**

---

**⚡ Toto riešenie zaberie max 5 minút, ak máte všetky credentials pripravené!**
