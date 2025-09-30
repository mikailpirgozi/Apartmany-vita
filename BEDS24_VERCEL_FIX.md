# 🔧 BEDS24 AUTHENTICATION FIX - Vercel

## 🚨 PROBLÉM
```
Beds24 Authentication failed - invalid API credentials
```

## ✅ RIEŠENIE

Vo Vercel Dashboard skontrolujte a pridajte tieto premenné:

### Krok 1: Choďte do Environment Variables
```
https://vercel.com/dashboard
→ Váš projekt
→ Settings
→ Environment Variables
```

### Krok 2: Skontrolujte/Pridajte VŠETKY tieto premenné:

```
BEDS24_LONG_LIFE_TOKEN=PhvqHilqz7fKf5HT8Rq3Ks0zCLwrBOlyBfZ/BqyEKt8HfdfJYLRudz2/v2+WoZZdl7DPIyaPsd6nSGVzedFdVhYoFQn/oZTrX9xVrajrkwKBInhZ9fA9VXIRYEagRsVb6oqylGGn+PtnE+qDhNFAvA==

BEDS24_PROP_ID_DELUXE=161445
BEDS24_ROOM_ID_DELUXE=357931

BEDS24_PROP_ID_LITE=168900
BEDS24_ROOM_ID_LITE=357932

BEDS24_PROP_ID_DESIGN=227484
BEDS24_ROOM_ID_DESIGN=483027
```

**Environment pre každú:** ✅ Production, ✅ Preview

### Krok 3: Redeploy
```
Deployments → Redeploy
```

---

## 🧪 AKO OTESTOVAŤ

Po redeploy:
```
https://apartmany-vita.vercel.app/apartments/deluxe-apartman
→ Kalendár by sa mal načítať
→ Ceny by sa mali zobraziť
→ Dostupnosť by mala byť viditeľná
```
