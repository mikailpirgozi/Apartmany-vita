# 🧾 Stripe Tax Setup - Automatické DPH pre Ubytovanie (5%)

## ✅ Implementované zmeny

### 1. **Stripe Checkout Session s automatickým DPH**
- ✅ Pridaná funkcia `createCheckoutSession()` v `src/lib/stripe.ts`
- ✅ Automatické počítanie 5% DPH pre ubytovanie
- ✅ Tax code: `txcd_20030000` (General Services - for accommodation)

### 2. **API Endpoints**
- ✅ `/api/payments/create-intent` - vytvorí Stripe Checkout Session
- ✅ `/api/payments/verify-session` - overí platbu po návrate zo Stripe

### 3. **Redirect Pages**
- ✅ `/booking/success` - úspešná platba
- ✅ `/booking/cancel` - zrušená platba

### 4. **Payment Flow**
```
Booking Form → Payment Form → Stripe Checkout (redirect) → Success/Cancel Page
```

---

## 🔧 Nastavenie Stripe Dashboard

### Krok 1: Povolenie Stripe Tax
1. Choď do [Stripe Dashboard → Tax](https://dashboard.stripe.com/tax)
2. Klikni **"Get started"**
3. Nastav **Origin Address** (tvoja adresa firmy na Slovensku)

### Krok 2: Nastavenie Tax Code
1. Choď do **Settings → Tax settings**
2. **Preset product tax code:** Vyber `txcd_20030000` (General Services)
3. **Include tax in prices:** Nastav na **"Inclusive"** (DPH je zahrnuté v cene)

### Krok 3: Pridanie Slovenskej registrácie
1. Choď do **Tax → Registrations**
2. Klikni **"Add registration"**
3. Vyber **Slovakia**
4. Zadaj svoje DIČ (ak máš)
5. Klikni **"Start collecting"**

### Krok 4: Overenie nastavenia
1. Choď do **Tax → Settings**
2. Skontroluj:
   - ✅ **"Use automatic tax"** je zapnuté
   - ✅ **"Checkout"** je povolený
   - ✅ Slovakia je v registráciách

---

## 📊 Ako funguje automatické DPH?

### Príklad výpočtu:
```
Cena apartmánu: 100 €
DPH (5%):       +5 €
─────────────────────
CELKOM:        105 €
```

### Tax Code pre ubytovanie:
- **`txcd_20030000`** = General Services (includes accommodation services)
- Stripe automaticky aplikuje **5% DPH** pre Slovensko
- DPH sadzba sa automaticky aktualizuje pri zmene zákonov

---

## 🚀 Testing (Testovanie platby)

### Test Card Numbers (Stripe test mode):
```
Úspešná platba:  4242 4242 4242 4242
Zamietnutá:      4000 0000 0000 0002
3D Secure:       4000 0027 6000 3184

Expiry: Akýkoľvek budúci dátum (napr. 12/25)
CVC: Akékoľvek 3 čísla (napr. 123)
```

### Test Flow:
1. Spusti aplikáciu: `pnpm dev`
2. Vytvor rezerváciu
3. V platobnom formulári budeš redirectovaný na Stripe
4. Použi test kartu `4242 4242 4242 4242`
5. Stripe automaticky pripočíta 5% DPH
6. Po úspešnej platbe budeš presmerovaný na `/booking/success`

---

## 🌍 Environment Variables

Pridaj do `.env.local`:
```env
# Base URL pre Stripe redirects
NEXT_PUBLIC_BASE_URL="http://localhost:3000"  # Development
# NEXT_PUBLIC_BASE_URL="https://apartmanvita.sk"  # Production

# Stripe Keys
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
```

Pre Railway (production):
```bash
railway variables set NEXT_PUBLIC_BASE_URL=https://apartmanvita.sk
```

---

## 📝 Stripe Webhook (Voliteľné - pre production)

### Setup Webhook:
1. Choď do [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/webhooks)
2. Klikni **"Add endpoint"**
3. URL: `https://apartmanvita.sk/api/webhooks/stripe`
4. Events:
   - ✅ `checkout.session.completed`
   - ✅ `payment_intent.succeeded`
   - ✅ `payment_intent.payment_failed`

5. Skopíruj **Webhook Secret** a pridaj do env:
```env
STRIPE_WEBHOOK_SECRET="whsec_..."
```

---

## 🔍 Ako overiť, že DPH funguje?

### 1. V Stripe Dashboard:
- Choď do **Payments** → klikni na platbu
- Vidíš **"Tax"** sekciu s 5% DPH
- Príklad:
  ```
  Subtotal:  €100.00
  Tax (5%):   €5.00
  Total:    €105.00
  ```

### 2. V aplikácii:
- Na success page vidíš rozdelenie:
  - Suma bez DPH
  - DPH (5%)
  - Celková suma

---

## 🛠️ Troubleshooting

### Problém: DPH sa nepočíta
**Riešenie:**
1. Skontroluj, že v Stripe Dashboard je **"Use automatic tax"** zapnuté
2. Overy, že máš pridanú Slovakia registráciu
3. Skontroluj tax code v kóde: `txcd_20030000`

### Problém: Redirect nefunguje
**Riešenie:**
1. Skontroluj `NEXT_PUBLIC_BASE_URL` v `.env.local`
2. Overy, že URL je správna (http/https)
3. Pre localhost použi `http://localhost:3000`

### Problém: 404 po návrate zo Stripe
**Riešenie:**
1. Skontroluj, že stránky `/booking/success` a `/booking/cancel` existujú
2. Reštartuj dev server: `pnpm dev`

---

## 📚 Dokumentácia

- [Stripe Tax Documentation](https://docs.stripe.com/tax)
- [Stripe Checkout with Tax](https://docs.stripe.com/tax/checkout)
- [Tax Codes List](https://docs.stripe.com/tax/tax-categories)

---

## ✅ Checklist pred launch

- [ ] Stripe Tax zapnuté v Dashboard
- [ ] Slovakia registrácia pridaná
- [ ] Tax code `txcd_20030000` (General Services) nastavený
- [ ] Include tax in prices: "Inclusive" (ak ceny obsahujú DPH) alebo "Exclusive" (ak DPH sa pripočíta)
- [ ] `NEXT_PUBLIC_BASE_URL` správne nastavená
- [ ] Webhook endpoint vytvorený (production)
- [ ] Test platba s 5% DPH funguje
- [ ] Success/Cancel pages fungujú
- [ ] Email potvrdenie obsahuje DPH

---

## 🎉 Výsledok

**Pred:**
- Cena: 100€ (bez DPH rozdelenia)

**Po:**
- Cena apartmánu: 100€
- **DPH (5%): +5€**
- **Celkom: 105€**
- Automatické počítanie
- Právne v súlade s SK zákonmi
- Stripe sa postará o zmeny v sadzbách

---

**Poznámky:**
- DPH sa automaticky aktualizuje pri zmene zákonov
- Stripe poskytuje tax reporty pre daňové priznanie
- Zákazník vidí rozdelenie DPH na faktúre


