# SEO - Finálny Checklist 🎯

**Dátum:** 5. október 2025  
**Status:** 90% hotové, potrebné dokončiť 4 kroky

---

## ✅ ČO JE HOTOVÉ (90%)

### 1. Databázový model ✅
- [x] `SeoMetadata` tabuľka v Prisma
- [x] SEO polia v `Apartment` modeli
- [x] Migration aplikovaná

### 2. SEO Service Layer ✅
- [x] `src/services/seo.ts` - kompletný
- [x] Funkcie: `getSeoMetadata()`, `getApartmentSeo()`, `upsertSeoMetadata()`
- [x] Fallbacky pre všetky stránky (home, apartments, contact, about)

### 3. Next.js Metadata API ✅
- [x] `generateMetadata()` na homepage (`src/app/page.tsx`)
- [x] `generateMetadata()` na apartments list (`src/app/(main)/apartments/page.tsx`)
- [x] `generateMetadata()` na apartment detail (`src/app/(main)/apartments/[slug]/page.tsx`)
- [x] Meta tagy sa správne renderujú v HTML

**Overené v produkčnom HTML:**
```html
<title>Apartmány Vita - Luxusné ubytovanie v Lučenci</title>
<meta name="description" content="Moderné apartmány v centre Lučenca..."/>
<meta name="keywords" content="apartmány lučenec,ubytovanie lučenec..."/>
<meta property="og:title" content="Apartmány Vita - Luxusné ubytovanie v Lučenci"/>
<meta property="og:image" content="https://www.apartmanvita.sk/og-default.jpg"/>
<meta name="twitter:card" content="summary_large_image"/>
<link rel="canonical" href="https://www.apartmanvita.sk/sk/home"/>
```

### 4. Structured Data (JSON-LD) ✅ (OPRAVENÉ)
- [x] `OrganizationStructuredData` komponent
- [x] `LocalBusinessStructuredData` komponent
- [x] `BreadcrumbStructuredData` komponent
- [x] **FIX:** Presunuté z `<head>` do `<body>` pre správne renderovanie

### 5. Robots.txt & Sitemap ✅
- [x] `/api/robots/route.ts` - generuje robots.txt
- [x] `/api/sitemap/route.ts` - dynamický sitemap.xml
- [x] Sitemap obsahuje všetky stránky + apartmány
- [x] Hreflang tagy pre viacjazyčnosť (sk, en, de, hu, pl)

### 6. Admin Panel ✅
- [x] SEO Manager komponent (`src/components/admin/seo-manager.tsx`)
- [x] API endpointy:
  - `GET/POST /api/admin/seo` - list/create SEO metadata
  - `DELETE /api/admin/seo/[id]` - delete SEO metadata
  - `PUT /api/admin/apartments/[id]/seo` - update apartment SEO

---

## ❌ ČO TREBA DOKONČIŤ (10%)

### 🔴 KRITICKÉ (musia byť hotové pred launch)

#### 1. Vytvoriť OG Default Image
**Problém:** `https://www.apartmanvita.sk/og-default.jpg` neexistuje (404)

**Riešenie:**
```bash
# Vytvor obrázok:
# - Rozmer: 1200×630px (Facebook/Twitter štandard)
# - Obsah: Logo + slogan + hero image apartmánu
# - Formát: JPG alebo PNG (max 1MB)
# - Názov: og-default.jpg

# Nahraj do:
# Option A: /apartmany-vita/public/og-default.jpg
# Option B: Vercel Blob Storage (ak používaš Vercel)
```

**Nástroje na vytvorenie:**
- Canva: https://www.canva.com/create/facebook-posts/
- Figma: Template 1200×630px
- Photoshop/GIMP

**Obsah obrázku:**
- Logo "Apartmány Vita"
- Slogan: "Luxusné ubytovanie v Lučenci"
- Hero foto najlepšieho apartmánu
- Kontakt: www.apartmanvita.sk

---

#### 2. Google Search Console Verification
**Problém:** Placeholder kód v layout.tsx

