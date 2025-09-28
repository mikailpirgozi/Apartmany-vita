# Beds24 API Schemas

Tento priečinok obsahuje TypeScript schémy pre Beds24 API, rozdelené do logických kategórií pre lepšiu organizáciu a údržbu.

## Štruktúra súborov

### 📁 beds24-api-schemas.ts
**Základné API typy a odpovede**
- `SuccessfulApiResponse<T>` - Úspešná API odpoveď
- `UnsuccessfulApiResponse` - Neúspešná API odpoveď
- `Token`, `TokenDetails` - Autentifikačné tokeny
- `MultiplePostResponse` - Odpoveď pre viacero operácií
- Všetky základné enum typy (BookingStatus, PropertyType, atď.)

### 📁 beds24-booking-schemas.ts
**Rezervačné typy**
- `Booking` - Kompletná rezervácia
- `NewBooking` - Nová rezervácia (bez ID)
- `BookingGuests` - Hostia rezervácie
- `BookingActions` - Akcie pre rezervácie
- `InvoiceItem`, `Invoice` - Fakturačné položky
- `Message`, `HostMessage` - Správy medzi hostiteľom a hosťom

### 📁 beds24-property-schemas.ts
**Typy pre nehnuteľnosti**
- `Property` - Kompletná nehnuteľnosť
- `PropertyText` - Texty v rôznych jazykoch
- `PropertyOffer` - Ponuky nehnuteľnosti
- Nastavenia platobných brán
- Booking pravidlá a obmedzenia

### 📁 beds24-room-schemas.ts
**Typy pre izby**
- `Room` - Kompletná izba/room type
- `RoomDependencies` - Závislosti medzi izbami
- `RoomText` - Texty izby v rôznych jazykoch
- `RoomUnit` - Jednotlivé jednotky izby
- `PriceRule` - Cenové pravidlá

### 📁 beds24-availability-schemas.ts
**Typy pre dostupnosť a kalendár**
- `Availability` - Dostupnosť izby
- `UnitBookings` - Rezervácie jednotiek
- `Calendar`, `CalendarEntry` - Kalendárne údaje
- `FixedPrice` - Fixné ceny pre obdobie

### 📁 beds24-account-schemas.ts
**Typy pre účty a používateľov**
- `Account` - Účet v Beds24
- `OrganizationUser` - Používateľ organizácie
- `AirbnbListing` - Airbnb listing
- Review typy

### 📁 beds24-settings-schemas.ts
**Nastavenia a konfigurácie**
- `ICalExportSettings`, `ICalImportSettings` - iCal import/export
- `NukiSettings` - Nuki smart lock nastavenia
- `VrboSettings`, `AirbnbSettings` - Channel nastavenia
- `ChannelSettingsTemplate` - Template pre channel nastavenia

### 📁 beds24-payment-schemas.ts
**Platobné typy**
- Všetky Stripe relatívne typy
- `VrboPaymentSchedule` - VRBO platobný plán

## Použitie

### Základný import
```typescript
import { Booking, Property, Room } from '@/types/beds24';
```

### Import konkrétnych typov
```typescript
import { 
  SuccessfulApiResponse, 
  BookingStatus, 
  PropertyType 
} from '@/types/beds24-api-schemas';

import { Booking, NewBooking } from '@/types/beds24-booking-schemas';
```

### Použitie v API službách
```typescript
import { Booking, SuccessfulApiResponse } from '@/types/beds24';

// API odpoveď
const response: SuccessfulApiResponse<Booking[]> = await fetch('/api/bookings');

// Nová rezervácia
const newBooking: NewBooking = {
  roomId: 123,
  arrival: '2024-01-01',
  departure: '2024-01-05',
  numAdult: 2,
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com'
};
```

## Dôležité poznámky

1. **Dátové formáty**: Dátumy sú vo formáte `YYYY-MM-DD`
2. **Časové formáty**: Čas je vo formáte `HH:mm`
3. **Enum typy**: Všetky enum typy sú definované ako union types pre lepšiu type safety
4. **Optional polia**: Všetky optional polia sú označené `?`
5. **Nullable polia**: Polia ktoré môžu byť `null` sú označené `| null`

## Rozšírenie schém

Pri pridávaní nových schém:
1. Vyberte vhodný súbor podľa kategórie
2. Pridajte typ s TypeScript dokumentáciou
3. Exportujte typ v index súbore
4. Aktualizujte túto dokumentáciu

## Kompatibilita

Schémy sú kompatibilné s:
- TypeScript 4.5+
- Beds24 API v2
- Next.js 13+
- React 18+
