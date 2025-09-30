# 🚀 VERCEL POSTGRES MIGRATION - Step by Step Guide

## 📋 KROKY (15 minút)

### Krok 1: Backup Railway Database

```bash
# Export všetkých dát z Railway
pg_dump postgresql://postgres:FhMsbTSJYcndpebXfFIqmlcIamWpdCSG@shinkansen.proxy.rlwy.net:20490/railway > railway_backup_$(date +%Y%m%d).sql

# Skontrolujte že backup je OK
ls -lh railway_backup_*.sql
```

### Krok 2: Vytvorte Vercel Postgres Database

```
1. Choďte na: https://vercel.com/dashboard
2. Vyberte váš projekt "apartmany-vita"
3. Kliknite "Storage" tab (v hornom menu)
4. Kliknite "Create Database"
5. Vyberte "Postgres"
6. Kliknite "Continue"
7. Database Name: apartmany-vita-db
8. Region: Frankfurt, Germany (eu-central-1) - najbližšie k SR
9. Kliknite "Create"
```

**Vercel vytvorí database a automaticky pridá environment variables!**

### Krok 3: Skontrolujte Environment Variables

Po vytvorení databázy choďte do:
```
Settings → Environment Variables
```

Vercel automaticky vytvoril:
```
POSTGRES_URL - pooled connection
POSTGRES_URL_NON_POOLING - direct connection
POSTGRES_PRISMA_URL - optimized for Prisma
POSTGRES_URL_NO_SSL - without SSL
POSTGRES_DATABASE - database name
POSTGRES_HOST - host
POSTGRES_PASSWORD - password
POSTGRES_USER - username
```

### Krok 4: Nastavte DATABASE_URL a DIRECT_DATABASE_URL

Vercel **nevytvorí automaticky** `DATABASE_URL`, musíte to spraviť manuálne:

```
Settings → Environment Variables → Add New

Name: DATABASE_URL
Value: ${POSTGRES_PRISMA_URL}
Environment: ✅ Production, ✅ Preview

Name: DIRECT_DATABASE_URL
Value: ${POSTGRES_URL_NON_POOLING}
Environment: ✅ Production, ✅ Preview

Save
```

**${VARIABLE}** syntax znamená že Vercel použije hodnotu z existujúcej premennej!

### Krok 5: Importujte Data z Railway

```bash
# 1. Získajte POSTGRES_URL_NON_POOLING z Vercel Dashboard
# Settings → Environment Variables → POSTGRES_URL_NON_POOLING → Reveal Value

# 2. Exportujte do environment variable
export VERCEL_DB_URL="postgres://default:xxx@xxx-pooler.xxx.vercel-storage.com:5432/verceldb"

# 3. Importujte backup
psql $VERCEL_DB_URL < railway_backup_20250930.sql
```

**Alebo** spustite migrations nanovo (ak nemáte dôležité data):
```bash
# Nastavte DATABASE_URL na Vercel Postgres
export DATABASE_URL=$VERCEL_DB_URL

# Spustite migrations
npx prisma migrate deploy

# Seed data (apartmány)
npx prisma db seed
```

### Krok 6: Redeploy Aplikáciu

```
Deployments → Redeploy
(Môžete použiť cache, Vercel Postgres funguje)
```

### Krok 7: Sledujte Build Logs

Mali by ste vidieť:
```
✔ Generated Prisma Client (v6.16.2, engine=library)  ← NIE engine=none!
```

### Krok 8: Testujte

```
https://apartmany-vita.vercel.app/apartments
→ Deluxe Apartmán
→ Dátumy
→ Rezervovať
→ ✅ BOOKING PAGE SA ZOBRAZÍ!
→ ✅ Môžete pokračovať!
```

---

## ✅ VÝHODY VERCEL POSTGRES

1. **Prisma funguje guaranteed** - správny engine
2. **Automatická konfigurácia** - žiadne manuálne nastavovanie
3. **Rýchlejšie** - DB v rovnakom datacenter
4. **Connection pooling** - automaticky cez PgBouncer
5. **Jednoduché škálovanie**

---

## 📊 ČO SA ZMENÍ V BUILD LOGOCH

### PRED (Railway + engine=none):
```
✔ Generated Prisma Client (v6.16.2, engine=none)
Error validating datasource `db`: the URL must start with protocol prisma://
```

### PO (Vercel Postgres):
```
✔ Generated Prisma Client (v6.16.2, engine=library)
✓ Generating static pages (46/46)
Build Completed successfully
```

---

## 🔄 ČO S RAILWAY PO MIGRÁCII?

### Option A: Zrušte Railway Database
```
Ušetríte $5/mes
Všetko na Vercel
```

### Option B: Nechajte Railway ako Backup
```
Môžete mať backup database
Ale nebudete ju používať
```

---

## 💡 TROUBLESHOOTING

### "Import failed - relation already exists"
```bash
# Databáza už má tables z migrations
# Použite --clean flag
psql $VERCEL_DB_URL < backup.sql --clean
```

### "Connection refused"
```bash
# Použite NON_POOLING URL pre psql
# POSTGRES_URL_NON_POOLING namiesto POSTGRES_PRISMA_URL
```

---

**🎯 Začnite Krokom 1 - vytvorte backup Railway database!**