**Aktuálne:**
```tsx
verification: {
  google: "google-site-verification-code", // ❌ Placeholder
}
```

**Kroky:**
1. Choď na: https://search.google.com/search-console
2. Pridaj property: `apartmanvita.sk` alebo `www.apartmanvita.sk`
3. Vyber metódu: **HTML tag**
4. Skopíruj kód (napr. `ABC123xyz456...`)
5. Nahraď v `src/app/layout.tsx`:
   ```tsx
   verification: {
     google: "ABC123xyz456...", // ✅ Skutočný kód
   }
   ```
6. Deploy na produkciu
7. Vráť sa do Search Console a klikni "Verify"

**Po verifikácii:**
- Submit sitemap: `https://www.apartmanvita.sk/sitemap.xml`
- Počkaj 24-48h na indexáciu

---

### 🟡 DÔLEŽITÉ (odporúčané pred launch)

#### 3. Seed SEO dáta do databázy
**Problém:** SEO tabuľka je pravdepodobne prázdna, používajú sa len fallbacky

**Riešenie:**
1. Prihlás sa do admin panelu: `/admin/seo`
2. Vytvor SEO záznamy pre kľúčové stránky:

**Homepage (sk):**
```
Page Slug: home
Locale: sk
Meta Title: Apartmány Vita - Luxusné ubytovanie v Lučenci
Meta Description: Moderné apartmány v centre Lučenca. WiFi, parkovanie, plne vybavené kuchyne. Rezervujte si svoj pobyt online.
Keywords: apartmány lučenec, ubytovanie lučenec, apartmány vita, prenájom lučenec
OG Image: https://www.apartmanvita.sk/og-default.jpg
Canonical URL: https://www.apartmanvita.sk/sk
```

**Apartments Page (sk):**
```
Page Slug: apartments
Locale: sk
Meta Title: Naše apartmány - Apartmány Vita Lučenec
Meta Description: Vyberte si z našich moderných apartmánov. Deluxe, Lite a Design varianty s plným vybavením.
Keywords: apartmány, ubytovanie, lučenec, prenájom
Canonical URL: https://www.apartmanvita.sk/sk/apartments
```

**Contact Page (sk):**
```
Page Slug: contact
Locale: sk
Meta Title: Kontakt - Apartmány Vita
Meta Description: Kontaktujte nás pre rezervácie a otázky. Sme tu pre vás 24/7.
Keywords: kontakt, apartmány vita, lučenec
Canonical URL: https://www.apartmanvita.sk/sk/contact
```

**Apartment SEO:**
Pre každý apartmán v admin paneli doplň:
- `seoTitle` - custom titulok (napr. "Deluxe Apartmán - 6 osôb | Apartmány Vita")
- `seoDescription` - custom popis (zvýrazni unikátne features)
- `seoKeywords` - špecifické keywords
- `ogImage` - najlepší obrázok apartmánu

---

#### 4. Aktualizovať kontaktné údaje v Structured Data
**Problém:** Placeholder telefónne číslo a email

**Aktuálne v `src/components/seo/structured-data.tsx`:**
```tsx
telephone: '+421-900-123-456', // ❌ Placeholder
email: 'info@apartmanyvita.sk', // ❓ Overiť či existuje
```

**Riešenie:**
1. Otvor `src/components/seo/structured-data.tsx`
2. Nahraď placeholder údaje skutočnými:
   ```tsx
   telephone: '+421-XXX-XXX-XXX', // Tvoje číslo
   email: 'info@apartmanvita.sk', // Tvoj email
   ```
3. Overiť či existuje:
   - Logo: `https://apartmanyvita.sk/logo.png`
   - Social media linky (Facebook, Instagram)

---

## 📊 TESTOVANIE

### Po dokončení všetkých krokov otestuj:

#### 1. Local Test
```bash
pnpm dev
# Navštív: http://localhost:3000/
# View source (Ctrl+U) a skontroluj:
# - <title> tag
# - <meta name="description">
# - Open Graph tagy
# - JSON-LD script (teraz by mal byť vyplnený!)
```

