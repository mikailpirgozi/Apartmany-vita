# Discount System Documentation

## Prehľad

Implementovaný bol kompletný systém zliav na základe dĺžky pobytu, ktorý funguje nezávisle od registrácie používateľa a Beds24 systému. Zľavy sa automaticky aplikujú na našej stránke a odpočítavaju sa z výslednej ceny.

## Štruktúra zliav

### Úrovne zliav
- **7+ dní**: 10% zľava
- **14+ dní**: 15% zľava  
- **30+ dní**: 20% zľava

### Pravidlá
- Zľavy sa aplikujú automaticky na základe počtu nocí
- Vždy sa aplikuje najvyššia dostupná zľava
- Nepotrebuje registráciu ani prihlásenie
- Kombinuje sa s loyalty programom pre registrovaných používateľov
- Nezávislé od Beds24 - aplikuje sa na našej stránke

## Implementované súbory

### 1. Konfigurácia (`src/constants/index.ts`)
```typescript
export const STAY_DISCOUNTS = {
  WEEK_STAY: { minNights: 7, discount: 0.10, label: "7+ dní" },
  TWO_WEEK_STAY: { minNights: 14, discount: 0.15, label: "14+ dní" }, 
  MONTH_STAY: { minNights: 30, discount: 0.20, label: "30+ dní" }
} as const
```

### 2. Discount logika (`src/lib/discounts.ts`)
Hlavné funkcie:
- `calculateStayDiscount()` - vypočíta najlepšiu dostupnú zľavu
- `calculateDiscountBreakdown()` - kompletný rozpis zliav
- `getDiscountTiers()` - zoznam všetkých úrovní zliav
- `formatDiscount()` - formátovanie pre zobrazenie
- `qualifiesForDiscount()` - kontrola oprávnenosti
- `getNextDiscountTier()` - informácie o ďalšej úrovni

### 3. Pricing service (`src/services/pricing.ts`)
Rozšírené `BookingPricing` interface:
```typescript
export interface BookingPricing {
  // ... existujúce polia
  stayDiscount: number;
  stayDiscountPercent: number;
  stayDiscountInfo: StayDiscount | null;
}
```

### 4. UI komponenty

#### Booking Widget (`src/components/booking/booking-widget.tsx`)
- Zobrazuje aktívne zľavy v modrom boxe
- Informuje o možnostiach získania vyšších zliav
- Kombinuje s loyalty zľavami

#### Apartment Card (`src/components/apartment/apartment-card.tsx`)
- Zobrazuje pôvodnú cenu prečiarknutú
- Zobrazuje cenu po zľave modrou farbou
- Badge s percentom zľavy
- Informácia o type zľavy

#### Discount Info Component (`src/components/ui/discount-info.tsx`)
- Kompaktný a plný variant
- Prehľad všetkých dostupných zliav
- Tip o kombinácii s loyalty programom

## Testovanie

Kompletné testy v `src/lib/__tests__/discounts.test.ts`:
- 23 testov pokrývajúcich všetky scenáre
- Unit testy pre každú funkciu
- Edge cases a reálne scenáre
- Integračné testy s constants

## Použitie

### Základné použitie
```typescript
import { calculateStayDiscount } from '@/lib/discounts';

const nights = 14;
const subtotal = 1400;
const discount = calculateStayDiscount(nights, subtotal);

if (discount) {
  console.log(`Zľava: ${discount.discountPercent}% = €${discount.discountAmount}`);
}
```

### V komponente
```typescript
import { calculateDiscountBreakdown } from '@/lib/discounts';

const breakdown = calculateDiscountBreakdown(nights, subtotal);
const finalPrice = breakdown.discountedPrice;
```

## Výhody implementácie

### Pre používateľov
- ✅ Automatické zľavy bez registrácie
- ✅ Jasné zobrazenie úspor
- ✅ Motivácia k dlhším pobytom
- ✅ Kombinovateľné s loyalty programom

### Pre systém
- ✅ Nezávislé od Beds24
- ✅ Plne testované
- ✅ Type-safe TypeScript
- ✅ Modulárna architektúra
- ✅ Jednoduché rozšírenie

### Pre business
- ✅ Zvýšenie priemernej dĺžky pobytu
- ✅ Lepšia obsadenosť
- ✅ Konkurenčná výhoda
- ✅ Transparentné ceny

## Rozšírenia

Systém je navrhnutý pre jednoduché rozšírenia:

### Pridanie novej úrovne zľavy
```typescript
// V constants/index.ts
export const STAY_DISCOUNTS = {
  // ... existujúce
  EXTENDED_STAY: { minNights: 60, discount: 0.25, label: "60+ dní" }
} as const
```

### Sezónne zľavy
Možno rozšíriť o sezónne multiplikátory alebo špeciálne akcie.

### Kombinované zľavy
Systém už podporuje kombináciu s loyalty programom, možno pridať ďalšie typy.

## Monitoring a analytika

Odporúčame sledovať:
- Počet rezervácií s aplikovanými zľavami
- Priemerná dĺžka pobytu pred/po implementácii
- Revenue impact
- Conversion rate improvements

## Záver

Discount systém je plne funkčný a pripravený na produkčné použitie. Všetky testy prechádzajú, kód je čistý a dodržiava project standards. Systém automaticky motivuje zákazníkov k dlhším pobytom a zlepšuje používateľskú skúsenosť transparentným zobrazovaním zliav.

