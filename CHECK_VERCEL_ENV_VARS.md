# 🔍 CRITICAL: Check Vercel Environment Variables

## 🚨 MOŽNÝ PROBLÉM

Vo Vercel máte možno DATABASE_URL nastavenú s **Railway template syntax**:

❌ **ZLÉ** (Railway template):
```
DATABASE_URL=postgresql://${{PGUSER}}:${{POSTGRES_PASSWORD}}@${{RAILWAY_PRIVATE_DOMAIN}}:5432/${{PGDATABASE}}
```

✅ **SPRÁVNE** (skutočná hodnota):
```
DATABASE_URL=postgresql://postgres:FhMsbTSJYcndpebXfFIqmlcIamWpdCSG@shinkansen.proxy.rlwy.net:20490/railway
```

---

## 🎯 SKONTROLUJTE VO VERCEL:

```
1. https://vercel.com/dashboard
2. Váš projekt → Settings → Environment Variables
3. Nájdite DATABASE_URL
4. Kliknite "..." → Edit
5. SKONTROLUJTE hodnotu:
   - ❌ Ak obsahuje ${{PGUSER}} alebo iné ${{...}} → ZLÉ!
   - ✅ Ak obsahuje skutočné hodnoty (postgres:FhMsb...) → DOBRÉ!
```

---

## ✅ AK JE TAM ${{VARIABLE}} SYNTAX:

Musíte to zmeniť na **skutočnú hodnotu**:

```
DATABASE_URL=postgresql://postgres:FhMsbTSJYcndpebXfFIqmlcIamWpdCSG@shinkansen.proxy.rlwy.net:20490/railway

DIRECT_DATABASE_URL=postgresql://postgres:FhMsbTSJYcndpebXfFIqmlcIamWpdCSG@shinkansen.proxy.rlwy.net:20490/railway
```

**Vercel NErozumie Railway template syntax!**

---

## 🔍 AKO TO OVERIŤ:

Po úprave DATABASE_URL:

```bash
# Testujte cez API endpoint
curl https://apartmany-vita.vercel.app/api/debug/env

# Mali by ste vidieť skutočnú DATABASE_URL (nie template)
```

---

**Skontrolujte to a dajte mi vedieť čo tam máte!** 🎯
