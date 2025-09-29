# 🧹 Vyčistenie Service Worker Cache

## Problém:
Hydration errors sa vracajú aj po oprave → **Service Worker cachuje starú verziu stránky**

---

## ✅ Riešenie (jednorázové):

### **Option 1: DevTools Console (najrýchlejšie)**

1. Otvor Chrome DevTools (**Cmd+Option+J**)
2. Copy-paste tento kód do Console:

```javascript
// Unregister all service workers
navigator.serviceWorker.getRegistrations().then(function(registrations) {
  for(let registration of registrations) {
    console.log('Unregistering SW:', registration.scope);
    registration.unregister();
  }
  console.log('✅ All Service Workers unregistered');
});

// Clear all caches
caches.keys().then(function(names) {
  for (let name of names) {
    console.log('Deleting cache:', name);
    caches.delete(name);
  }
  console.log('✅ All caches cleared');
  console.log('🔄 Hard refresh now (Cmd+Shift+R)');
});
```

3. **Hard refresh**: **Cmd+Shift+R**
4. **Refresh ešte raz**: **Cmd+R**

---

### **Option 2: Chrome Settings (GUI)**

1. Otvor **DevTools** (Cmd+Option+J)
2. Choď na **Application** tab
3. V ľavom menu klikni **Service Workers**
4. Klikni **Unregister** pri každom Service Workerovi
5. V ľavom menu klikni **Cache Storage**
6. Delete všetky cache (pravý klik → Delete)
7. **Hard refresh**: **Cmd+Shift+R**

---

### **Option 3: Inkognito mode (dočasné riešenie)**

Inkognito mode nemá Service Worker z normálneho režimu → funguje správne

---

## 🎯 Ako overiť že je vyčistené:

1. DevTools → **Application** → **Service Workers**
   - Malo by byť prázdne ALEBO iba nový "apartmany-vita-v2"
   
2. DevTools → **Application** → **Cache Storage**
   - Malo by byť prázdne ALEBO iba cache s "v2" v názve
   - **NEMALO by byť**: apartmany-vita-calendar-v1, apartmany-vita-static-v1

---

## 📊 Po vyčistení:

✅ Hydration errors **zmiznú natrvalo**
✅ Normálny režim = inkognito režim (rovnaké správanie)
✅ Nový Service Worker v2 **nebude cachovať /booking**
✅ Vždy dostaneš fresh verziu stránky

---

## 🚀 Production:

Po Vercel deployi nového SW:
- Používatelia dostanú nový SW v2 automaticky
- Starý SW v1 sa deaktivuje
- Staré cache sa vymažú
- Booking page nebude cachovaná

**Jednorázovo musíš vyčistiť iba lokálne pre testovanie!**
