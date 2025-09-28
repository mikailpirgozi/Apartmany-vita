# Testing Guide

Tento dokument popisuje testovaciu stratégiu pre Apartmany Vita aplikáciu.

## Prehľad testov

Aplikácia používa komplexnú testovaciu stratégiu s nasledujúcimi typmi testov:

### 1. Unit Testy (Vitest)
- **Lokalizácia**: `src/lib/__tests__/`, `src/components/__tests__/`
- **Spustenie**: `pnpm test`
- **Coverage**: `pnpm test:coverage`
- **Watch mode**: `pnpm test:watch`

### 2. Integration Testy
- **Lokalizácia**: `src/app/api/__tests__/`
- **Spustenie**: `pnpm test`
- **Testujú**: API endpoints, databázové operácie, cache

### 3. E2E Testy (Playwright)
- **Lokalizácia**: `e2e/`
- **Spustenie**: `pnpm test:e2e`
- **UI mode**: `pnpm test:e2e:ui`

## Testovacie moduly

### Core Library Tests
- `auth.test.ts` - Autentifikácia a session management
- `validations.test.ts` - Zod schémy a validácia
- `utils.test.ts` - Utility funkcie
- `cache.test.ts` - Redis cache operácie
- `security.test.ts` - Bezpečnostné funkcie

### API Tests
- `apartments.test.ts` - Apartments API endpoints
- `bookings.test.ts` - Bookings API endpoints
- `auth.test.ts` - Authentication API

### Component Tests
- `apartment-card.test.tsx` - Apartment card komponenta
- `booking-form.test.tsx` - Booking form komponenta
- `search-filters.test.tsx` - Search filters komponenta

## Spustenie testov

### Všetky testy
```bash
pnpm test:all
```

### Len unit testy
```bash
pnpm test
```

### S coverage reportom
```bash
pnpm test:coverage
```

### E2E testy
```bash
pnpm test:e2e
```

### CI testy (pre GitHub Actions)
```bash
pnpm test:ci
```

## Testovacia konfigurácia

### Vitest (vitest.config.mjs)
- Environment: jsdom
- Setup file: `src/test/setup.ts`
- Coverage provider: v8
- Globals: true

### Playwright (playwright.config.ts)
- Browsers: Chromium, Firefox, WebKit
- Base URL: http://localhost:3000
- Test directory: e2e/

## Mocking

### Automatické mocky (setup.ts)
- Next.js router
- Next.js image
- Framer Motion
- Next Auth
- React Query
- Web APIs (crypto, URL, etc.)

### Manuálne mocky
- Database (Prisma)
- Cache (Redis)
- External APIs (Beds24, Stripe)
- File system operations

## Testovacie dátá

### Mock data
- `src/lib/mock-data.ts` - Testovacie apartmány a rezervácie
- `src/test/setup.ts` - Globálne testovacie setup

### Test fixtures
- Apartmány s rôznymi konfiguráciami
- Rezervácie s rôznymi stavmi
- Používatelia s rôznymi rolami

## Performance testy

### Benchmarky
- Renderovanie komponentov < 100ms
- API response time < 2000ms
- Cache hit rate > 80%
- Error rate < 5%

### Load testy
- Concurrent API requests
- Large data sets
- Memory usage monitoring

## CI/CD Integration

### GitHub Actions
- **test.yml** - Test suite pre PR a push
- **deploy.yml** - Deploy po úspešných testoch

### Pre-commit hooks
- Type checking
- Linting
- Unit testy

### Coverage requirements
- Minimum 80% code coverage
- 100% coverage pre kritické funkcie
- Coverage report v CI

## Debugging testov

### Vitest debugging
```bash
pnpm test:watch --reporter=verbose
```

### Playwright debugging
```bash
pnpm test:e2e:ui
```

### Coverage debugging
```bash
pnpm test:coverage
open coverage/index.html
```

## Best practices

### Písanie testov
1. **Arrange-Act-Assert** pattern
2. **Descriptive test names**
3. **One assertion per test**
4. **Mock external dependencies**
5. **Test edge cases**

### Testovacie dáta
1. **Use realistic data**
2. **Test with edge cases**
3. **Mock external services**
4. **Clean up after tests**

### Performance
1. **Parallel test execution**
2. **Efficient mocking**
3. **Minimal test data**
4. **Fast feedback loops**

## Troubleshooting

### Časté problémy

#### Testy sa nespúšťajú
```bash
# Reinstall dependencies
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

#### Mocky nefungujú
```bash
# Check setup.ts
# Verify mock paths
# Clear Vitest cache
pnpm test --no-cache
```

#### E2E testy zlyhávajú
```bash
# Install Playwright browsers
pnpm exec playwright install
# Check if app is running
pnpm dev
```

#### Coverage nízky
```bash
# Check coverage configuration
# Add more test cases
# Verify test execution
```

## Monitoring

### Test metrics
- Test execution time
- Coverage percentage
- Flaky test detection
- Performance regression

### Alerts
- Failed tests in CI
- Coverage drops
- Performance degradation
- Security vulnerabilities

## Rozšírenie testov

### Pridanie nových testov
1. Vytvorte test súbor v príslušnom adresári
2. Použite existujúce mocky a setup
3. Dodržujte naming convention
4. Pridajte do CI pipeline

### Nové testovacie moduly
1. Vytvorte nový adresár v `__tests__/`
2. Pridajte setup a teardown
3. Dokumentujte v tomto súbore
4. Aktualizujte CI konfiguráciu

## Kontakt

Pre otázky ohľadom testov kontaktujte development team.
