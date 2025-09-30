# 📅 Calendar Update - Modernizovaný vyhľadávací kalendár

## ✅ Čo bolo vylepšené

### 1. **Jeden kalendár s range selection** (namiesto 2 samostatných)
- ✅ Modernější UX ako používajú **Booking.com, Airbnb, Expedia**
- ✅ Klik na prvý dátum = check-in, klik na druhý = check-out
- ✅ Vizuálne zvýraznený celý rozsah pobytu
- ✅ Automatické zatváranie po výbere oboch dátumov

### 2. **Blokovanie spätných dátumov**
- ✅ Automaticky zakázané minulé dátumy
- ✅ Vizuálne označené (preškrtnuté, šedé)
- ✅ Nemožné vybrať spätný dátum

### 3. **Shadcn dizajn štýl**
- ✅ Pekné zvýraznenie vybraného rozsahu (primary farba)
- ✅ Svetlé pozadie pre dni medzi check-in a check-out
- ✅ Hover efekty a smooth transitions
- ✅ Dnes je označený bold fontom
- ✅ Disabled dátumy sú preškrtnuté

### 4. **Responzívny dizajn**
- ✅ **Desktop:** 2 mesiace vedľa seba
- ✅ **Mobile:** 1 mesiac (automatická detekcia)
- ✅ Optimalizované pre malé obrazovky

### 5. **Vylepšený layout vyhľadávacieho formulára**
- ✅ Kalendár má 2/3 šírky, hostia 1/3
- ✅ Vyhľadávacie tlačidlo je veľké a centrálne
- ✅ Lepšie spacing a čitateľnosť

## 📁 Zmenené súbory

### Nové:
- `src/components/ui/date-range-picker.tsx` - Nový DateRangePicker komponent

### Upravené:
- `src/components/search/apartment-search.tsx` - Hlavný vyhľadávací widget
- `src/components/ui/calendar.tsx` - Vylepšený dizajn shadcn kalendára

## 🎨 Dizajnové vlastnosti

```tsx
// Range selection farby:
- Check-in dátum: primary farba (bold)
- Check-out dátum: primary farba (bold)
- Dni medzi: primary/10 opacity (svetlé zvýraznenie)
- Dnes: accent/50 (bold)
- Disabled: šedá + preškrtnuté
- Hover: accent background
```

## 🚀 Použitie

### ApartmentSearch widget
```tsx
<ApartmentSearch 
  initialValues={{
    checkIn: new Date(),
    checkOut: new Date(Date.now() + 86400000 * 3),
    guests: 2,
    children: 0
  }}
/>
```

### Samostatný DateRangePicker
```tsx
<DateRangePicker
  value={dateRange}
  onChange={setDateRange}
  minDate={new Date()}
  numberOfMonths={2}
  placeholder="Príchod → Odchod"
/>
```

## 📱 Responzivita

- **>= 768px (md):** 2 mesiace, horizontálny grid (3 stĺpce: kalendár 2/3, hostia 1/3)
- **< 768px (mobile):** 1 mesiac, vertikálny stack

## ✨ UX vylepšenia

1. **Automatické zatvorenie:** Popover sa automaticky zatvorí po výbere oboch dátumov
2. **Vizuálny feedback:** Jasne viditeľný range selection
3. **Prevencia chýb:** Nemožné vybrať spätné dátumy
4. **Rýchly výber:** Jeden kalendár = menej klikania
5. **Lokalizácia:** Slovenské formátovanie dátumov (`d. MMM yyyy`)

## 🔧 Validácia

```typescript
// Automatická validácia:
- minDate kontrola (disabled past dates)
- Range check (from < to)
- Required check (oba dátumy musia byť vybrané)
- Error messages v slovenčine
```

## 🎯 Porovnanie: Pred vs. Po

### PRED:
- ❌ 2 samostatné date pickery (check-in, check-out)
- ❌ Native HTML `<input type="date">` (rôzny vzhľad v browseroch)
- ❌ Možnosť vybrať spätné dátumy (len frontend validácia)
- ❌ Žiadne vizuálne zvýraznenie range

### PO:
- ✅ Jeden moderný range picker
- ✅ Konzistentný shadcn dizajn
- ✅ Automatické blokovanie minulosti
- ✅ Vizuálne zvýraznený celý pobyt
- ✅ Responzívny (1-2 mesiace)

## 🌐 Kde sa používa

1. **Homepage** (`/`) - Hero search widget
2. **Apartments page** (`/apartments`) - Filter widget
3. Všade kde je `<ApartmentSearch />` komponent

## 📊 Technické detaily

- **Library:** `react-day-picker` (shadcn kalendár)
- **Locale:** Slovak (`date-fns/locale/sk`)
- **Mode:** `range` selection
- **State:** React `useState` + controlled component
- **Validation:** Client-side + server-side ready

---

**Status:** ✅ Implementované a pripravené na produkciu
**Testovanie:** Manuálne testovanie na homepage a /apartments stránke odporúčané

