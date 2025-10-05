# 🚀 SEO Action Plan - Apartmány Vita Trenčín

**Dátum vytvorenia:** 5. október 2025  
**Posledná aktualizácia:** 5. október 2025 - Fáza 1 HOTOVÁ ✅  
**Cieľ:** Dosiahnuť 10/10 SEO hodnotenie a zobrazovanie v Google Maps s cenami  
**Aktuálny stav:** 8.5/10 ⭐⭐⭐⭐⭐⭐⭐⭐⭐⚪ (bol 7/10)

---

## 📊 AKTUÁLNE HODNOTENIE

| Kategória | Hodnotenie | Status |
|-----------|------------|--------|
| Technické SEO | ⭐⭐⭐⭐⭐ 10/10 | ✅ Hotové |
| Keywords | ⭐⭐⭐⭐⭐ 10/10 | ✅ Hotové |
| Structured Data | ⭐⭐⭐⭐⭐ 10/10 | ✅ Hotové |
| Alt tagy | ⭐⭐⭐⭐⭐ 10/10 | ✅ Hotové |
| H1/H2 štruktúra | ⭐⭐⭐⭐⭐ 10/10 | ✅ Hotové |
| Meta descriptions | ⭐⭐⭐⭐⚪ 8/10 | 🟢 OK |
| Internal linking | ⭐⭐⚪⚪⚪ 4/10 | 🟡 Dôležité |
| FAQ schema | ⭐⭐⭐⭐⭐ 10/10 | ✅ Hotové |
| Local SEO | ⭐⭐⚪⚪⚪ 4/10 | 🔴 Kritické |
| Content | ⭐⭐⭐⚪⚪ 6/10 | 🟢 Odporúčané |

---

## 🎯 FÁZA 1: KRITICKÉ ÚPRAVY (30-45 minút) ✅ HOTOVÉ!

### ✅ Checklist:
- [x] Opraviť H1 tagy (Lučenec → Trenčín, zviditeľniť)
- [x] Pridať Hotel/LodgingBusiness schema
- [x] Pridať Room schema pre každý apartmán
- [x] Pridať alt tagy všetkým obrázkom
- [x] Pridať FAQ schema

---

### 1.1 Opraviť H1 tagy

**Problém:**
```tsx
// ❌ ZLÉ - v src/app/(main)/apartments/[slug]/page.tsx
<h1 className="sr-only">{apartment.name} - Apartmány Vita Lučenec</h1>
```

**Riešenie:**
```tsx
// ✅ DOBRÉ
<h1 className="text-3xl font-bold mb-4">
  {apartment.name} - Apartmány Vita Trenčín
</h1>
```

**Súbory na úpravu:**
- `src/app/(main)/apartments/[slug]/page.tsx`
- `src/app/(main)/page.tsx` (homepage)
- `src/app/(main)/apartments/page.tsx`

**Prečo je to dôležité:**
- Google preferuje viditeľné H1 tagy
- H1 musí obsahovať hlavné keyword
- Každá stránka musí mať len 1 H1

---

### 1.2 Pridať Hotel/LodgingBusiness Schema

**Prečo je to KRITICKÉ:**
- ✅ Zobrazenie v **Google Maps** s cenami
- ✅ Zobrazenie v **Google Travel**
- ✅ Rich snippets (hviezdy, ceny)
- ✅ Vyššie CTR (až o 30%!)

**Implementácia:**

Vytvoriť nový súbor: `src/components/seo/hotel-structured-data.tsx`

