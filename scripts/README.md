# 🚨 Utility Scripts - Apartmány Vita

Tento adresár obsahuje pomocné skripty pre development, deployment a testovanie.

## 📁 Port Enforcement Scripts

### `port-checker.js`
- **Účel**: Kontroluje a uvoľňuje port 3000 pred spustením aplikácie
- **Použitie**: `node scripts/port-checker.js`
- **Funkcie**:
  - Detekuje procesy používajúce port 3000
  - Automaticky ich ukončí (kill -9)
  - Zabezpečí dostupnosť portu 3000

### `pre-commit-port-check.js`
- **Účel**: Kontroluje konfiguráciu pred každým commitom
- **Použitie**: `node scripts/pre-commit-port-check.js`
- **Funkcie**:
  - Kontroluje package.json scripts
  - Kontroluje environment súbory
  - Zabráni commitnutiu nesprávnej konfigurácie

## 📁 Database & Deployment Scripts

### `test-database-connection.js`
- **Účel**: Testuje či je DATABASE_URL správne nakonfigurovaná
- **Použitie**: 
  ```bash
  # Test current environment
  node scripts/test-database-connection.js
  
  # Test specific DATABASE_URL
  DATABASE_URL="postgresql://..." node scripts/test-database-connection.js
  ```
- **Výstup**:
  - ✅ Success: DATABASE_URL je validná a pripravená
  - ❌ Failure: Zobrazí validačné chyby a návod na opravu

### `verify-production.sh`
- **Účel**: Komplexná verifikácia production deploymentu
- **Použitie**: 
  ```bash
  # Test production
  ./scripts/verify-production.sh https://apartmany-vita.vercel.app
  
  # Test preview
  ./scripts/verify-production.sh https://apartmany-vita-preview.vercel.app
  ```
- **Testy**:
  - Homepage a apartment pages
  - API endpoints (health, apartments, Beds24)
  - Environment variables konfigurácia
  - Database connectivity
  - Stripe integrácia
- **Výstup**:
  - ✅ All tests passed - Produkcia je pripravená
  - ❌ Tests failed - Zobrazí konkrétne problémy a troubleshooting kroky

## 🚀 Integrácia

### Package.json Scripts
```json
{
  "scripts": {
    "port-check": "node scripts/port-checker.js",
    "dev:safe": "npm run port-check && npm run dev:force"
  }
}
```

### Git Hooks (voliteľné)
```bash
# Pre-commit hook
echo "node scripts/pre-commit-port-check.js" > .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
```

## 🤖 Automatické vs. Manuálne Scripts

### Automatické (spúšťajú sa same)
- `port-checker.js` - Pri `npm run dev`
- `pre-commit-port-check.js` - Pri git commit (ak sú nastavené hooks)

### Manuálne (spustiť pred/po deploymente)
- `test-database-connection.js` - Pred deploymentom na overenie DATABASE_URL
- `verify-production.sh` - Po deploymente na overenie že všetko funguje

## ⚠️ Dôležité poznámky

1. **Nikdy nemení porty** v týchto skriptoch
2. **Vždy používaj `npm run dev:safe`** na spustenie aplikácie
3. **Ak sa aplikácia spustí na inom porte**, okamžite ju zastav a skontroluj konfiguráciu
4. **Pred deploymentom na Vercel** spusti `test-database-connection.js` s production DATABASE_URL
5. **Po deploymente na Vercel** spusti `verify-production.sh` na overenie

## 🔧 Troubleshooting

### Port 3000 je stále obsadený
```bash
# Manuálne ukončenie (macOS/Linux)
lsof -ti:3000 | xargs kill -9

# Manuálne ukončenie (Windows)
netstat -ano | findstr :3000
taskkill /F /PID <PID>
```

### Pre-commit check zlyhá
1. Skontroluj package.json scripts
2. Skontroluj .env.local súbor
3. Spusti `npm run dev:safe` namiesto `npm run dev`

### Database connection test fails
1. Skontroluj formát DATABASE_URL (musí začínať `postgresql://` alebo `prisma://`)
2. Overte že credentials sú správne
3. Testuj connection pomocou `psql` alebo database client

### Production verification fails
1. Skontroluj Vercel deployment logs
2. Overte environment variables vo Vercel dashboard
3. Otestuj `/api/test-env` endpoint pre detaily
4. Prečítaj `VERCEL_PRODUCTION_FIX.md` pre kompletný troubleshooting guide

## 📚 Súvisiace dokumenty

- `VERCEL_PRODUCTION_FIX.md` - Kompletný Vercel deployment guide
- `VERCEL_QUICK_FIX.md` - Rýchly 5-minútový fix
- `PRODUCTION_ISSUE_SUMMARY.md` - Analýza a riešenie production problémov
- `PORT_3000_ENFORCEMENT.md` - Port 3000 enforcement dokumentácia
