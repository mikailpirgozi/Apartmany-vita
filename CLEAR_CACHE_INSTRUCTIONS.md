# Ako vyčistiť cache pre testovanie

## Pre používateľov (Chrome/Safari):
1. Otvor DevTools (F12 alebo Cmd+Option+I)
2. Pravý klik na Refresh button
3. Vyber "Empty Cache and Hard Reload"

## Alebo:
1. Chrome: Settings → Privacy → Clear browsing data
2. Vyber "Cached images and files"
3. Clear data

## Pre vývojárov:
```bash
# Vyčisti Next.js cache
rm -rf .next
pnpm dev
```

## Ak problém pretrváva:
- Použite inkognito režim
- Disable všetky browser extensions
- Skontrolujte localStorage v DevTools → Application → Local Storage