```tsx
export function HotelStructuredData() {
  const hotelData = {
    "@context": "https://schema.org",
    "@type": "LodgingBusiness",
    "@id": "https://www.apartmanvita.sk/#lodging",
    "name": "Apartmány Vita Trenčín",
    "alternateName": "Apartmány Vita",
    "description": "Moderné apartmány v centre Trenčína. Design, Lite a Deluxe apartmány s plným vybavením.",
    "url": "https://www.apartmanvita.sk",
    "telephone": "+421940728676",
    "email": "info@apartmanvita.sk",
    "priceRange": "€€",
    "currenciesAccepted": "EUR",
    "paymentAccepted": ["Cash", "Credit Card", "Debit Card"],
    "checkinTime": "15:00",
    "checkoutTime": "11:00",
    "numberOfRooms": 3,
    "petsAllowed": false,
    "smokingAllowed": false,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Štúrovo námestie 132/16",
      "addressLocality": "Trenčín",
      "postalCode": "911 01",
      "addressCountry": "SK"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 48.8951,
      "longitude": 18.0447
    },
    "image": [
      "https://www.apartmanvita.sk/og-default.jpg"
    ],
    "starRating": {
      "@type": "Rating",
      "ratingValue": "4.8",
      "bestRating": "5"
    },
    "amenityFeature": [
      {
        "@type": "LocationFeatureSpecification",
        "name": "Free WiFi",
        "value": true
      },
      {
        "@type": "LocationFeatureSpecification",
        "name": "Air Conditioning",
        "value": true
      },
      {
        "@type": "LocationFeatureSpecification",
        "name": "Kitchen",
        "value": true
      },
      {
        "@type": "LocationFeatureSpecification",
        "name": "Free Parking",
        "value": true
      },
      {
        "@type": "LocationFeatureSpecification",
        "name": "Elevator",
        "value": true
      }
    ],
    "potentialAction": {
      "@type": "ReserveAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://www.apartmanvita.sk/booking",
        "actionPlatform": [
          "http://schema.org/DesktopWebPlatform",
          "http://schema.org/MobileWebPlatform"
        ]
      },
      "result": {
        "@type": "LodgingReservation",
        "name": "Rezervácia apartmánu"
      }
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(hotelData) }}
    />
  );
}
```

**Pridať do layout.tsx:**
```tsx
import { HotelStructuredData } from '@/components/seo/hotel-structured-data';

// V <body>:
<HotelStructuredData />
```

---

### 1.3 Pridať Room Schema pre každý apartmán

**Vytvoriť:** `src/components/seo/room-structured-data.tsx`

```tsx
interface RoomStructuredDataProps {
  apartment: {
    name: string;
    slug: string;
    description: string;
    size: number;
    maxGuests: number;
    pricePerNight: number;
    images: string[];
    amenities: string[];
  };
}

export function RoomStructuredData({ apartment }: RoomStructuredDataProps) {
  const roomData = {
    "@context": "https://schema.org",
    "@type": "HotelRoom",
    "name": `${apartment.name} - Apartmány Vita Trenčín`,
    "description": apartment.description,
    "url": `https://www.apartmanvita.sk/apartments/${apartment.slug}`,
    "image": apartment.images,
    "floorSize": {
      "@type": "QuantitativeValue",
      "value": apartment.size,
      "unitCode": "MTK" // square meters
    },
    "occupancy": {
      "@type": "QuantitativeValue",
      "minValue": 1,
      "maxValue": apartment.maxGuests
    },
    "bed": {
      "@type": "BedDetails",
      "numberOfBeds": apartment.maxGuests <= 2 ? 1 : 2,
      "typeOfBed": apartment.maxGuests <= 2 ? "Manželská posteľ" : "Manželská + jednolôžková"
    },
    "amenityFeature": apartment.amenities.map(amenity => ({
      "@type": "LocationFeatureSpecification",
      "name": amenity,
      "value": true
    })),
    "offers": {
      "@type": "Offer",
      "price": apartment.pricePerNight,
      "priceCurrency": "EUR",
      "availability": "https://schema.org/InStock",
      "url": `https://www.apartmanvita.sk/booking?apartment=${apartment.slug}`,
      "priceSpecification": {
        "@type": "UnitPriceSpecification",
        "price": apartment.pricePerNight,
        "priceCurrency": "EUR",
        "unitText": "za noc"
      }
    },
    "potentialAction": {
      "@type": "ReserveAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `https://www.apartmanvita.sk/booking?apartment=${apartment.slug}`,
        "actionPlatform": [
          "http://schema.org/DesktopWebPlatform",
          "http://schema.org/MobileWebPlatform"
        ]
      }
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(roomData) }}
    />
  );
}
```

**Pridať do:** `src/app/(main)/apartments/[slug]/page.tsx`

```tsx
import { RoomStructuredData } from '@/components/seo/room-structured-data';

