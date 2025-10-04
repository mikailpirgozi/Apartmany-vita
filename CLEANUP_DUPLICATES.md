# Cleanup Duplicitných Komponentov

## 📊 Analýza duplicít

### 1. AI Chatbot Komponenty (3 verzie)
```
src/components/chat/
├── ai-chatbot.tsx          ✅ KEEP (najnovší, 15K, Sep 29)
├── ai-chatbot-new.tsx      ❌ DELETE (starší, Sep 27)
└── ai-chatbot 2.tsx        ❌ DELETE (backup, Sep 28)
```

**Status:** Chatbot je zakomentovaný v `layout.tsx`  
**Akcia:** Vymazať staré verzie, ponechať `ai-chatbot.tsx`

---

### 2. Mobile Menu Komponenty (3 verzie)
```
src/components/layout/
├── mobile-menu.tsx             ❌ DELETE (nepoužíva sa)
├── mobile-menu-simple.tsx      ✅ KEEP (používa header.tsx)
└── simple-mobile-menu.tsx      ✅ KEEP (používa simple-header.tsx)
```

**Použitie:**
- `header.tsx` → `MobileMenuSimple` (z `mobile-menu-simple.tsx`)
- `simple-header.tsx` → `SimpleMobileMenu` (z `simple-mobile-menu.tsx`)
- `test-menu/page.tsx` → `MobileMenuSimple`

**Akcia:** Vymazať `mobile-menu.tsx` (nepoužíva sa)

---

### 3. User Menu Komponenty (2 verzie)
```
src/components/layout/
├── user-menu.tsx           ✅ KEEP (používa header.tsx)
└── simple-user-menu.tsx    ✅ KEEP (používa simple-header.tsx)
```

**Použitie:**
- `header.tsx` → `UserMenu`
- `simple-header.tsx` → `SimpleUserMenu`

**Akcia:** Ponechať obe (rôzne účely)

---

### 4. Header Komponenty (2 verzie)
```
src/components/layout/
├── header.tsx          ✅ KEEP (main header)
└── simple-header.tsx   ✅ KEEP (simplified version)
```

**Akcia:** Ponechať obe (rôzne účely)

---

## ✅ Akčný plán

### Vymazať (3 súbory):
1. ❌ `src/components/chat/ai-chatbot-new.tsx`
2. ❌ `src/components/chat/ai-chatbot 2.tsx`
3. ❌ `src/components/layout/mobile-menu.tsx`

### Ponechať (7 súborov):
1. ✅ `src/components/chat/ai-chatbot.tsx`
2. ✅ `src/components/layout/mobile-menu-simple.tsx`
3. ✅ `src/components/layout/simple-mobile-menu.tsx`
4. ✅ `src/components/layout/user-menu.tsx`
5. ✅ `src/components/layout/simple-user-menu.tsx`
6. ✅ `src/components/layout/header.tsx`
7. ✅ `src/components/layout/simple-header.tsx`

---

## 📊 Výsledok

- **Pred:** 10 komponentov
- **Po:** 7 komponentov
- **Vymazané:** 3 duplicity
- **Ušetrené:** ~45KB kódu

---

**Status:** ✅ READY TO EXECUTE
