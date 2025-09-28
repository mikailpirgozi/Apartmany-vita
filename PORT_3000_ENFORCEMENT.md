# 🚨 PORT 3000 ENFORCEMENT - CRITICAL CONFIGURATION

## ⚠️ ABSOLUTE REQUIREMENT
**Aplikácia sa MUSÍ vždy spustiť na porte 3000. NIKDY na inom porte!**

## 🔧 Implementované ochrany

### 1. Package.json Scripts
```json
{
  "scripts": {
    "dev": "next dev --port 3000",
    "dev:turbo": "next dev --turbopack --port 3000", 
    "dev:force": "PORT=3000 next dev --port 3000",
    "start": "next start --port 3000",
    "start:force": "PORT=3000 next start --port 3000",
    "dev:safe": "npm run port-check && npm run dev:force"
  }
}
```

### 2. Environment Variables
- `.env.local` obsahuje `PORT=3000`
- Všetky environment súbory majú nastavený port 3000

### 3. Next.js Configuration
- `next.config.ts` obsahuje port validation
- Ak sa detekuje iný port, aplikácia sa ukončí s chybou

### 4. Port Checker Script
- `scripts/port-checker.js` - automaticky ukončí procesy na porte 3000
- Spustí sa pred každým štartom aplikácie

### 5. Pre-commit Hook
- `scripts/pre-commit-port-check.js` - kontroluje pred každým commitom
- Zabráni commitnutiu kódu s nesprávnym portom

## 🚀 Ako spustiť aplikáciu

### Bezpečný spustenie (odporúčané):
```bash
npm run dev:safe
```

### Manuálne spustenie:
```bash
npm run dev:force
```

### Kontrola portu:
```bash
npm run port-check
```

## 🚨 Čo sa stane ak sa pokúsiš spustiť na inom porte

1. **Next.js validation** - aplikácia sa ukončí s chybou
2. **Port checker** - automaticky ukončí procesy na porte 3000
3. **Pre-commit hook** - zabráni commitnutiu nesprávnej konfigurácie

## 🔍 Troubleshooting

### Port 3000 je obsadený:
```bash
# Automatické riešenie
npm run port-check

# Manuálne riešenie (macOS/Linux)
lsof -ti:3000 | xargs kill -9

# Manuálne riešenie (Windows)
netstat -ano | findstr :3000
taskkill /F /PID <PID>
```

### Aplikácia sa spustí na inom porte:
1. Skontroluj `.env.local` - musí obsahovať `PORT=3000`
2. Skontroluj `package.json` scripts - musia obsahovať `--port 3000`
3. Spusti `npm run dev:safe` namiesto `npm run dev`

## 📋 Checklist pre nových vývojárov

- [ ] `.env.local` obsahuje `PORT=3000`
- [ ] Používaš `npm run dev:safe` na spustenie
- [ ] Nikdy nemeníš port v konfiguračných súboroch
- [ ] Ak sa aplikácia spustí na inom porte, okamžite ju zastav a skontroluj konfiguráciu

## 🚨 ZÁKAZ

**NIKDY neupravuj tieto súbory tak, aby používali iný port ako 3000:**
- `package.json` scripts
- `.env.local`
- `next.config.ts`
- `env.template`

**NIKDY nepoužívaj tieto príkazy:**
- `npm run dev` (bez --port 3000)
- `next dev` (bez --port 3000)
- `PORT=3001 npm run dev`

## ✅ Overenie konfigurácie

Spusti tento príkaz na overenie, že všetko je správne nastavené:
```bash
node scripts/pre-commit-port-check.js
```

Ak sa zobrazí "✅ Pre-commit check passed!", konfigurácia je správna.