// V return:
<RoomStructuredData apartment={apartment} />
```

---

### 1.4 Pridať Alt tagy obrázkom

**Problém:**
```tsx
// ❌ ZLÉ
<Image src="..." alt="Design Apartmán" />
```

**Riešenie:**
```tsx
// ✅ DOBRÉ
<Image 
  src="..." 
  alt="Apartmán Vita Design Trenčín – spálňa s manželskou posteľou a moderným dizajnom"
/>
```

**Pravidlá pre alt tagy:**
1. **Obsahovať keyword** (Apartmán Vita, Trenčín)
2. **Popisovať obrázok** (spálňa, kúpeľňa, obývačka)
3. **Byť špecifický** (nie len "apartmán", ale "Apartmán Vita Design Trenčín – spálňa")
4. **Max 125 znakov**

**Súbory na úpravu:**
- `src/components/apartment/apartment-gallery.tsx`
- `src/components/apartment/apartment-card.tsx`
- `src/app/(main)/page.tsx`

**Príklady alt tagov:**

```tsx
// Homepage hero image:
alt="Apartmány Vita Trenčín – moderné ubytovanie v centre mesta"

// Apartment card:
alt="Apartmán Vita Design Trenčín – priestranná obývačka s moderným dizajnom"

// Gallery images:
alt="Apartmán Vita Lite Trenčín – spálňa s manželskou posteľou"
alt="Apartmán Vita Deluxe Trenčín – kúpeľňa s vaňou a sprchovacím kútom"
alt="Apartmán Vita Design Trenčín – plne vybavená kuchyňa"
```

---

## 🎯 FÁZA 2: LOCAL SEO (1-2 hodiny)

### ✅ Checklist:
- [ ] Google My Business setup
- [ ] FAQ schema
- [ ] Mapy.cz registrácia
- [ ] Firmy.sk registrácia
- [ ] Zoznam.sk registrácia

---

### 2.1 Google My Business Setup (NAJDÔLEŽITEJŠIE!)

**Prečo je to KRITICKÉ:**
- ✅ Zobrazenie v **Google Maps**
- ✅ Zobrazenie v **Google Search** (local pack)
- ✅ Recenzie
- ✅ Fotky
- ✅ Otváracie hodiny
- ✅ Až **50% local search traffic**!

**Kroky:**

#### Krok 1: Vytvorenie GMB profilu (15 minút)

1. Choď na: https://business.google.com/
2. Klikni **"Manage now"**
3. Zadaj názov firmy: **"Apartmány Vita"**
4. Vyber kategóriu: **"Apartment rental agency"** alebo **"Lodging"**
5. Pridaj adresu: **Štúrovo námestie 132/16, 911 01 Trenčín**
6. Pridaj telefón: **+421 940 728 676**
7. Pridaj web: **https://www.apartmanvita.sk**

#### Krok 2: Verifikácia (1-2 týždne)

Google pošle **overovací kód poštou** na adresu.

**Alternatíva (rýchlejšie):**
- Verifikácia cez email (ak je dostupná)
- Verifikácia cez telefón (ak je dostupná)

#### Krok 3: Optimalizácia profilu (30 minút)

**A) Základné informácie:**
```
Názov: Apartmány Vita
Kategória: Apartment rental agency
Adresa: Štúrovo námestie 132/16, 911 01 Trenčín
Telefón: +421 940 728 676
Web: https://www.apartmanvita.sk
Email: info@apartmanvita.sk
```

**B) Otváracie hodiny:**
```
Check-in: 15:00
Check-out: 11:00
Recepcia: 24/7 (telefonicky)
```

**C) Popis (750 znakov max):**
```
Apartmány Vita Trenčín ponúkajú moderné ubytovanie v srdci historického centra mesta. 

