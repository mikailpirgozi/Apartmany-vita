# ⚡ VERCEL FIX - ROB TO TERAZ!

## 🚨 PROBLÉM
- ✅ Localhost funguje
- ❌ Vercel produkcia NEFUNGUJE (booking sa redirectne späť)

## 🎯 RIEŠENIE (5 MINÚT)

### Krok 1: Otvorte Vercel Dashboard
```
https://vercel.com/dashboard
```

### Krok 2: Nájdite váš projekt
Kliknite na projekt "apartmany-vita" (alebo ako sa volá)

### Krok 3: Choďte do Environment Variables
```
Settings (v hornom menu)
  ↓
Environment Variables (v ľavom menu)
```

### Krok 4: Skontrolujte DATABASE_URL
- ❓ Vidíte tam `DATABASE_URL`?
- ❓ Je vyplnená (nie prázdna)?

### Krok 5A: Ak DATABASE_URL CHÝBA alebo je PRÁZDNA

#### Option A: Vytvorte Vercel Postgres (NAJRÝCHLEJŠIE)
```
1. V Vercel Dashboard choďte do "Storage" tab (horné menu)
2. Kliknite "Create Database"
3. Vyberte "Postgres"
4. Kliknite "Continue"
5. Vyberte "Hobby" (free)
6. Kliknite "Create"
7. DATABASE_URL sa automaticky nastaví!
```

#### Option B: Použite existujúcu databázu
Ak máte Supabase/Railway/Neon:
```
1. V Vercel: Settings → Environment Variables → Add New
2. Name: DATABASE_URL
3. Value: [Vaša PostgreSQL connection string]
4. Environment: ✅ Production, ✅ Preview
5. Save
```

**Kde nájdem connection string?**
- **Supabase**: Settings → Database → Connection String (Connection Pooling)
- **Railway**: PostgreSQL → Connect → Public URL  
- **Neon**: Dashboard → Connection Details

### Krok 6: Pridajte ďalšie kritické premenné

Ak ich nemáte, pridajte tieto:

```
NEXTAUTH_SECRET=/s5Znc/bvY8mkOGOEC7i8oVnNmPguIOqMpevBWojxqM=
NEXTAUTH_URL=https://apartmany-vita.vercel.app
BEDS24_LONG_LIFE_TOKEN=PhvqHilqz7fKf5HT8Rq3Ks0zCLwrBOlyBfZ/BqyEKt8HfdfJYLRudz2/v2+WoZZdl7DPIyaPsd6nSGVzedFdVhYoFQn/oZTrX9xVrajrkwKBInhZ9fA9VXIRYEagRsVb6oqylGGn+PtnE+qDhNFAvA==
BEDS24_PROP_ID_DELUXE=161445
BEDS24_ROOM_ID_DELUXE=357931
BEDS24_PROP_ID_LITE=168900
BEDS24_ROOM_ID_LITE=357932
BEDS24_PROP_ID_DESIGN=227484
BEDS24_ROOM_ID_DESIGN=483027
```

Stripe (ak máte účet):
```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
```

### Krok 7: Redeploy
```
1. Choďte do "Deployments" tab
2. Kliknite na najnovší deployment (prvý v zozname)
3. Kliknite ... (tri bodky) → "Redeploy"
4. Potvrďte
5. Počkajte 2-3 minúty
```

### Krok 8: TESTUJTE!

Po dokončení deploymentu otvorte:
```
https://apartmany-vita.vercel.app/api/test-env
```

**✅ Ak vidíte:**
```json
{
  "summary": {
    "status": "READY",
    "readyForBookings": true
  }
}
```
→ **HOTOVO!** Booking by mal fungovať!

**❌ Ak vidíte:**
```json
{
  "summary": {
    "status": "NOT_READY",
    "criticalIssues": ["DATABASE_URL is not properly configured"]
  }
}
```
→ DATABASE_URL ešte nie je správne nastavená

---

## 🧪 FINÁLNY TEST

Po úspešnom `/api/test-env`:

1. Choďte na: https://apartmany-vita.vercel.app
2. Vyberte apartmán (Deluxe Apartmán)
3. Vyberte dátumy (napr. 1.11 - 3.11)
4. Kliknite "Rezervovať"
5. ✅ Mali by ste vidieť booking form s cenami!
6. ✅ Mal by ste sa dostať na druhý krok!

---

## 🆘 AK TO STÁLE NEFUNGUJE

1. **Skontrolujte Vercel logs:**
   ```
   Deployments → Najnovší → View Function Logs
   ```

2. **Skontrolujte browser console:**
   ```
   F12 → Console tab
   ```

3. **Overte environment variables:**
   ```
   Settings → Environment Variables
   → Skontrolujte že DATABASE_URL má hodnotu
   → Skontrolujte že začína s 'postgresql://' alebo 'postgres://'
   ```

4. **Spustite diagnostiku:**
   ```bash
   ./scripts/verify-production.sh https://apartmany-vita.vercel.app
   ```

---

**🎯 Hlavný problém: DATABASE_URL musí byť nastavená vo Vercel!**
**⏱️ Trvá to 5 minút ak použijete Vercel Postgres**
**✅ Po nastavení všetko bude fungovať tak ako na localhoste!**
