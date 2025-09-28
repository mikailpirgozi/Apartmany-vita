# 🚨 ANALÝZA CENOVÝCH PROBLÉMOV - BEDS24 API

## 📋 **IDENTIFIKOVANÉ PROBLÉMY**

### **1. DUPLICITNÁ CENOVÁ LOGIKA**
**Problém:** Ceny sa počítajú na 2 miestach s rôznou logikou

**Kde:**
- `parseInventoryOffersResponseV2()` v beds24.ts (riadok 1230-1250)
- `availability` endpoint v route.ts (riadok 175-180)

**Dôsledok:**
- Offers API: 858€ (5 osôb, 2 noci)
- Availability API: 592€ (rovnaký scenár)
- **Rozdiel: 266€!**

### **2. NESPRÁVNA SEZÓNNA LOGIKA**
**Problém:** Október je označený ako "off-season"

**Kde:**
- `applyDiscounts()` metóda (riadok 1840)
- Podmienka: `month >= 10 || month <= 3`

**Dôsledok:**
- Október dostáva 20% zľavu namiesto normálnej ceny
- Nesprávne cenové výpočty pre jesenné mesiace

### **3. KONFLIKT MEDZI BEDS24 A VLASTNÝMI CENAMI**
**Problém:** Aplikujeme vlastné zľavy na už upravené ceny z Beds24

**Kde:**
- Beds24 už vracia dynamické ceny podľa počtu osôb
- Naša logika ešte pridáva vlastné príplatky a zľavy

**Dôsledok:**
- Dvojité aplikovanie príplatkov za osoby
- Nekonzistentné ceny medzi kalendárom a booking procesom

## 🔧 **NAVRHOVANÉ RIEŠENIA**

### **RIEŠENIE 1: Unifikácia cenovej logiky**
```typescript
// Jeden zdroj pravdy pre ceny
interface PricingStrategy {
  source: 'beds24' | 'fallback';
  applyOwnDiscounts: boolean;
  applyGuestSurcharge: boolean;
}
```

### **RIEŠENIE 2: Oprava sezónnej logiky**
```typescript
// Správne sezónne mesiace
const isOffSeason = (month: number): boolean => {
  // November-Február = off-season
  return month >= 11 || month <= 2;
};
```

### **RIEŠENIE 3: Jasné rozdelenie zodpovedností**
- **Beds24 API**: Poskytuje základné ceny + guest count pricing
- **Naša logika**: Aplikuje len sezónne a stay length zľavy
- **Kalendár**: Zobrazuje základné ceny bez zliav
- **Booking**: Aplikuje všetky zľavy

## 📊 **TESTOVÉ SCENÁRE PRE OVERENIE**

### **Scenár 1: Základné ceny**
- Deluxe, 2 osoby, 2 noci, október
- **Očakávaný výsledok**: Beds24 cena bez zliav
- **Aktuálny problém**: 20% off-season zľava v októbri

### **Scenár 2: Príplatok za osoby**
- Deluxe, 5 osôb, 2 noci, október
- **Očakávaný výsledok**: Beds24 cena s guest count (370€)
- **Aktuálny problém**: Dvojité aplikovanie príplatkov

### **Scenár 3: Dlhé pobyty**
- Deluxe, 2 osoby, 30 nocí, október
- **Očakávaný výsledok**: Beds24 základná cena + 30% monthly zľava
- **Aktuálny problém**: Nekonzistentné výpočty

## 🎯 **PRIORITA OPRÁV**

1. **VYSOKÁ**: Opraviť sezónnu logiku (október nie je off-season)
2. **VYSOKÁ**: Unifikovať cenovú logiku medzi API endpoints
3. **STREDNÁ**: Jasne definovať kedy aplikovať vlastné vs Beds24 ceny
4. **NÍZKA**: Optimalizovať performance cenových výpočtov

## 📝 **POZNÁMKY PRE IMPLEMENTÁCIU**

- Zachovať spätnu kompatibilitu s existujúcimi booking
- Testovať všetky cenové scenáre pred nasadením
- Dokumentovať novú cenovú logiku
- Pridať unit testy pre cenové výpočty
