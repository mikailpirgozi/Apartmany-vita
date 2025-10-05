# 🔧 Stripe Tax Configuration Fix

**Dátum:** 5. október 2025  
**Problém:** Platby cez Stripe zlyhávali s chybou "Failed to create checkout session"

## 🔍 Identifikované problémy

### 1. **Stripe Tax bol vypnutý**
```typescript
// ❌ PRED - Tax vypnutý
automatic_tax: {
  enabled: false, // Disabled until Stripe Tax is fully configured
}
```

**Dôsledok:** Stripe Tax bol nastavený v dashboarde na 5%, ale v kóde vypnutý, čo spôsobovalo konflikt s `tax_code`.

### 2. **Chýbajúca validácia Stripe API keys**
Aplikácia nevykonávala žiadnu validáciu či sú Stripe API keys správne nastavené pred vytvorením checkout session.

### 3. **Slabý error logging**
Stripe chyby neboli dostatočne logované, takže nebolo možné identifikovať presnú príčinu problému.

### 4. **Nesprávny base URL**
```typescript
// ❌ PRED - URL s www. prefixom
const baseUrl = 'https://www.apartmanvita.sk';
```

## ✅ Implementované riešenia

### 1. **Zapnutie Stripe Tax** ✅
```typescript
// ✅ PO - Tax zapnutý
automatic_tax: {
  enabled: true, // ✅ ENABLED - Stripe Tax is configured for 5% VAT
}
```

**Podľa [Stripe dokumentácie](https://docs.stripe.com/tax/set-up#integrate):**
> For any low-code products (Checkout, Invoicing, Subscriptions, Quotes and Payment Links), add the tax parameter: `automatic_tax[enabled]=true`

### 2. **Validácia Stripe API keys** ✅
```typescript
// Validate Stripe API key
if (!stripeSecretKey || stripeSecretKey === 'sk_test_dummy_key_for_build') {
  console.error('❌ STRIPE_SECRET_KEY is not configured!');
  throw new Error('Stripe is not properly configured. Please contact support.');
}
```

### 3. **Vylepšený error logging** ✅
```typescript
// Enhanced Stripe error logging
if (error && typeof error === 'object') {
  if ('type' in error) {
    const stripeError = error as { 
      type: string; 
      message: string; 
      code?: string; 
      param?: string;
      raw?: unknown;
    };
    console.error('🔴 Stripe Error Details:', {
      type: stripeError.type,
      message: stripeError.message,
      code: stripeError.code,
      param: stripeError.param,
      rawError: JSON.stringify(stripeError.raw || {})
    });
    
    // Return more specific error message
    throw new Error(`Stripe Error: ${stripeError.message} (${stripeError.code || stripeError.type})`);
  }
  
  // Log full error object for debugging
  console.error('🔴 Full error object:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
}
```

### 4. **Opravený base URL** ✅
```typescript
// ✅ PO - URL s www. prefixom (produkčná doména)
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXTAUTH_URL || 'https://www.apartmanvita.sk';
```

## 📝 Zmenené súbory

### 1. `/src/lib/stripe.ts`
- ✅ Zapnutý `automatic_tax.enabled = true`
- ✅ Pridaná validácia Stripe API keys
- ✅ Vylepšený error logging s detailnými Stripe chybami
- ✅ Opravený base URL (bez www.)
- ✅ Pridané logovanie Stripe key prefixu pre debugging

### 2. `/src/app/api/payments/create-intent/route.ts`
- ✅ Vylepšený error handling pre Stripe chyby
- ✅ Pridané detailné logovanie všetkých error typov
- ✅ Lepšie error messages pre frontend

## 🧪 Testovanie

### Pred deployom overte:

1. **Stripe Dashboard nastavenia:**
   - [ ] Stripe Tax je aktivovaný
   - [ ] Tax rate je nastavený na 5% pre Slovensko
   - [ ] Tax code `txcd_20030000` (General Services) je povolený
   - [ ] Origin address je nastavená (Slovensko)

2. **Environment variables:**
   ```bash
   STRIPE_SECRET_KEY=sk_live_... (alebo sk_test_...)
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_... (alebo pk_test_...)
   STRIPE_WEBHOOK_SECRET=whsec_...
   NEXT_PUBLIC_BASE_URL=https://www.apartmanvita.sk
   ```

3. **Test booking flow:**
   - [ ] Vyber apartmán a dátumy
   - [ ] Vyplň kontaktné údaje
   - [ ] Klikni na "Pokračovať na platbu"
   - [ ] Skontroluj logy - mali by sa zobraziť:
     ```
     🔧 Creating Stripe Checkout Session: { amount: ..., bookingId: ..., ... }
     ✅ Stripe Checkout Session created: { sessionId: ..., url: ..., hasUrl: true }
     ```
   - [ ] Presmerovanie na Stripe Checkout by malo fungovať
   - [ ] Na Stripe Checkout stránke by mala byť viditeľná DPH (5%)

## 🔗 Dokumentácia

- [Stripe Tax Setup](https://docs.stripe.com/tax/set-up#integrate)
- [Stripe Tax Custom Integration](https://docs.stripe.com/tax/custom)
- [Stripe Tax Codes](https://stripe.com/docs/tax/tax-categories)

## 🚀 Deploy

Po deployi na Railway/Vercel:

1. **Skontroluj logy:**
   ```bash
   # Railway
   railway logs --service apartmany-vita
   
   # Vercel
   vercel logs
   ```

2. **Hľadaj tieto log messages:**
   - `🔧 Stripe Configuration:` - potvrdí že Stripe keys sú načítané
   - `🔧 Creating Stripe Checkout Session:` - potvrdí že sa vytvára session
   - `✅ Stripe Checkout Session created:` - potvrdí úspech
   - Ak vidíš `🔴 Stripe Error Details:` - skontroluj detaily chyby

## 📊 Očakávané výsledky

### ✅ Úspešný flow:
```
📤 Sending payment data: { amount: 896.75, ... }
🔧 Creating Stripe Checkout Session: { amount: 896.75, bookingId: ..., ... }
✅ Stripe Checkout Session created: { sessionId: cs_..., url: https://checkout.stripe.com/..., hasUrl: true }
→ Redirect to Stripe Checkout
```

### ❌ Ak stále zlyhá:
Logy teraz budú obsahovať presné detaily:
```
🔴 Stripe Error Details: {
  type: "...",
  message: "...",
  code: "...",
  param: "...",
  rawError: "..."
}
```

## 🎯 Next Steps

Ak platba stále nefunguje po deployi:

1. Skontroluj Stripe Dashboard → Tax settings
2. Overte že máš správne environment variables
3. Pozri sa na detailné logy (teraz budú obsahovať všetky info)
4. Skontroluj či je Stripe account v test alebo live mode

---

**Status:** ✅ Implementované, čaká na deploy a testing
