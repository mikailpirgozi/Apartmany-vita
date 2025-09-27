# 🔐 Nastavenie Autentifikácie - Apartmány Vita

> **Kompletný návod na sfunkčnenie prihlasenia a registrácie**

---

## 📋 Prehľad

Autentifikačný systém je **už kompletne implementovaný** v aplikácii! Potrebujete len nastaviť environment variables a databázu.

**✅ ČO JE HOTOVÉ:**
- NextAuth.js s Google OAuth + email/password
- Všetky formuláre a API routes
- Loyalty systém s 3-tier zľavami
- User dashboard a profile management

---

## 🚀 Rýchly štart

### 1. Vytvorte .env.local súbor

Skopírujte `.env.example` a premenujte na `.env.local`:

```bash
cp .env.example .env.local
```

### 2. Nastavte PostgreSQL databázu

**Možnosť A: Railway (odporúčané)**
1. Choďte na [Railway.app](https://railway.app)
2. Vytvorte nový projekt → PostgreSQL
3. Skopírujte `DATABASE_URL` do .env.local

**Možnosť B: Supabase**
1. Choďte na [Supabase.com](https://supabase.com)
2. Vytvorte nový projekt
3. Skopírujte connection string do .env.local

**Možnosť C: Local PostgreSQL**
```bash
# macOS s Homebrew
brew install postgresql
brew services start postgresql
createdb apartmany_vita
```

### 3. Spustite Prisma migrácie

```bash
npx prisma generate
npx prisma db push
```

### 4. Nastavte Google OAuth

1. Choďte na [Google Cloud Console](https://console.cloud.google.com)
2. Vytvorte nový projekt alebo vyberte existujúci
3. Povoľte Google+ API
4. Vytvorte OAuth 2.0 credentials:
   - Application type: Web application
   - Authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`
5. Skopírujte Client ID a Client Secret do .env.local

### 5. Nastavte NEXTAUTH_SECRET

```bash
# Vygenerujte bezpečný secret
openssl rand -base64 32
```

Skopírujte výsledok do .env.local ako `NEXTAUTH_SECRET`.

---

## 🔧 Environment Variables

```env
# POVINNÉ pre autentifikáciu
NEXTAUTH_SECRET="your-generated-secret"
NEXTAUTH_URL="http://localhost:3000"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
DATABASE_URL="postgresql://..."

# VOLITEĽNÉ (pre budúce funkcie)
BEDS24_API_KEY="..."
STRIPE_SECRET_KEY="..."
RESEND_API_KEY="..."
```

---

## 🧪 Testovanie

Po nastavení spustite aplikáciu:

```bash
npm run dev
```

**Testujte tieto funkcionality:**

1. **Registrácia:** `/auth/signup`
   - Vytvorte účet s email/password
   - Otestujte Google OAuth registráciu

2. **Prihlasenie:** `/auth/signin`
   - Prihláste sa s vytvoreným účtom
   - Otestujte Google OAuth prihlasenie

3. **User Dashboard:** `/account/dashboard`
   - Skontrolujte štatistiky a loyalty tier
   - Otestujte profile management

---

## 🏆 Loyalty Systém

Systém automaticky aplikuje zľavy:

- **Bronze (0+ rezervácií):** 5% zľava
- **Silver (3+ rezervácií):** 7% zľava  
- **Gold (6+ rezervácií):** 10% zľava

Zľavy sa aplikujú automaticky pri rezervácii.

---

## ❌ Riešenie problémov

### "Invalid credentials" chyba
- Skontrolujte že DATABASE_URL je správny
- Spustite `npx prisma db push`
- Overte že User tabuľka existuje

### Google OAuth nefunguje
- Skontrolujte Google Client ID/Secret
- Overte redirect URI v Google Console
- Skontrolujte že Google+ API je povolené

### "NEXTAUTH_SECRET not set" chyba
- Nastavte NEXTAUTH_SECRET v .env.local
- Reštartujte development server

### Databáza connection error
- Overte DATABASE_URL format
- Skontrolujte že PostgreSQL beží
- Overte credentials a permissions

---

## 🔒 Bezpečnosť

**Pre produkciu:**
1. Zmeňte NEXTAUTH_SECRET na silný, unikátny kľúč
2. Nastavte NEXTAUTH_URL na vašu doménu
3. Aktualizujte Google OAuth redirect URIs
4. Použite produkčnú databázu
5. Zapnite HTTPS

---

## 📞 Podpora

Ak máte problémy:
1. Skontrolujte console logy v browseri
2. Pozrite si terminal output
3. Overte .env.local súbor
4. Skontrolujte Prisma schema

**Autentifikačný systém je pripravený na produkciu!** 🚀
