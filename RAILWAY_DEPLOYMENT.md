# 🚂 Railway Deployment Guide - Apartmány Vita

> **Kompletný návod na nasadenie aplikácie na Railway**

---

## 🎯 Prehľad

**✅ ČO JE HOTOVÉ:**
- GitHub repository: [https://github.com/mikailpirgozi/Apartmany-vita](https://github.com/mikailpirgozi/Apartmany-vita)
- PostgreSQL databáza na Railway
- Všetok kód je pushnutý

**🔧 ČO TREBA NASTAVIŤ:**
- Railway projekt
- Environment variables
- Google OAuth credentials

---

## 🚀 Krok 1: Railway Projekt

### 1.1 Prihlásenie do Railway
1. Choďte na [Railway.app](https://railway.app)
2. Kliknite **"Login"**
3. Prihláste sa cez **GitHub** (odporúčané)

### 1.2 Vytvorenie projektu
1. Kliknite **"New Project"**
2. Vyberte **"Deploy from GitHub repo"**
3. Nájdite a vyberte **"Apartmany-vita"**
4. Kliknite **"Deploy Now"**

Railway automaticky:
- Detekuje Next.js aplikáciu
- Nainštaluje dependencies
- Spustí build proces

---

## 🗄️ Krok 2: PostgreSQL Databáza

**✅ DATABÁZA JE UŽ NASTAVENÁ:**
```
Internal URL: postgresql://postgres:FhMsbTSJYcndpebXfFIqmlcIamWpdCSG@postgres.railway.internal:5432/railway
Public URL: postgresql://postgres:FhMsbTSJYcndpebXfFIqmlcIamWpdCSG@shinkansen.proxy.rlwy.net:20490/railway
```

**Používajte Public URL pre aplikáciu!**

---

## 🔧 Krok 3: Environment Variables

V Railway dashboard nastavte tieto environment variables:

### **POVINNÉ:**
```env
DATABASE_URL=postgresql://postgres:FhMsbTSJYcndpebXfFIqmlcIamWpdCSG@shinkansen.proxy.rlwy.net:20490/railway
NEXTAUTH_SECRET=your-super-secret-key-here
NEXTAUTH_URL=https://your-app-name.railway.app
```

### **GOOGLE OAUTH (POVINNÉ PRE AUTH):**
```env
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### **VOLITEĽNÉ (pre budúce funkcie):**
```env
BEDS24_API_KEY=your-beds24-api-key
STRIPE_SECRET_KEY=sk_test_...
RESEND_API_KEY=re_...
OPENAI_API_KEY=sk-...
NEXT_PUBLIC_GA_ID=G-...
```

---

## 🔐 Krok 4: Google OAuth Setup

### 4.1 Google Cloud Console
1. Choďte na [Google Cloud Console](https://console.cloud.google.com)
2. Vytvorte nový projekt alebo vyberte existujúci
3. Povoľte **Google+ API**

### 4.2 OAuth 2.0 Credentials
1. Choďte do **"APIs & Services"** → **"Credentials"**
2. Kliknite **"+ CREATE CREDENTIALS"** → **"OAuth 2.0 Client IDs"**
3. Vyberte **"Web application"**
4. **Authorized redirect URIs:**
   ```
   https://your-app-name.railway.app/api/auth/callback/google
   http://localhost:3000/api/auth/callback/google
   ```
5. Skopírujte **Client ID** a **Client Secret**

### 4.3 Nastavenie v Railway
V Railway dashboard pridajte:
```env
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
```

---

## 🔑 Krok 5: NEXTAUTH_SECRET

Vygenerujte bezpečný secret:

```bash
# Na macOS/Linux
openssl rand -base64 32

# Alebo použite online generator
# https://generate-secret.vercel.app/32
```

Nastavte v Railway:
```env
NEXTAUTH_SECRET=your-generated-secret-here
```

---

## 🚀 Krok 6: Deploy a Testovanie

### 6.1 Deploy
1. Railway automaticky deployne po pushi do GitHub
2. Monitorujte build logy v Railway dashboard
3. Po úspešnom buildu dostanete URL

### 6.2 Testovanie
**Otestujte tieto funkcionality:**

1. **Homepage:** `https://your-app.railway.app`
   - Skontrolujte, či sa načíta
   - Testujte responsive dizajn

2. **Registrácia:** `https://your-app.railway.app/auth/signup`
   - Vytvorte test účet
   - Otestujte email/password registráciu

3. **Google OAuth:** 
   - Kliknite "Prihlásenie cez Google"
   - Otestujte Google prihlasenie

4. **User Dashboard:** `https://your-app.railway.app/account/dashboard`
   - Skontrolujte loyalty tier
   - Testujte profil management

---

## 🐛 Riešenie problémov

### **Build Error: "Cannot find module"**
```bash
# Riešenie: Pridať do package.json
"engines": {
  "node": ">=18.0.0"
}
```

### **Database Connection Error**
- Skontrolujte DATABASE_URL v Railway
- Použite Public URL, nie Internal
- Overte, že databáza beží

### **NextAuth Error: "NEXTAUTH_SECRET not set"**
- Nastavte NEXTAUTH_SECRET v Railway
- Reštartujte aplikáciu

### **Google OAuth Error: "Invalid redirect URI"**
- Skontrolujte redirect URI v Google Console
- Musí byť presne: `https://your-app.railway.app/api/auth/callback/google`

### **"Cannot read properties of undefined"**
- Skontrolujte, či sú všetky environment variables nastavené
- Overte, že databáza má správne tabuľky

---

## 📊 Monitoring

### **Railway Dashboard**
- Build logy
- Environment variables
- Database metrics
- Deployment history

### **Application Logs**
```bash
# V Railway dashboard
View Logs → Real-time logs
```

### **Database Management**
```bash
# Prisma Studio (local)
npx prisma studio

# Railway Database
Railway Dashboard → Database → Query
```

---

## 🔄 CI/CD Pipeline

**Automatický deploy:**
1. Push do `main` branch na GitHub
2. Railway automaticky detekuje zmeny
3. Spustí build proces
4. Deployne novú verziu

**Manual deploy:**
- Railway Dashboard → **"Deploy"**

---

## 🎯 Post-Deploy Checklist

**✅ Funkcionality:**
- [ ] Homepage sa načíta
- [ ] Registrácia funguje
- [ ] Google OAuth funguje
- [ ] User dashboard funguje
- [ ] Database connection funguje
- [ ] Responsive design funguje

**✅ Performance:**
- [ ] Build time < 5 minút
- [ ] Page load time < 3 sekundy
- [ ] No console errors
- [ ] Mobile responsive

**✅ Security:**
- [ ] HTTPS funguje
- [ ] Environment variables sú nastavené
- [ ] Database je chránený
- [ ] OAuth redirect URIs sú správne

---

## 🚀 Ďalšie kroky

Po úspešnom deploymente:

1. **Nastavte custom domain** (voliteľné)
2. **Pridajte SSL certificate** (automaticky)
3. **Nastavte monitoring** (Railway Analytics)
4. **Pripravte Beds24 integráciu**
5. **Nastavte Stripe payments**

---

## 📞 Podpora

**Railway:**
- [Railway Docs](https://docs.railway.app/)
- [Railway Discord](https://discord.gg/railway)

**Projekt:**
- GitHub Issues: [https://github.com/mikailpirgozi/Apartmany-vita/issues](https://github.com/mikailpirgozi/Apartmany-vita/issues)

---

**✨ Apartmány Vita - Pripravené na Railway deploy! 🚂**


