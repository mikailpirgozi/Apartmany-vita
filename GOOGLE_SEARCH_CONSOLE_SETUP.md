# Google Search Console Setup 🔍

**Dátum:** 5. október 2025  
**Účel:** Registrácia stránky v Google Search Console a získanie verification kódu

---

## 📋 Kroky na dokončenie

### 1. Registrácia v Google Search Console

1. **Choď na:** https://search.google.com/search-console/welcome
2. **Prihlás sa** s Google účtom (ideálne firemný email)
3. **Vyber typ property:**
   - **Option A:** Domain property (odporúčané)
     - Zadaj: `apartmanvita.sk`
     - Vyžaduje DNS verifikáciu (TXT záznam)
   - **Option B:** URL prefix property (jednoduchšie)
     - Zadaj: `https://www.apartmanvita.sk`
     - Vyžaduje HTML tag verifikáciu

---

### 2. Verifikácia cez HTML tag (jednoduchšia metóda)

#### Krok 1: Získaj verification kód
1. Vyber **"URL prefix"** property
2. Zadaj: `https://www.apartmanvita.sk`
3. Klikni **"Continue"**
4. Vyber metódu: **"HTML tag"**
5. Skopíruj kód (vyzerá takto):
   ```html
   <meta name="google-site-verification" content="ABC123xyz456..." />
   ```

#### Krok 2: Pridaj kód do aplikácie
1. Otvor: `apartmany-vita/src/app/layout.tsx`
2. Nájdi riadok:
   ```tsx
   verification: {
     google: "google-site-verification-code", // ❌ Placeholder
   }
   ```
3. Nahraď placeholder skutočným kódom (len obsah `content` atribútu):
   ```tsx
   verification: {
     google: "ABC123xyz456...", // ✅ Tvoj kód
   }
   ```

#### Krok 3: Deploy zmeny
```bash
cd apartmany-vita

# Commit zmeny
git add src/app/layout.tsx
git commit -m "feat(seo): Add Google Search Console verification code"

# Push na GitHub (Railway auto-deploy)
git push origin main
```

#### Krok 4: Verifikuj v Search Console
1. Počkaj 2-3 minúty na Railway deploy
2. Vráť sa do Google Search Console
3. Klikni **"Verify"**
4. ✅ Hotovo!

---

### 3. Verifikácia cez DNS (pokročilá metóda)

**Výhody:**
- Verifikuje celú doménu (apartmanvita.sk + www.apartmanvita.sk)
- Nie je potrebné upravovať kód

**Kroky:**
1. Vyber **"Domain"** property
2. Zadaj: `apartmanvita.sk`
3. Skopíruj TXT záznam (napr. `google-site-verification=ABC123xyz...`)
4. Choď do DNS nastavení (kde máš registrovanú doménu):
   - **Cloudflare:** DNS → Add record
   - **GoDaddy:** DNS Management
   - **Namecheap:** Advanced DNS
5. Pridaj TXT záznam:
   - **Type:** TXT
   - **Name:** @ (alebo prázdne)
   - **Value:** `google-site-verification=ABC123xyz...`
   - **TTL:** Auto alebo 3600
6. Uložiť a počkať 5-10 minút
7. Vráť sa do Search Console a klikni **"Verify"**

---

## 4. Po úspešnej verifikácii

### Submit Sitemap
1. V Search Console choď na **"Sitemaps"** (ľavé menu)
2. Zadaj URL sitemapy: `sitemap.xml`
3. Klikni **"Submit"**
4. Status by mal byť: ✅ **"Success"**

### Čo sledovať v Search Console:
- **Performance** - kľúčové slová, kliky, impressions
- **Coverage** - indexované stránky
- **Enhancements** - structured data errors
- **Mobile Usability** - mobile-friendly issues

---

## 5. Overenie funkčnosti

### Test 1: Meta tag v HTML source
```bash
curl -s https://www.apartmanvita.sk | grep "google-site-verification"
```
**Očakávaný výstup:**
```html
<meta name="google-site-verification" content="ABC123xyz456..."/>
```

### Test 2: Robots.txt
```bash
curl https://www.apartmanvita.sk/robots.txt
```
**Očakávaný výstup:**
```
User-agent: *
Allow: /
...
Sitemap: https://www.apartmanvita.sk/sitemap.xml
```

### Test 3: Sitemap.xml
```bash
curl https://www.apartmanvita.sk/sitemap.xml
```
**Očakávaný výstup:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://www.apartmanvita.sk</loc>
    ...
  </url>
</urlset>
```

---

## 6. Časová os indexácie

| Čas | Čo sa deje |
|-----|-----------|
| 0h | Verifikácia dokončená ✅ |
| 1-2h | Google začne crawlovať stránku 🕷️ |
| 24h | Prvé stránky indexované 📄 |
| 48-72h | Väčšina stránok indexovaná 📚 |
| 7 dní | Prvé dáta v Performance reportoch 📊 |
| 30 dní | Stabilné ranking a traffic 📈 |

---

## 7. Troubleshooting

### Problém: "Verification failed"
**Riešenie:**
1. Overiť že kód je správne vložený (bez `<meta>` tagu, len content)
2. Vyčistiť cache: `pnpm build` a redeploy
3. Skontrolovať že stránka je prístupná (nie 404/500)
4. Počkať 5-10 minút a skúsiť znova

### Problém: "Sitemap not found"
**Riešenie:**
1. Overiť že `/sitemap.xml` funguje: https://www.apartmanvita.sk/sitemap.xml
2. Skontrolovať `src/app/api/sitemap/route.ts`
3. Overiť že `NEXT_PUBLIC_BASE_URL` je správne nastavená

### Problém: "No data available"
**Riešenie:**
- Normálne! Google potrebuje 24-48h na prvé dáta
- Pokračuj v tvorbe obsahu a budovaní linkov

---

## 8. Ďalšie kroky po verifikácii

### A) Pridať ďalších používateľov
1. Settings → Users and permissions
2. Add user → zadaj email
3. Vyber permission level (Owner/Full/Restricted)

### B) Nastaviť email notifikácie
1. Settings → Email notifications
2. Zapni upozornenia na:
   - Critical issues
   - Manual actions
   - Security issues

### C) Integrovať s Google Analytics
1. Settings → Associations
2. Link Google Analytics property
3. Zdieľaj dáta medzi nástrojmi

---

## 📚 Užitočné linky

- **Search Console Help:** https://support.google.com/webmasters
- **Structured Data Testing:** https://search.google.com/test/rich-results
- **PageSpeed Insights:** https://pagespeed.web.dev/
- **Mobile-Friendly Test:** https://search.google.com/test/mobile-friendly

---

## ✅ Checklist

- [ ] Zaregistrovať property v Search Console
- [ ] Získať verification kód
- [ ] Pridať kód do `layout.tsx`
- [ ] Deploy na produkciu
- [ ] Verifikovať property
- [ ] Submit sitemap.xml
- [ ] Nastaviť email notifikácie
- [ ] Overiť že stránky sa indexujú (24-48h)

---

**Po dokončení všetkých krokov tvoja stránka bude plne SEO-ready! 🎉**
