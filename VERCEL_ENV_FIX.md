# 🔧 Vercel Environment Variables - Manual Fix

## Problém
Stripe keys majú newline character (`\n`) na konci, čo spôsobuje `StripeConnectionError`.

## Riešenie - Nastav manuálne cez Vercel Dashboard

### Krok 1: Otvor Vercel Dashboard
1. Choď na: https://vercel.com/blackrents-projects/apartmany-vita/settings/environment-variables
2. Alebo: Vercel Dashboard → Projekt "apartmany-vita" → Settings → Environment Variables

### Krok 2: Odstráň staré premenné
Pre každú z týchto premenných klikni na **3 bodky** → **Delete**:
- `STRIPE_SECRET_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_WEBHOOK_SECRET`

### Krok 3: Pridaj nové premenné (POZOR: Bez Enter na konci!)

#### A) STRIPE_SECRET_KEY
1. Klikni **Add New**
2. **Name:** `STRIPE_SECRET_KEY`
3. **Value:** Vlož svoj Stripe Secret Key (začína `sk_live_...`)
   - ⚠️ Skopíruj ho zo Stripe Dashboard: https://dashboard.stripe.com/apikeys
   - Uisti sa že **NIE JE** žiadna medzera ani Enter na konci
4. **Environment:** Vyber **Production**
5. ⚠️ **DÔLEŽITÉ:** Po vložení hodnoty **NESTLÁČAJ ENTER**! Klikni priamo na **Save**

#### B) NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
1. Klikni **Add New**
2. **Name:** `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
3. **Value:** Vlož svoj Stripe Publishable Key (začína `pk_live_...`)
   - ⚠️ Skopíruj ho zo Stripe Dashboard: https://dashboard.stripe.com/apikeys
   - Uisti sa že **NIE JE** žiadna medzera ani Enter na konci
4. **Environment:** Vyber **Production**
5. ⚠️ **NESTLÁČAJ ENTER**! Klikni na **Save**

#### C) STRIPE_WEBHOOK_SECRET
1. Klikni **Add New**
2. **Name:** `STRIPE_WEBHOOK_SECRET`
3. **Value:** Vlož svoj Stripe Webhook Secret (začína `whsec_...`)
   - ⚠️ Skopíruj ho zo Stripe Dashboard: https://dashboard.stripe.com/webhooks
   - Uisti sa že **NIE JE** žiadna medzera ani Enter na konci
4. **Environment:** Vyber **Production**
5. ⚠️ **NESTLÁČAJ ENTER**! Klikni na **Save**

### Krok 4: Redeploy
1. Choď do **Deployments** tabu
2. Klikni na najnovší deployment
3. Klikni na **3 bodky** → **Redeploy**
4. Vyber **Use existing Build Cache: NO** (vyčistiť cache)
5. Klikni **Redeploy**

### Krok 5: Over
Po dokončení deploymentu (2-3 minúty) otvor:
```
https://www.apartmanvita.sk/api/debug/stripe-config
```

Mali by si vidieť:
```json
{
  "stripeSecretKey": {
    "suffix": "...oFa"  // ✅ BEZ \n
  },
  "stripeConnection": {
    "status": "✅ Connected"
  }
}
```

## Prečo CLI nefunguje?
Vercel CLI má bug kde `<<<` a `echo |` pridávajú newline do hodnoty. Jediný spoľahlivý spôsob je **manuálne cez Dashboard**.