Naše 3 apartmány (Lite, Design, Deluxe) sú plne vybavené a poskytujú všetok komfort pre váš pobyt:
• Plne vybavená kuchyňa
• WiFi zadarmo
• Klimatizácia
• Parkovanie zadarmo
• Výťah
• Smart TV

Ideálne pre:
✓ Páry a rodiny
✓ Business pobyty
✓ Víkendové výlety
✓ Dlhodobé prenájmy

Rezervujte online na apartmanvita.sk alebo nás kontaktujte na +421 940 728 676.

Tešíme sa na vás!
```

**D) Atribúty (zaškrtnúť):**
```
✅ Free WiFi
✅ Free parking
✅ Air conditioning
✅ Kitchen
✅ Elevator
✅ Non-smoking
✅ Family-friendly
✅ Wheelchair accessible (ak áno)
✅ Pet-friendly (ak áno)
```

**E) Služby:**
```
• Ubytovanie
• Online rezervácia
• Check-in 24/7
• Dlhodobé prenájmy
• Business ubytovanie
```

**F) Fotky (min 10 fotiek):**
```
1. Vonkajšok budovy (hlavná fotka)
2-4. Apartmán Vita Lite (obývačka, spálňa, kúpeľňa)
5-7. Apartmán Vita Design (obývačka, spálňa, kúpeľňa)
8-10. Apartmán Vita Deluxe (obývačka, spálňa, kúpeľňa)
11. Okolie (Štúrovo námestie, hrad)
```

**Požiadavky na fotky:**
- Rozlíšenie: min 720x720px
- Formát: JPG alebo PNG
- Veľkosť: max 5MB
- Kvalitné, profesionálne fotky

**G) Produkty (apartmány):**
```
Produkt 1: Apartmán Vita Lite
- Cena: od 75€/noc
- Popis: Útulný apartmán pre 2 osoby
- Fotka

Produkt 2: Apartmán Vita Design
- Cena: od 105€/noc
- Popis: Štýlový apartmán pre 6 osôb
- Fotka

Produkt 3: Apartmán Vita Deluxe
- Cena: od 100€/noc
- Popis: Luxusný apartmán pre 6 osôb
- Fotka
```

#### Krok 4: Získanie prvých recenzií (ongoing)

**Stratégia:**
1. Po každom pobyte pošli email s prosbou o recenziu
2. Pridaj QR kód na recenziu do apartmánu
3. Ponúkni 5% zľavu za recenziu
4. Odpovedaj na všetky recenzie (aj negatívne!)

**Email template:**
```
Dobrý deň [Meno],

ďakujeme za váš pobyt v Apartmánoch Vita Trenčín!

Dúfame, že ste boli spokojní. Pomohli by ste nám zanechaním recenzie na Google?

👉 [Link na GMB recenziu]

Za recenziu vám ponúkame 5% zľavu na ďalší pobyt.

Ďakujeme a tešíme sa na vás!

