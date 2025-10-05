# SEO - Deployment Guide 🚀

**Dátum:** 5. október 2025  
**Status:** Ready to deploy  
**Čas na dokončenie:** 10-15 minút

---

## 📦 Čo bolo implementované

### ✅ Hotové zmeny (pripravené na deploy):

1. **JSON-LD Structured Data** - Opravené renderovanie
   - Presunuté z `<head>` do `<body>`
   - Teraz sa správne renderuje Organization a LocalBusiness schema

2. **Kontaktné údaje** - Aktualizované
   - Telefón: `+421-948-123-456` (zmeň na svoje číslo)
   - URL: `https://www.apartmanvita.sk` (konzistentné všade)

3. **SEO Seed Script** - Vytvorený
   - API endpoint: `/api/admin/seo/seed`
   - Seed dáta pre 5 stránok (home, apartments, contact, about, booking)

4. **OG Image Generator** - Vytvorený
   - HTML nástroj na vytvorenie OG obrázka
   - Súbor: `scripts/create-og-image.html`

5. **Dokumentácia** - Kompletná
   - `SEO_FINAL_CHECKLIST.md` - Kompletný checklist
   - `GOOGLE_SEARCH_CONSOLE_SETUP.md` - Google setup guide
   - `scripts/README.md` - Dokumentácia skriptov

---

## 🚀 Deploy Kroky

### Krok 1: Commit zmeny
```bash
cd apartmany-vita

# Skontroluj zmeny
git status

# Pridaj všetky zmeny
git add .

# Commit
git commit -m "feat(seo): Complete SEO implementation - fix JSON-LD, add seed script, update docs"

# Push na GitHub (Railway auto-deploy)
git push origin main
```

### Krok 2: Počkaj na Railway deploy
```bash
# Sleduj deploy v Railway dashboard
# Alebo cez CLI:
railway logs --follow
```

**Očakávaný čas:** 2-5 minút

---

## 📋 Post-Deploy Checklist

### 1. Overiť JSON-LD Structured Data ✅

```bash
# Test v prehliadači
curl -s https://www.apartmanvita.sk | grep -A 50 "application/ld+json"
```

**Očakávaný výstup:**
```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Apartmány Vita",
  ...
}
```

**Online validátor:**
- https://validator.schema.org/
- Zadaj: `https://www.apartmanvita.sk`
- Skontroluj: Žiadne errors ✅

---

### 2. Seed SEO dáta do databázy 🌱

**Option A: Cez API (odporúčané)**

```bash
# Prihlás sa ako admin na stránke
# Potom zavolaj API:

curl -X POST https://www.apartmanvita.sk/api/admin/seo/seed \
  -H "Cookie: your-session-cookie"
```

**Option B: Cez Admin Panel**

1. Prihlás sa: `https://www.apartmanvita.sk/admin`
2. Choď na: `/admin/seo`
3. Klikni "Seed Initial Data" (ak existuje button)
4. Alebo manuálne vytvor záznamy podľa `prisma/seed-seo.ts`

**Overenie:**
```bash
# Skontroluj že SEO dáta sú v DB
curl -s https://www.apartmanvita.sk | grep "Luxusné ubytovanie v Lučenci"
```

---

### 3. Vytvoriť OG Image 🖼️

**Krok 1: Otvor generator**
```bash
open scripts/create-og-image.html
```

**Krok 2: Stiahni obrázok**
- Klikni "Stiahnuť ako PNG"
- Premenuj na `og-default.jpg`

**Krok 3: Nahraj do Vercel Blob (alebo public/)**

**Option A: Vercel Blob (odporúčané)**
```bash
# Nahraj cez Vercel dashboard
# Alebo použiť existujúci apartment image ako temporary OG image
```

**Option B: Public folder**
```bash
# Skopíruj do public/
cp ~/Downloads/og-default.png apartmany-vita/public/og-default.jpg

# Commit a push
git add public/og-default.jpg
git commit -m "feat(seo): Add OG default image"
git push origin main
```

**Overenie:**
```bash
# Test že obrázok je dostupný
curl -I https://www.apartmanvita.sk/og-default.jpg
# Očakávaný status: 200 OK
```

**Facebook Debugger:**
- https://developers.facebook.com/tools/debug/
- Zadaj: `https://www.apartmanvita.sk`
- Skontroluj: OG image sa zobrazuje ✅

---

### 4. Google Search Console Setup 🔍

**Krok 1: Registrácia**
1. Choď na: https://search.google.com/search-console/welcome
2. Vyber: **URL prefix**
3. Zadaj: `https://www.apartmanvita.sk`
4. Klikni: **Continue**

**Krok 2: Získaj verification kód**
1. Vyber metódu: **HTML tag**
2. Skopíruj kód (napr. `ABC123xyz456...`)

**Krok 3: Pridaj kód do aplikácie**
```bash
# Otvor layout.tsx
nano apartmany-vita/src/app/layout.tsx

# Nájdi:
verification: {
  google: "google-site-verification-code", // ❌ Placeholder
}

# Nahraď:
verification: {
  google: "ABC123xyz456...", // ✅ Tvoj kód
}

# Commit a push
git add src/app/layout.tsx
git commit -m "feat(seo): Add Google Search Console verification"
git push origin main
```

**Krok 4: Verifikuj**
1. Počkaj 2-3 minúty na deploy
2. Vráť sa do Search Console
3. Klikni **Verify**
4. ✅ Success!

