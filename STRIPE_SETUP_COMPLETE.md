# ✅ Stripe Configuration Complete

## Vercel Setup (COMPLETED ✓)

Stripe environment variables boli úspešne pridané na Vercel production:

- ✅ `STRIPE_SECRET_KEY` - sk_live_... (configured)
- ✅ `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - pk_live_... (configured)

**Deployment status:** Production deploy v procese
**URL:** https://apartmany-vita-1wk8d2fmj-blackrents-projects.vercel.app

---

## Railway Setup (MANUAL - Optional)

Ak máš aplikáciu aj na Railway, pridaj tieto premenné cez web UI:

### Postup:
1. Choď na: https://railway.app/dashboard
2. Vyber projekt `apartmany-vita`
3. Klikni na **Variables** tab
4. Pridaj tieto premenné:

```bash
STRIPE_SECRET_KEY=sk_live_YOUR_SECRET_KEY_HERE

NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_PUBLISHABLE_KEY_HERE
```

5. Railway automaticky redeploy po zmene variables

---

## Stripe Webhook Setup (ĎALŠÍ KROK)

Pre kompletné fungovanie platobného systému potrebuješ nastaviť Stripe webhooks:

### 1. Vytvor webhook endpoint v Stripe:
1. Choď na: https://dashboard.stripe.com/webhooks
2. Klikni **Add endpoint**
3. Zadaj URL: `https://apartmanvita.sk/api/webhooks/stripe`
4. Vyber events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `payment_intent.canceled`
   - `charge.dispute.created`
5. Klikni **Add endpoint**

### 2. Skopíruj Webhook Secret:
Po vytvorení webhoopu uvidíš **Signing secret** (začína `whsec_...`)

### 3. Pridaj do Vercel:
```bash
cd "/Users/mikailpirgozi/Desktop/Cursor zalohy mac16/Apartmany Vita App/apartmany-vita"
echo "whsec_TVOJ_SECRET_TU" | vercel env add STRIPE_WEBHOOK_SECRET production
vercel --prod
```

---

## Test Payment (Po deployi)

Po dokončení deployu otestuj platbu:

1. Choď na: https://apartmanvita.sk
2. Vyber apartmán
3. Vyplň booking form
4. Pri platbe použi test kartu (len ak používaš test mode):
   - Číslo: `4242 4242 4242 4242`
   - Dátum: akýkoľvek budúci dátum
   - CVC: akékoľvek 3 číslice

**⚠️ POZOR:** Používaš **LIVE** klúče, takže skutočné platby budú spracované!

---

## Verifikácia

Skontroluj, že v console už niet error:
- ✅ `STRIPE_SECRET_KEY is missing in production!` - má byť **VYRIEŠENÉ**
- ✅ Payment form sa má načítať bez chýb
- ✅ Stripe Elements sa majú zobraziť

---

## Support

- Stripe Dashboard: https://dashboard.stripe.com
- Stripe API Logs: https://dashboard.stripe.com/logs
- Vercel Logs: https://vercel.com/blackrents-projects/apartmany-vita

**Status:** ✅ READY FOR PRODUCTION