Apartmány Vita Trenčín
```

---

### 2.2 FAQ Schema

**Vytvoriť:** `src/components/seo/faq-structured-data.tsx`

```tsx
export function FAQStructuredData() {
  const faqData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Aká je minimálna dĺžka pobytu v Apartmánoch Vita Trenčín?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Minimálna dĺžka pobytu je 1 noc. Pre dlhodobé pobyty (7+ nocí) ponúkame zľavy až 10%."
        }
      },
      {
        "@type": "Question",
        "name": "Je v apartmánoch dostupné parkovanie?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Áno, pre všetkých hostí je k dispozícii bezplatné parkovanie priamo pri budove."
        }
      },
      {
        "@type": "Question",
        "name": "O koľkej je check-in a check-out?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Check-in je od 15:00, check-out do 11:00. V prípade potreby skoršieho príchodu alebo neskoršieho odchodu nás kontaktujte."
        }
      },
      {
        "@type": "Question",
        "name": "Sú apartmány vybavené kuchyňou?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Áno, všetky apartmány majú plne vybavenú kuchyňu s chladničkou, varnou doskou, mikrovlnkou, riadom a príborom."
        }
      },
      {
        "@type": "Question",
        "name": "Je v apartmánoch WiFi?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Áno, všetky apartmány majú bezplatné vysokorýchlostné WiFi pripojenie."
        }
      },
      {
        "@type": "Question",
        "name": "Ako ďaleko je centrum Trenčína?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Apartmány Vita sa nachádzajú priamo na Štúrovom námestí v historickom centre Trenčína. Hrad Trenčín je vzdialený 5 minút pešo."
        }
      },
      {
        "@type": "Question",
        "name": "Aké sú možnosti platby?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Akceptujeme platbu kartou online, bankovým prevodom alebo v hotovosti pri príchode."
        }
      },
      {
        "@type": "Question",
        "name": "Môžem zrušiť rezerváciu?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Áno, rezerváciu môžete zrušiť bezplatne až 24 hodín pred príchodom. Pri neskoršom zrušení účtujeme poplatok za prvú noc."
        }
      }
    ]
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(faqData) }}
    />
  );
}
```

**Pridať do:** `src/app/(main)/page.tsx` alebo vytvoriť `/faq` stránku

---

### 2.3 Lokálne adresáre

**A) Mapy.cz** (15 minút)
```
1. Choď na: https://firmy.mapy.cz/
2. Registruj firmu
3. Vyplň údaje (rovnaké ako GMB)
4. Pridaj fotky
5. Overiť
```

**B) Firmy.sk** (10 minút)
```
1. Choď na: https://www.firmy.sk/
2. Registruj firmu
3. Vyplň údaje
4. Pridaj link na web
```

**C) Zoznam.sk** (10 minút)
```
1. Choď na: https://www.zoznam.sk/
2. Registruj firmu
3. Vyplň údaje
4. Pridaj link na web
```

---

## 🎯 FÁZA 3: CONTENT & OPTIMALIZÁCIA (ongoing)

### ✅ Checklist:
- [ ] Vytvoriť FAQ stránku
- [ ] Blog setup
- [ ] Dlhšie descriptions apartmánov (min 300 slov)
- [ ] Internal linking
- [ ] Breadcrumbs
- [ ] Okolie Trenčína stránka

---

### 3.1 FAQ Stránka

**Vytvoriť:** `src/app/(main)/faq/page.tsx`

**Obsah:**
- 10-15 často kladených otázok
- Použiť FAQ schema (z fázy 2.2)
- Kategórie: Rezervácia, Platba, Apartmány, Lokalita

**SEO optimalizácia:**
```tsx
export const metadata = {
  title: 'Často kladené otázky – Apartmány Vita Trenčín',
  description: 'Odpovede na najčastejšie otázky o ubytovaní v Apartmánoch Vita Trenčín. Check-in, parkovanie, WiFi, platba a ďalšie.',
  keywords: ['FAQ apartmány Trenčín', 'otázky ubytovanie Trenčín'],
};
```

---

### 3.2 Blog Setup

**Prečo blog:**
- ✅ Dlhodobý SEO traffic
- ✅ Budovanie autority
- ✅ Long-tail keywords
- ✅ Internal linking

**Návrh štruktúry:**
```
/blog
  /10-veci-co-robit-v-trencine
  /preco-navstivit-trencin
  /apartmany-vs-hotel-co-je-lepsie
  /ako-si-vybrat-apartman-v-trencine
  /trenčiansky-hrad-historia-a-tipy
  /najlepsie-restauracie-v-trencine
  /vikend-v-trencine-itinerar
