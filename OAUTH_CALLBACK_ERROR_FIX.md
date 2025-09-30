# 🚨 OAuth Callback Error - KRITICKÁ OPRAVA

## Problém
Google OAuth vracia error "Callback" - to znamená, že Google presmeroval späť, ale NextAuth callback zlyhal.

## ✅ Možné príčiny

### 1️⃣ Chýbajúce Environment Variables vo Vercel
**CRITICAL:** Tieto musia byť nastavené vo Vercel!

```bash
NEXTAUTH_URL=https://apartmany-vita.vercel.app
NEXTAUTH_SECRET=<32-character-random-string>
GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CLIENT_SECRET=<your-google-client-secret>
DATABASE_URL=<your-database-url>
DIRECT_DATABASE_URL=<your-direct-database-url>
```

### 2️⃣ Nesprávny Google OAuth Redirect URI
V Google Cloud Console **MUSÍ BYŤ PRESNE**:
```
https://apartmany-vita.vercel.app/api/auth/callback/google
```

❌ **NIE:**
- `http://` (musí byť https)
- `/callback/google/` (bez trailing slash)
- Iná doména

### 3️⃣ Database Connection Issue
PrismaAdapter potrebuje zapísať Account record do DB. Ak DB connection zlyhá, callback zlyhá.

## 🔧 RIEŠENIE - Krok za krokom

### Step 1: Vygeneruj NEXTAUTH_SECRET
```bash
openssl rand -base64 32
```
Skopíruj output (napr.: `XwJnUUA7YS9aHRIBFPhVWiIEBlb/+whEpT0SRe7m5IW=`)

### Step 2: Pridaj Environment Variables vo Vercel

1. Choď na: https://vercel.com/dashboard
2. Vyber projekt **apartmany-vita**
3. **Settings** → **Environment Variables**
4. Pridaj tieto premenné (Environment: **Production**):

| Variable | Value |
|----------|-------|
| `NEXTAUTH_URL` | `https://apartmany-vita.vercel.app` |
| `NEXTAUTH_SECRET` | `<tvoj-vygenerovaný-secret>` |
| `GOOGLE_CLIENT_ID` | `<z-google-console>` |
| `GOOGLE_CLIENT_SECRET` | `<z-google-console>` |
| `DATABASE_URL` | `<tvoja-postgres-url>` |
| `DIRECT_DATABASE_URL` | `<tvoja-postgres-url>` |

5. Klikni **Save**
6. **REDEPLOY** je POVINNÝ po pridaní env vars!

### Step 3: Skontroluj Google Cloud Console

1. Choď na: https://console.cloud.google.com/apis/credentials
2. Vyber tvoj OAuth 2.0 Client ID
3. **Authorized redirect URIs** - over že tam je:
   ```
   https://apartmany-vita.vercel.app/api/auth/callback/google
   ```
4. Ak nie je, pridaj a **Save**

### Step 4: Redeploy Vercel
Po pridaní env vars:
```bash
git commit --allow-empty -m "trigger redeploy after env vars"
git push
```

ALebo v Vercel dashboarde:
**Deployments** → najnovší deployment → **...** → **Redeploy**

## 🧪 Test

Po redeploy (2-3 minúty):
1. Vymaž browser cookies pre `apartmany-vita.vercel.app`
2. Choď na: https://apartmany-vita.vercel.app/auth/signin
3. Klikni "Prihlásenie cez Google"
4. **Malo by fungovať!**

## 🔍 Debugging

### Skontroluj Vercel Logs
```bash
vercel logs apartmany-vita --production
```

### Časté chyby:

#### "Configuration" error
- ❌ Chýba `NEXTAUTH_SECRET`
- ❌ Chýba `GOOGLE_CLIENT_ID` alebo `GOOGLE_CLIENT_SECRET`
- ✅ Pridaj env vars a redeploy

#### "Callback" error (ten čo máš teraz)
- ❌ Nesprávny redirect URI v Google Console
- ❌ Chýba `NEXTAUTH_URL`
- ❌ Database connection zlyhala
- ✅ Over všetky 3 veci vyššie

#### "OAuthCreateAccount" error  
- ❌ PrismaAdapter nemôže zapísať do DB
- ❌ Database migrácie neboli spustené
- ✅ Over DATABASE_URL a spusti migrácie

### Database Migrations (ak treba)
```bash
cd apartmany-vita
npx prisma migrate deploy
```

## ✅ Checklist

Pred testovaním over:
- [ ] `NEXTAUTH_URL` je nastavené vo Vercel (Production)
- [ ] `NEXTAUTH_SECRET` je nastavené vo Vercel (Production)
- [ ] `GOOGLE_CLIENT_ID` a `GOOGLE_CLIENT_SECRET` sú nastavené vo Vercel
- [ ] `DATABASE_URL` a `DIRECT_DATABASE_URL` sú nastavené vo Vercel
- [ ] Google redirect URI je presne: `https://apartmany-vita.vercel.app/api/auth/callback/google`
- [ ] Projekt bol redeploynutý po pridaní env vars
- [ ] Browser cookies vymazané pred testovaním

---

## 📋 Quick Check Command

Skontroluj production logs:
```bash
vercel logs --production | grep -i "auth\|oauth\|callback\|error"
```

Hľadaj:
- `Missing NEXTAUTH_SECRET`
- `Missing GOOGLE_CLIENT_ID`
- `PrismaClientKnownRequestError`
- `Failed to sign in`

---

**Najčastejší problém:** Chýba `NEXTAUTH_SECRET` alebo `NEXTAUTH_URL` vo Vercel! 🎯