#### 2. Production Test
```bash
# View source na produkčnej stránke:
curl -s https://www.apartmanvita.sk | grep -A 5 "application/ld+json"

# Malo by vrátiť vyplnený JSON, nie prázdny {}
```

#### 3. Online Validátory

**Facebook Sharing Debugger:**
- URL: https://developers.facebook.com/tools/debug/
- Zadaj: `https://www.apartmanvita.sk`
- Skontroluj: OG image, title, description

**Twitter Card Validator:**
- URL: https://cards-dev.twitter.com/validator
- Zadaj: `https://www.apartmanvita.sk`
- Preview Twitter card

**Google Rich Results Test:**
- URL: https://search.google.com/test/rich-results
- Zadaj: `https://www.apartmanvita.sk`
- Skontroluj: Organization, LocalBusiness schema

**Schema Markup Validator:**
- URL: https://validator.schema.org/
- Zadaj: `https://www.apartmanvita.sk`
- Validuj JSON-LD

**Google PageSpeed Insights:**
- URL: https://pagespeed.web.dev/
- Zadaj: `https://www.apartmanvita.sk`
- Skontroluj: Performance, SEO score

---

## 🎯 PRIORITY CHECKLIST

**Pred launch (MUST HAVE):**
- [ ] Vytvoriť a nahrať `og-default.jpg` (1200×630px)
- [ ] Overiť že JSON-LD sa správne renderuje (nie prázdny {})
- [ ] Aktualizovať placeholder telefón/email v structured data

**Po launch (SHOULD HAVE):**
- [ ] Zaregistrovať v Google Search Console
- [ ] Nahradiť verification placeholder skutočným kódom
- [ ] Submit sitemap.xml
- [ ] Seed SEO dáta cez admin panel

**Optimalizácia (NICE TO HAVE):**
- [ ] Vytvoriť custom OG images pre každý apartmán
- [ ] Pridať viacjazyčné SEO záznamy (EN, DE, HU, PL)
- [ ] Nastaviť Google Analytics 4
- [ ] Pridať FAQ schema na homepage

---

## 📈 VÝSLEDOK

Po dokončení všetkých krokov budeš mať:

✅ **100% SEO-ready stránku** s:
- Dynamickými meta tagmi
- Open Graph pre social sharing
- Structured data pre Google Rich Results
- Sitemap pre crawlery
- Robots.txt pre kontrolu indexácie
- Admin panel pre správu SEO

✅ **Google-friendly:**
- Validný JSON-LD
- Canonical URLs
- Mobile-friendly (responsive)
- Fast loading (Next.js SSR)
- Proper heading hierarchy (H1, H2, H3)

✅ **Social Media ready:**
- Facebook preview cards
- Twitter cards
- LinkedIn sharing support

---

## 🚀 DEPLOY

Po dokončení všetkých úprav:

```bash
# Commit zmeny
git add .
git commit -m "fix(seo): Fix JSON-LD rendering, add OG image, update verification"

# Push na GitHub (Railway auto-deploy)
git push origin main
```

**Čakacia doba:**
- Railway deploy: ~2-5 minút
- Google indexácia: 24-48 hodín
- Search Console verification: okamžite po deploy

---

## 📞 SUPPORT

Ak narazíš na problém:
1. Skontroluj browser console (F12) na chyby
2. Overiť že DATABASE_URL je správne nastavená (Railway)
3. Testuj lokálne pred deploy
4. Použiť online validátory na overenie

**Dokumentácia:**
- Next.js Metadata: https://nextjs.org/docs/app/building-your-application/optimizing/metadata
- Schema.org: https://schema.org/LodgingBusiness
- Google Search Console: https://search.google.com/search-console/welcome

---

**Posledná aktualizácia:** 5. október 2025  
**Autor:** AI Assistant  
**Status:** Ready for final review 🎉