```

**Prvých 5 článkov (priorita):**

1. **"10 vecí čo robiť v Trenčíne"** (1500 slov)
   - Keywords: čo robiť v Trenčíne, atrakcie Trenčín
   - Internal link: apartmány Vita

2. **"Prečo navštíviť Trenčín v roku 2025"** (1200 slov)
   - Keywords: návšteva Trenčína, víkend v Trenčíne
   - Internal link: rezervácia

3. **"Apartmány vs. Hotel – čo je lepšie?"** (1000 slov)
   - Keywords: apartmány vs hotel, ubytovanie Trenčín
   - Internal link: naše apartmány

4. **"Ako si vybrať apartmán v Trenčíne"** (1200 slov)
   - Keywords: výber apartmánu, ubytovanie Trenčín
   - Internal link: Design, Lite, Deluxe

5. **"Trenčiansky hrad – história a tipy na návštevu"** (1500 slov)
   - Keywords: Trenčiansky hrad, hrad Trenčín
   - Internal link: ubytovanie pri hrade

---

### 3.3 Dlhšie Descriptions Apartmánov

**Aktuálny stav:** ~100-150 slov  
**Cieľ:** min 300-400 slov

**Štruktúra description:**

```markdown
# Apartmán Vita [Názov] Trenčín

## Úvod (100 slov)
- Krátky popis apartmánu
- Hlavné výhody
- Pre koho je vhodný

## Vybavenie (100 slov)
- Detailný zoznam vybavenia
- Špecifické features
- Čo je v cene

## Lokalita (50 slov)
- Vzdialenosť od centra
- Atrakcie v okolí
- Doprava

## Fotogaléria
- Min 10 fotiek
- Alt tagy s keywords

## Recenzie (ak sú)
- Citácie od hostí
- Rating

## Rezervácia
- CTA button
- Ceny
- Dostupnosť
```

---

### 3.4 Internal Linking

**Stratégia:**

**A) Breadcrumbs**
```
Home > Apartmány > Design Apartmán
```

**B) Related apartments**
```
"Pozrite si aj:"
- Apartmán Vita Lite (lacnejšia alternatíva)
- Apartmán Vita Deluxe (luxusnejšia alternatíva)
```

**C) Blog → Apartments**
```
V článku "10 vecí čo robiť v Trenčíne":
"Po dni plnom zážitkov sa môžete ubytovať v našich [apartmánoch Vita Trenčín](link)."
```

**D) Footer links**
```
- Naše apartmány
  - Design Apartmán
  - Lite Apartmán
  - Deluxe Apartmán