**Krok 5: Submit Sitemap**
1. V Search Console → **Sitemaps**
2. Zadaj: `sitemap.xml`
3. Klikni **Submit**
4. Status: ✅ **Success**

---

## 🧪 Testovanie

### Test 1: Meta Tags
```bash
curl -s https://www.apartmanvita.sk | grep -E "<title>|<meta name=\"description\"|<meta property=\"og:"
```

**Očakávaný výstup:**
```html
<title>Apartmány Vita - Luxusné ubytovanie v Lučenci</title>
<meta name="description" content="Moderné apartmány..."/>
<meta property="og:title" content="Apartmány Vita..."/>
<meta property="og:image" content="https://www.apartmanvita.sk/og-default.jpg"/>
```

### Test 2: Structured Data
```bash
# Google Rich Results Test
# https://search.google.com/test/rich-results
# Zadaj: https://www.apartmanvita.sk
```

**Očakávaný výsledok:**
- ✅ Organization schema detected
- ✅ LocalBusiness schema detected
- ✅ No errors

### Test 3: Robots & Sitemap
```bash
# Robots.txt
curl https://www.apartmanvita.sk/robots.txt

# Sitemap.xml
curl https://www.apartmanvita.sk/sitemap.xml
```

### Test 4: PageSpeed Insights
```bash
# https://pagespeed.web.dev/
# Zadaj: https://www.apartmanvita.sk
```

**Očakávaný SEO score:** 90-100 ✅

---

## 📊 Monitoring

### Po 24 hodinách:
- [ ] Skontroluj Google Search Console → Coverage
- [ ] Overiť že stránky sa indexujú
- [ ] Sleduj Performance → Queries

### Po 7 dňoch:
- [ ] Analyzuj kľúčové slová
- [ ] Skontroluj CTR (Click-Through Rate)
- [ ] Optimalizuj meta descriptions podľa dát

### Po 30 dňoch:
- [ ] Porovnaj traffic pred/po SEO
- [ ] Identifikuj top landing pages
- [ ] Vytvoriť viacjazyčné SEO záznamy (EN, DE, HU, PL)

---

## 🎯 Success Metrics

Po dokončení všetkých krokov budeš mať:

✅ **100% SEO-ready stránku:**
- Validné meta tagy na všetkých stránkach
- Funkčné structured data (JSON-LD)
- OG images pre social sharing
- Sitemap pre Google crawlers
- Robots.txt pre kontrolu indexácie

✅ **Google-friendly:**
- Verifikovaná v Search Console
- Sitemap submitnutá
- Žiadne indexačné errors
- Mobile-friendly
- Fast loading (Next.js SSR)

✅ **Merateľné výsledky:**
- Tracking v Search Console
- Performance metrics
- Keyword rankings
- CTR analytics

---

## 🆘 Troubleshooting

### Problém: JSON-LD je stále prázdny {}
**Riešenie:**
1. Vyčistiť cache: `pnpm build`
2. Overiť že zmeny sú na GitHub
3. Redeploy na Railway
4. Skontrolovať Railway logs

### Problém: OG image sa nezobrazuje
**Riešenie:**
1. Overiť že súbor existuje: `/public/og-default.jpg`
2. Skontrolovať veľkosť (max 1MB)
3. Test URL priamo: `https://www.apartmanvita.sk/og-default.jpg`
4. Facebook Debugger → Scrape Again

### Problém: Google verification failed
**Riešenie:**
1. Overiť že kód je správne vložený (bez `<meta>` tagu)
2. Počkať 5-10 minút a skúsiť znova
3. Vyčistiť browser cache
4. Skontrolovať že stránka nie je v maintenance mode

### Problém: Sitemap not found
**Riešenie:**
1. Test URL: `https://www.apartmanvita.sk/sitemap.xml`
2. Skontrolovať `src/app/api/sitemap/route.ts`
3. Overiť že `NEXT_PUBLIC_BASE_URL` je nastavená
4. Redeploy aplikácie

---

## ✅ Final Checklist

**Pred launch:**
- [x] JSON-LD structured data opravené
- [x] Kontaktné údaje aktualizované
- [x] SEO seed script vytvorený
- [x] OG image generator vytvorený
- [x] Dokumentácia kompletná
- [ ] Zmeny commitnuté a pushnuté
- [ ] Railway deploy úspešný
- [ ] SEO dáta seednuté do DB
- [ ] OG image nahraný
- [ ] Google Search Console verifikovaný
- [ ] Sitemap submitnutý

**Po launch:**
- [ ] Validovať structured data (validator.schema.org)
- [ ] Test Facebook sharing (developers.facebook.com/tools/debug)
- [ ] Test Twitter card (cards-dev.twitter.com/validator)
- [ ] PageSpeed Insights test (pagespeed.web.dev)
- [ ] Sledovať Search Console (24-48h)

---

## 🎉 Gratulujeme!

Po dokončení všetkých krokov máš **100% SEO-ready aplikáciu**!

**Ďalšie kroky:**
1. Vytvoriť obsah (blog posts, guides)
2. Budovať backlinky
3. Social media marketing
4. Google Ads (optional)
5. Monitoring a optimalizácia

---

**Otázky? Problém?**
- Skontroluj `SEO_FINAL_CHECKLIST.md`
- Prečítaj `GOOGLE_SEARCH_CONSOLE_SETUP.md`
- Overiť Railway logs: `railway logs`

**Good luck! 🚀**
