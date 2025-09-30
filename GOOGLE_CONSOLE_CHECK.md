# 🔧 Google Console Redirect URI Check

## ✅ Environment Variables sú OK!
Všetky potrebné premenné sú správne nastavené vo Vercel:
- GOOGLE_CLIENT_ID ✅
- GOOGLE_CLIENT_SECRET ✅
- NEXTAUTH_SECRET ✅
- NEXTAUTH_URL ✅

## 🎯 PROBLÉM: Google Console Redirect URI

### Krok 1: Choď do Google Cloud Console
https://console.cloud.google.com/apis/credentials

### Krok 2: Nájdi OAuth 2.0 Client
Hľadaj Client ID začínajúci na: `264429027177-...`

### Krok 3: Skontroluj "Authorized redirect URIs"

**MUSÍ TAM BYŤ PRESNE TOTO:**
```
https://apartmany-vita.vercel.app/api/auth/callback/google
```

### Časté chyby (oprav ich!):
- ❌ `http://` → musí byť `https://`
- ❌ trailing slash `/` na konci
- ❌ iná doména
- ❌ chýba úplne

### Krok 4: Pridaj alebo oprav URI
1. Klikni na Client ID
2. V sekcii "Authorized redirect URIs" klikni "ADD URI"
3. Vlož: `https://apartmany-vita.vercel.app/api/auth/callback/google`
4. Klikni **SAVE**
5. Počkaj 1-2 minúty (Google propagation)

### Krok 5: Test
1. Vymaž browser cookies pre `apartmany-vita.vercel.app`
2. Choď na: https://apartmany-vita.vercel.app/auth/signin
3. Klikni "Prihlásenie cez Google"
4. Malo by fungovať! ✅

---

## 🧪 Lokálny test (localhost)

Pre localhost pridaj aj:
```
http://localhost:3000/api/auth/callback/google
```

Potom:
```bash
cd apartmany-vita
pnpm dev
```

Choď na: http://localhost:3000/auth/signin

---

## 📸 Screenshot toho, čo by si mal vidieť:

V Google Console by si mal vidieť:

**Authorized redirect URIs:**
- `https://apartmany-vita.vercel.app/api/auth/callback/google`
- `http://localhost:3000/api/auth/callback/google` (voliteľné pre dev)

**POZOR:** Žiadny trailing slash `/` na konci!
