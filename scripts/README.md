# 🚨 Port 3000 Enforcement Scripts

Tento adresár obsahuje skripty, ktoré zabezpečujú, že aplikácia sa vždy spustí na porte 3000.

## 📁 Súbory

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

## ⚠️ Dôležité poznámky

1. **Nikdy nemení porty** v týchto skriptoch
2. **Vždy používaj `npm run dev:safe`** na spustenie aplikácie
3. **Ak sa aplikácia spustí na inom porte**, okamžite ju zastav a skontroluj konfiguráciu

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
