# Scripts & Utilities 🛠️

Pomocné skripty a nástroje pre Apartmány Vita aplikáciu.

---

## 📋 Dostupné skripty

### 1. OG Image Generator
**Súbor:** `create-og-image.html`

**Účel:** Vytvorenie Open Graph obrázka (1200×630px) pre social media sharing

**Použitie:**
```bash
# Otvor v prehliadači
open scripts/create-og-image.html

# Alebo dvojklik na súbor
```

**Kroky:**
1. Otvor súbor v prehliadači
2. Klikni "Stiahnuť ako PNG"
3. Premenuj na `og-default.jpg`
4. Nahraj do `/public/og-default.jpg`
5. Commit a push

**Alternatívy:**
- Canva: https://www.canva.com/create/facebook-posts/
- Figma: Template 1200×630px
- Photoshop/GIMP

---

### 2. Port Checker
**Súbor:** `port-checker.js`

**Účel:** Overenie že aplikácia beží na porte 3000

**Použitie:**
```bash
node scripts/port-checker.js
```

---

### 3. Pre-commit Port Check
**Súbor:** `pre-commit-port-check.js`

**Účel:** Git hook na overenie portu pred commitom

**Nastavenie:**
```bash
# Pridaj do .git/hooks/pre-commit
chmod +x scripts/pre-commit-port-check.js
```

---

### 4. Hotfix SQL Script
**Súbor:** `hotfix-add-columns.sql`

**Účel:** Manuálne pridanie stĺpcov do databázy

**Použitie:**
```bash
# Railway CLI
railway run psql < scripts/hotfix-add-columns.sql

# Alebo cez Railway dashboard
# Database → Query → paste SQL
```

---

### 5. Apply Migration
**Súbor:** `apply-migration.sh`

**Účel:** Aplikovanie Prisma migrácií na produkciu

**Použitie:**
```bash
chmod +x scripts/apply-migration.sh
./scripts/apply-migration.sh
```

---

## 🌱 SEO Seed

### Option A: API Endpoint (odporúčané)
```bash
# Po deploy na Railway, zavolaj:
curl -X POST https://www.apartmanvita.sk/api/admin/seo/seed \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### Option B: Lokálne (vyžaduje DATABASE_URL)
```bash
# Nastav DATABASE_URL
export DATABASE_URL="postgresql://..."

# Spusti seed
pnpm tsx prisma/seed-seo.ts
```

### Option C: Cez Admin Panel
1. Prihlás sa: `/admin/seo`
2. Manuálne vytvor SEO záznamy pre každú stránku
3. Použiť dáta z `prisma/seed-seo.ts` ako template

---

## 📦 Package Scripts

V `package.json`:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate deploy",
    "prisma:studio": "prisma studio",
    "seed:seo": "tsx prisma/seed-seo.ts"
  }
}
```

**Použitie:**
```bash
pnpm dev              # Spusti dev server
pnpm build            # Build pre produkciu
pnpm prisma:generate  # Generuj Prisma Client
pnpm prisma:migrate   # Aplikuj migrácie
pnpm prisma:studio    # Otvor Prisma Studio
pnpm seed:seo         # Seed SEO dáta (vyžaduje DATABASE_URL)
```

---

## 🔧 Maintenance Scripts

### Clear Beds24 Cache
```bash
curl -X POST https://www.apartmanvita.sk/api/beds24/clear-cache
```

### Test Availability API
```bash
node test-availability-api.js
```

### Debug Script
```bash
./test-debug.sh
```

---

## 📚 Dokumentácia

- **API_DOCUMENTATION.md** - API endpointy
- **GOOGLE_SEARCH_CONSOLE_SETUP.md** - Google Search Console setup
- **SEO_FINAL_CHECKLIST.md** - SEO checklist
- **DEPLOYMENT_CHECKLIST_ADMIN.md** - Deploy checklist

---

## 🆘 Troubleshooting

### Problém: "DATABASE_URL not found"
**Riešenie:**
```bash
# Lokálne
export DATABASE_URL="postgresql://..."

# Alebo použi .env súbor
echo "DATABASE_URL=postgresql://..." >> .env
```

### Problém: "Permission denied"
**Riešenie:**
```bash
chmod +x scripts/*.sh
```

### Problém: "Module not found"
**Riešenie:**
```bash
pnpm install
pnpm prisma generate
```

---

## 📞 Support

Ak narazíš na problém:
1. Skontroluj dokumentáciu v `/docs`
2. Overiť že všetky env variables sú nastavené
3. Skontroluj Railway logs: `railway logs`
4. Test lokálne pred deploy

---

**Posledná aktualizácia:** 5. október 2025