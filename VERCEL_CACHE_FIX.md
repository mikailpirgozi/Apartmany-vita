# 🔧 Vercel Cache Issues - FIXED

## 🎯 Problém
Aplikácia mala časté cache problémy na Verceli, najmä s Prisma clientom.

---

## 🔴 Príčiny (čo bolo zlé)

### 1️⃣ **Konflikt Prisma adapterov**
```json
// ❌ ZLÝCH SETUP
"@auth/prisma-adapter": "^1.6.0",        // NextAuth v5
"@next-auth/prisma-adapter": "^1.0.7",   // NextAuth v4
```
**Dôsledok**: Vercel nevie ktorý adapter použiť → cache konflikt

### 2️⃣ **Prisma CLI v production dependencies**
```json
// ❌ ZLÉ
"dependencies": {
  "prisma": "^6.16.2"  // CLI má byť v devDependencies!
}
```
**Dôsledok**: Build procesuje Prisma 2x → cache confusion

### 3️⃣ **Custom install command v vercel.json**
```json
// ❌ ZLÉ
"installCommand": "pnpm install --frozen-lockfile && pnpm rebuild @prisma/client @prisma/engines"
```
**Dôsledok**: Rebuild počas install → konflikt s postinstall hook

### 4️⃣ **Prisma build-time environment variables**
```json
// ❌ ZLÉ
"build": {
  "env": {
    "PRISMA_GENERATE_DATAPROXY": "false",
    "PRISMA_CLIENT_ENGINE_TYPE": "binary"
  }
}
```
**Dôsledok**: Vercel cache si pamätá staré build-time env vars

### 5️⃣ **pnpm.onlyBuiltDependencies**
```json
// ❌ ZLÉ
"pnpm": {
  "onlyBuiltDependencies": ["@prisma/client", "@prisma/engines", "prisma"]
}
```
**Dôsledok**: Núti rebuildy ktoré spôsobujú cache problémy

---

## ✅ Riešenie (čo je SPRÁVNE)

### 1️⃣ **Jeden Prisma adapter**
```json
// ✅ SPRÁVNE
"dependencies": {
  "@next-auth/prisma-adapter": "^1.0.7"  // Len jeden!
}
```

### 2️⃣ **Prisma CLI v devDependencies**
```json
// ✅ SPRÁVNE
"devDependencies": {
  "prisma": "^6.16.2"  // CLI pre development
},
"dependencies": {
  "@prisma/client": "^6.16.2"  // Runtime client
}
```

### 3️⃣ **Clean vercel.json**
```json
// ✅ SPRÁVNE - Vercel vie sám
{
  "framework": "nextjs",
  "functions": {
    "src/app/api/**/*.ts": {
      "maxDuration": 30
    }
  }
}
```

### 4️⃣ **Postinstall hook v package.json**
```json
// ✅ SPRÁVNE
"scripts": {
  "postinstall": "prisma generate",
  "build": "prisma generate && next build"
}
```

### 5️⃣ **Žiadne custom pnpm settings**
```json
// ✅ SPRÁVNE - nič špeciálne pre Prisma
{
  "name": "apartmany-vita",
  "scripts": { ... }
}
```

---

## 🚀 Deployment workflow (SPRÁVNY)

### Vercel automaticky:
1. ✅ `pnpm install` (nainštaluje dependencies)
2. ✅ `postinstall` hook spustí `prisma generate`
3. ✅ `pnpm run build` spustí `prisma generate && next build`
4. ✅ Deploy

**Žiadne custom commandy! Vercel vie čo robí!** 🎉

---

## 🔧 Ak cache problémy pretrvávajú

### Option 1: Clear cache v Vercel Dashboard
1. **Settings** → **General** → scroll dole
2. **"Clear Build Cache"** button

### Option 2: Redeploy bez cache
1. **Deployments** → najnovší deployment
2. Klikni **3 bodky** (...)
3. **"Redeploy"**
4. ✅ **Vypni "Use existing Build Cache"**

### Option 3: Force rebuild s prázdnym commitom
```bash
git commit --allow-empty -m "chore: force rebuild"
git push
```

---

## 📊 Checklist pre budúcnosť

Pri ďalších Prisma projektoch na Verceli:

- [ ] Len jeden Prisma adapter v dependencies
- [ ] Prisma CLI v devDependencies
- [ ] @prisma/client v dependencies
- [ ] Postinstall hook: `prisma generate`
- [ ] Build script: `prisma generate && next build`
- [ ] Clean vercel.json (žiadne custom commandy)
- [ ] Žiadne Prisma env vars v build config
- [ ] Žiadne pnpm.onlyBuiltDependencies

---

## 🎯 Výsledok

**Pred opravou**: Cache problémy pri každej Prisma zmene
**Po oprave**: Clean builds, Vercel cache funguje správne ✅

---

**Fixed**: 2025-09-30
**Commit**: c218c85