- Rezervácia
- Blog
- FAQ
- Kontakt
```

---

### 3.5 Okolie Trenčína Stránka

**Vytvoriť:** `src/app/(main)/okolie/page.tsx`

**Obsah:**
- Mapa Trenčína s atrakciami
- Top 10 atrakcií
- Reštaurácie
- Doprava
- Parkovanie
- Obchody

**SEO optimalizácia:**
```tsx
export const metadata = {
  title: 'Okolie a atrakcie – Apartmány Vita Trenčín',
  description: 'Objavte Trenčín a okolie. Trenčiansky hrad, centrum mesta, reštaurácie a atrakcie v blízkosti Apartmánov Vita.',
  keywords: ['atrakcie Trenčín', 'čo robiť v Trenčíne', 'Trenčianský hrad'],
};
```

---

## 📊 MERANIE VÝSLEDKOV

### Google Search Console

**Čo sledovať:**
- Počet indexovaných stránok
- Impressions (zobrazenia)
- Clicks (kliky)
- CTR (Click-through rate)
- Average position (priemerná pozícia)
- Top keywords

**Cieľové metriky (3 mesiace):**
```
Impressions: 10,000+/mesiac
Clicks: 500+/mesiac
CTR: 5%+
Average position: Top 10 pre hlavné keywords
```

---

### Google Analytics

**Čo sledovať:**
- Návštevnosť (sessions)
- Bounce rate
- Priemerný čas na stránke
- Konverzie (rezervácie)
- Traffic sources

**Cieľové metriky (3 mesiace):**
```
Sessions: 2,000+/mesiac
Bounce rate: <50%
Avg. session duration: 2+ minúty
Conversion rate: 2-5%
```

---

### Google My Business

**Čo sledovať:**
- Zobrazenia profilu
- Kliky na web
- Kliky na telefón
- Kliky na navigáciu
- Recenzie

**Cieľové metriky (3 mesiace):**
```
Profile views: 1,000+/mesiac
Website clicks: 200+/mesiac
Phone calls: 50+/mesiac
Reviews: 10+ (4.5+ rating)
```

---

## 🎯 ČASOVÝ HARMONOGRAM

### Týždeň 1 (5-11 október 2025)
- [x] Google Search Console setup
- [x] Fáza 1: Kritické úpravy (H1, schema, alt tagy) ✅
- [x] FAQ schema ✅
- [ ] Google My Business registrácia

### Týždeň 2 (12-18 október 2025)
- [ ] Google My Business optimalizácia
- [ ] Lokálne adresáre (Mapy.cz, Firmy.sk, Zoznam.sk)
- [ ] FAQ stránka
- [ ] Prvé 2 blog články

### Týždeň 3-4 (19 október - 1 november 2025)
- [ ] Dlhšie descriptions apartmánov
- [ ] Internal linking
- [ ] Breadcrumbs
- [ ] Okolie Trenčína stránka
- [ ] Ďalšie 3 blog články

### Mesiac 2-3 (november - december 2025)
- [ ] Získanie prvých recenzií
- [ ] Optimalizácia na základe dát z GSC
- [ ] Ďalšie blog články (1-2/mesiac)
- [ ] Backlink building

---

## 🚀 OČAKÁVANÉ VÝSLEDKY

### Po 1 mesiaci:
- ✅ Všetky stránky indexované
- ✅ Zobrazenie v Google Maps
- ✅ Prvé kliky z Google Search
- ✅ 5-10 recenzií na GMB

### Po 3 mesiacoch:
- ✅ Top 10 pre hlavné keywords
- ✅ 500+ kliknutí/mesiac z Google
- ✅ 20+ recenzií (4.5+ rating)
- ✅ Stabilný organic traffic

### Po 6 mesiacoch:
- ✅ Top 3 pre hlavné keywords
- ✅ 1,000+ kliknutí/mesiac
- ✅ 50+ recenzií
- ✅ 30-50% rezervácií z organic search

---

## 📞 KONTAKT & PODPORA

**Ak narazíš na problém:**
1. Skontroluj tento dokument
2. Pozri Google Search Console
3. Skontroluj Google My Business
4. Kontaktuj ma pre pomoc

---

## ✅ FINÁLNY CHECKLIST

### Technické SEO
- [x] Sitemap.xml
- [x] Robots.txt
- [x] Google Search Console
- [x] H1 tagy opravené ✅
- [x] Alt tagy pridané ✅
- [x] Canonical URLs (už máš)
- [x] Meta robots (už máš)

### Structured Data
- [x] Organization schema
- [x] LocalBusiness schema
- [x] Hotel/LodgingBusiness schema ✅
- [x] Room schema ✅
- [x] FAQ schema ✅
- [ ] Review/AggregateRating schema (keď budeš mať recenzie)

### Local SEO
- [ ] Google My Business
- [ ] Mapy.cz
- [ ] Firmy.sk
- [ ] Zoznam.sk
- [ ] Recenzie (min 10)

### Content
- [ ] FAQ stránka
- [ ] Blog (min 5 článkov)
- [ ] Dlhšie descriptions (300+ slov)
- [ ] Okolie Trenčína stránka
- [ ] Internal linking
- [ ] Breadcrumbs

### Monitoring
- [ ] Google Analytics setup
- [ ] Google Search Console monitoring
- [ ] GMB insights monitoring
- [ ] Mesačné reporty

---

**Posledná aktualizácia:** 5. október 2025  
**Ďalšia revízia:** Po dokončení Fázy 1

---

🎯 **CIEĽ: 10/10 SEO hodnotenie do 3 mesiacov!**
