# 🔴 Stripe Connection Error - Diagnostika a riešenie

**Dátum:** 5. október 2025  
**Chyba:** `StripeConnectionError: An error occurred with our connection to Stripe. Request was retried 2 times.`

## 🔍 Príčina problému

Táto chyba znamená že aplikácia **sa nemôže pripojiť k Stripe API**. Najčastejšie dôvody:

1. ❌ **Stripe API key nie je nastavený** v production environment
2. ❌ **Stripe API key je neplatný** (nesprávny formát)
3. ❌ **Stripe API key je expirovaný** alebo revoknutý
4. ❌ **Používa sa dummy key** (`sk_test_dummy_key_for_build`)
5. ❌ **Firewall blokuje prístup** k Stripe API (menej pravdepodobné)

## 🛠️ Diagnostika

### Krok 1: Skontroluj Stripe konfiguráciu

Po deployi navštív:
```
https://www.apartmanvita.sk/api/debug/stripe-config
```

Tento endpoint ti ukáže:
- ✅ Či sú Stripe keys nastavené
- ✅ Formát keys (test vs live)
- ✅ Či sa aplikácia dokáže pripojiť k Stripe API
- ⚠️ Všetky varovania a problémy

**Príklad výstupu:**
```json
{
  "timestamp": "2025-10-05T...",
  "environment": "production",
  "stripeSecretKey": {
    "exists": true,
    "prefix": "sk_live_",
    "isTest": false,
    "isLive": true,
    "isDummy": false
  },
  "stripeConnection": {
    "status": "✅ Connected",
    "message": "Successfully connected to Stripe API"
  },
  "warnings": []
}
```

### Krok 2: Skontroluj Railway/Vercel environment variables

#### Railway:
```bash
railway variables --service apartmany-vita
```

Alebo v Railway Dashboard:
1. Otvor projekt
2. Choď do **Variables**
3. Skontroluj:
   - `STRIPE_SECRET_KEY`
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - `STRIPE_WEBHOOK_SECRET`

#### Vercel:
```bash
vercel env ls
```

Alebo v Vercel Dashboard:
1. Otvor projekt
2. Choď do **Settings → Environment Variables**
3. Skontroluj rovnaké premenné

## ✅ Riešenie

### 1. Získaj Stripe API keys

1. **Prihlás sa do Stripe Dashboard:**
   - Test mode: https://dashboard.stripe.com/test/apikeys
   - Live mode: https://dashboard.stripe.com/apikeys

2. **Skopíruj keys:**
   - **Secret key:** `sk_live_...` (alebo `sk_test_...` pre testing)
   - **Publishable key:** `pk_live_...` (alebo `pk_test_...` pre testing)

3. **Webhook secret** (ak ešte nemáš):
   - Choď do: https://dashboard.stripe.com/webhooks
   - Klikni na webhook endpoint alebo vytvor nový
   - Skopíruj **Signing secret**: `whsec_...`

### 2. Nastav environment variables

#### Railway:
```bash
# Secret key (POZOR: Toto je citlivé!)
railway variables set STRIPE_SECRET_KEY=sk_live_TVOJ_KEY_TU

# Publishable key (verejný)
railway variables set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_TVOJ_KEY_TU

# Webhook secret
railway variables set STRIPE_WEBHOOK_SECRET=whsec_TVOJ_SECRET_TU
```

#### Vercel:
```bash
# Production
vercel env add STRIPE_SECRET_KEY production
vercel env add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY production
vercel env add STRIPE_WEBHOOK_SECRET production

# Preview (optional)
vercel env add STRIPE_SECRET_KEY preview
vercel env add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY preview
vercel env add STRIPE_WEBHOOK_SECRET preview
```

Alebo cez Dashboard:
1. **Settings → Environment Variables**
2. Klikni **Add New**
3. Zadaj:
   - **Name:** `STRIPE_SECRET_KEY`
   - **Value:** `sk_live_...`
   - **Environment:** Production
4. Opakuj pre ostatné premenné

### 3. Redeploy aplikáciu

#### Railway:
```bash
railway up
```
Alebo v Railway Dashboard klikni **Redeploy**

#### Vercel:
```bash
vercel --prod
```
Alebo v Vercel Dashboard klikni **Redeploy**

### 4. Over že to funguje

Po redeployi:

1. **Skontroluj diagnostic endpoint:**
   ```
   https://www.apartmanvita.sk/api/debug/stripe-config
   ```
   
   Mali by si vidieť:
   ```json
   {
     "stripeConnection": {
       "status": "✅ Connected"
     },
     "warnings": []
   }
   ```

2. **Testuj booking flow:**
   - Vyber apartmán
   - Vyplň údaje
   - Klikni "Pokračovať na platbu"
   - Mal by si sa dostať na Stripe Checkout

## 🔐 Bezpečnosť

### ⚠️ NIKDY nezdieľaj:
- ❌ `STRIPE_SECRET_KEY` - toto je **tajné**, nikdy to nedávaj do gitu!
- ❌ `STRIPE_WEBHOOK_SECRET` - toto je tiež **tajné**

### ✅ Môžeš zdieľať:
- ✅ `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - toto je **verejné** (začína `pk_`)

### 🔒 Best practices:
1. Používaj **test keys** (`sk_test_`, `pk_test_`) počas vývoja
2. Používaj **live keys** (`sk_live_`, `pk_live_`) len v produkcii
3. Nikdy nedávaj secret keys do git repozitára
4. Pravidelne rotuj API keys (každých 6-12 mesiacov)

## 📊 Kontrolný checklist

Po nastavení over:

- [ ] `STRIPE_SECRET_KEY` je nastavený v production environment
- [ ] Key začína `sk_live_` (alebo `sk_test_` pre testing)
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` je nastavený
- [ ] Key začína `pk_live_` (alebo `pk_test_` pre testing)
- [ ] `STRIPE_WEBHOOK_SECRET` je nastavený (začína `whsec_`)
- [ ] Aplikácia bola redeploynutá po nastavení variables
- [ ] `/api/debug/stripe-config` ukazuje "✅ Connected"
- [ ] Booking flow funguje a presmeruje na Stripe Checkout

## 🆘 Ak stále nefunguje

1. **Skontroluj logy:**
   ```bash
   railway logs --service apartmany-vita --follow
   # alebo
   vercel logs --follow
   ```

2. **Hľadaj tieto správy:**
   - `🔧 Stripe Configuration:` - potvrdí že keys sú načítané
   - `❌ STRIPE_SECRET_KEY is not configured!` - keys chýbajú
   - `🔴 Stripe Error Details:` - detaily Stripe chyby

3. **Over Stripe Dashboard:**
   - Choď na https://dashboard.stripe.com/apikeys
   - Skontroluj že keys nie sú revoknuté
   - Skontroluj že máš správny mode (test vs live)

4. **Kontaktuj support:**
   - Pošli screenshot z `/api/debug/stripe-config`
   - Pošli logy z Railway/Vercel
   - Uveď presný error message

## 📚 Súvisiace dokumenty

- `STRIPE_TAX_FIX.md` - Stripe Tax konfigurácia
- `STRIPE_SETUP_COMPLETE.md` - Kompletný Stripe setup
- `env.template` - Príklad environment variables

---

**Status:** Čaká na nastavenie Stripe API keys v production
