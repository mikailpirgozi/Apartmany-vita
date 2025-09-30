# 🔧 VERCEL DATABASE FIX - Finálne riešenie

## 🚨 PROBLÉM
Error: `the URL must start with the protocol 'prisma://' or 'prisma+postgres://'`

## ✅ ČO SME SPRAVILI
1. ✅ Pridali `directUrl = env("DIRECT_DATABASE_URL")` do `prisma/schema.prisma`
2. ✅ Pushli na GitHub
3. ⏳ Čakáme na Vercel deployment (2-3 min)

## 🎯 KRITICKÉ: Skontrolujte Vercel Environment Variables

### Choďte do Vercel Dashboard:
```
https://vercel.com/dashboard
→ Váš projekt "apartmany-vita"
→ Settings → Environment Variables
```

### Musíte mať OBOJE:

#### 1. DATABASE_URL
```
Name: DATABASE_URL
Value: postgresql://default:xxx@xxx.postgres.vercel-storage.com:5432/verceldb
       ^ MUSÍ začínať s "postgresql://" nie "postgres://"
Environment: ✅ Production, ✅ Preview
```

#### 2. DIRECT_DATABASE_URL  
```
Name: DIRECT_DATABASE_URL
Value: postgres://default:xxx@xxx.postgres.vercel-storage.com:5432/verceldb
       ^ Môže začínať s "postgres://" (je to direct connection)
Environment: ✅ Production, ✅ Preview
```

## 🔍 AKO TO FUNGUJE:

- **`DATABASE_URL`** - Používa sa pre Prisma Client (runtime queries)
  - Musí byť `postgresql://` (s "ql")
  - Alebo `prisma://` (ak používate Accelerate)

- **`DIRECT_DATABASE_URL`** - Používa sa pre migrations a direct operations
  - Môže byť `postgres://` (bez "ql")
  - Direct connection na databázu

## ⚠️ AK DATABASE_URL ZAČÍNA S "postgres://"

Musíte to zmeniť na `postgresql://` (pridať "ql"):

### Postup:
1. Vercel Dashboard → Settings → Environment Variables
2. Nájdite `DATABASE_URL`
3. Kliknite "..." (tri bodky) → Edit
4. Zmeňte začiatok z `postgres://` na `postgresql://`
5. Save
6. Redeploy (Deployments → Redeploy)

## 🧪 TESTOVANIE PO DEPLOYMENTE

### 1. Počkajte na deployment (2-3 min)
Sledujte: https://vercel.com/dashboard → Deployments

### 2. Otvorte Vercel Function Logs
```
Deployments → Najnovší deployment → Function Logs
```

### 3. Testujte booking flow:
```
1. https://apartmany-vita.vercel.app/apartments
2. Vyberte Deluxe Apartmán
3. Vyberte dátumy (napr. 1.11 - 3.11)
4. Vyberte 2 dospelých
5. Kliknite "Rezervovať"
```

### 4. ČO BY MALO BYŤ:
✅ Presmerovanie na `/booking?apartment=deluxe-apartman&...`
✅ Zobrazí sa booking form s cenami
✅ Vidíte extras (prístelka, skorý príchod, atď.)
✅ Môžete kliknúť "Pokračovať na platbu"

### 5. ČO BY NEMALO BYŤ:
❌ Redirect späť na `/apartments/deluxe-apartman?error=pricing`
❌ Error message v URL
❌ Prázdna stránka

## 🐛 AK TO STÁLE NEFUNGUJE

### Krok 1: Skontrolujte Function Logs
```
Vercel Dashboard → Deployments → Najnovší → Function Logs
Hľadajte:
- "DATABASE ERROR"
- "Prisma validation error"
- "Invalid database URL"
```

### Krok 2: Overte Environment Variables
```
Settings → Environment Variables
Skontrolujte:
✅ DATABASE_URL existuje a začína s "postgresql://"
✅ DIRECT_DATABASE_URL existuje
✅ Oboje majú "Production" environment zaškrtnuté
```

### Krok 3: Force Redeploy
```
Deployments → Najnovší deployment → ... → Redeploy
Zaškrtnite: "Use existing build cache" = OFF
Kliknite Redeploy
```

## 📊 VERCEL POSTGRES SPRÁVNY FORMÁT

Ak používate Vercel Postgres, správny formát je:

```env
# DATABASE_URL (pre Prisma Client)
DATABASE_URL="postgresql://default:AbCd1234...@ep-xxx-xxx.eu-central-1.aws.neon.tech:5432/verceldb?sslmode=require&pgbouncer=true"

# DIRECT_DATABASE_URL (pre migrations)
DIRECT_DATABASE_URL="postgres://default:AbCd1234...@ep-xxx-xxx.eu-central-1.aws.neon.tech:5432/verceldb?sslmode=require"
```

Všimnite si rozdiely:
- DATABASE_URL má `postgresql://` a `&pgbouncer=true`
- DIRECT_DATABASE_URL má `postgres://` a NEMÁ `&pgbouncer=true`

## 🎯 QUICK FIX SUMMARY

1. ✅ Pushli sme Prisma schema update
2. ⏳ Čakáme na Vercel deployment
3. 🔍 **SKONTROLUJTE DATABASE_URL vo Vercel** (musí byť `postgresql://`)
4. 🔄 Redeploy ak treba
5. 🧪 Testujte booking flow

## 💡 PREČO SA TO STALO?

Vercel Postgres automaticky vytvorí dve premenné:
- `POSTGRES_URL` - začína s `postgres://`
- `POSTGRES_URL_NON_POOLING` - začína s `postgres://`

Ale Prisma vyžaduje:
- `DATABASE_URL` - musí začínať s `postgresql://` (s "ql")
- `DIRECT_DATABASE_URL` - môže byť `postgres://`

Takže musíte **manuálne vytvoriť** `DATABASE_URL` s `postgresql://` prefixom.

---

**🚀 Po dokončení deploymentu otestujte a dajte mi vedieť!**
