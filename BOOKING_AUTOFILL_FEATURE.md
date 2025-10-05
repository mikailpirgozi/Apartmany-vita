# Automatické predvyplnenie údajov pri rezervácii

## Prehľad
Keď je používateľ prihlásený a má vyplnené údaje vo svojom profile, tieto údaje sa automaticky predvypĺňajú v rezervačnom formulári. Používateľ tak nemusí vyplňovať rovnaké informácie opakovane.

## Implementované funkcie

### 1. Automatické načítanie profilu
- Pri otvorení rezervačného formulára sa automaticky načítajú údaje z profilu prihláseného používateľa
- Používa sa React Query pre efektívne cachovanie (5 minút)
- Endpoint: `GET /api/user/profile`

### 2. Predvyplnené polia
Automaticky sa predvypĺňajú tieto polia:
- **Meno** (firstName) - prvá časť z `user.name`
- **Priezvisko** (lastName) - zvyšok z `user.name`
- **Email** - z `user.email`
- **Telefón** - z `user.phone`
- **Krajina** - z `user.country` (default: Slovakia)
- **Mesto** - z `user.city`
- **Firemné údaje** (ak sú vyplnené):
  - Názov firmy
  - IČO
  - DIČ
  - Adresa firmy
  - Checkbox "Potrebujem faktúru" sa automaticky zaškrtne

### 3. Vizuálna indikácia
- Zelený info banner sa zobrazí nad formulárom s textom:
  > "Vaše údaje boli automaticky predvyplnené z profilu. Môžete ich upraviť podľa potreby."
- Banner sa zobrazí len ak je používateľ prihlásený a profil bol načítaný

### 4. Rozšírený používateľský profil
Pridané nové polia do User modelu:
- `country` (String, optional) - krajina bydliska
- `city` (String, optional) - mesto bydliska

## Technická implementácia

### Databázová schéma
```prisma
model User {
  // ... existujúce polia
  
  // Address information
  country       String?
  city          String?
  
  // ... zvyšok modelu
}
```

### API Endpoint
**GET /api/user/profile**
- Vracia kompletné údaje používateľa vrátane nových polí `country` a `city`
- Vyžaduje autentifikáciu (NextAuth session)

**PUT /api/user/profile**
- Aktualizuje profil používateľa
- Validácia cez Zod schému
- Podporuje nové polia `country` a `city`

### React komponenty

#### BookingFlow2Step
```typescript
// Fetch user profile
const { data: userProfile } = useQuery({
  queryKey: ['user-profile', session?.user?.id],
  queryFn: async () => {
    const response = await fetch('/api/user/profile');
    return response.json().then(data => data.user);
  },
  enabled: !!session?.user?.id,
  staleTime: 5 * 60 * 1000,
});

// Auto-fill form when profile loads
useEffect(() => {
  if (userProfile && session?.user) {
    const nameParts = userProfile.name?.split(' ') || [];
    contactForm.reset({
      firstName: nameParts[0] || '',
      lastName: nameParts.slice(1).join(' ') || '',
      email: userProfile.email || session.user.email || '',
      phone: userProfile.phone || '',
      country: userProfile.country || 'Slovakia',
      city: userProfile.city || '',
      needsInvoice: !!userProfile.companyName,
      companyName: userProfile.companyName || '',
      companyId: userProfile.companyId || '',
      companyVat: userProfile.companyVat || '',
      companyAddress: userProfile.companyAddress || '',
      specialRequests: ''
    });
  }
}, [userProfile, session, contactForm]);
```

#### ProfileForm
- Pridané UI polia pre `country` a `city`
- Grid layout (2 stĺpce) pre lepšiu UX
- Validácia cez Zod schému

## Migrácia databázy

### SQL migrácia
```sql
ALTER TABLE "users" ADD COLUMN "country" TEXT;
ALTER TABLE "users" ADD COLUMN "city" TEXT;
```

### Spustenie migrácie na Railway
```bash
# Lokálne (ak máte DATABASE_URL)
pnpm prisma migrate deploy

# Alebo cez Railway CLI
railway run pnpm prisma migrate deploy
```

## User Experience

### Pre nových používateľov
1. Vytvoria si účet
2. Vyplnia profil (voliteľné)
3. Pri prvej rezervácii sa údaje automaticky predvypĺňajú

### Pre existujúcich používateľov
1. Môžu aktualizovať svoj profil v sekcii "Profil používateľa"
2. Pri ďalších rezerváciách sa údaje automaticky predvypĺňajú
3. Údaje môžu upraviť priamo v rezervačnom formulári (neovplyvní to profil)

## Výhody

### Pre používateľov
- ⚡ Rýchlejšie vyplnenie rezervácie
- 🎯 Menej chýb pri vyplňovaní
- 💼 Automatické vyplnenie firemných údajov
- ✨ Lepšia používateľská skúsenosť

### Pre prevádzku
- 📊 Kompletnejšie používateľské profily
- 🎯 Presnejšie údaje zákazníkov
- 💰 Vyššia konverzná miera (menej opustených rezervácií)
- 📈 Lepšie dáta pre marketing

## Bezpečnosť a súkromie
- Údaje sa načítavajú len pre prihláseného používateľa
- API endpoint vyžaduje autentifikáciu
- Údaje sú cachované len na strane klienta (React Query)
- Používateľ môže kedykoľvek upraviť predvyplnené údaje

## Budúce vylepšenia
- [ ] Automatické uloženie krajiny a mesta z rezervácie do profilu (ak nie sú vyplnené)
- [ ] Možnosť uložiť viacero adries
- [ ] Automatické dopĺňanie mesta podľa PSČ
- [ ] Integrácia s Google Places API pre lepšie dopĺňanie adries
- [ ] História rezervácií s možnosťou "Rezervovať znova" (predvyplní všetky údaje z predchádzajúcej rezervácie)

## Súvisiace súbory
- `/src/components/booking/booking-flow-2step.tsx` - hlavný rezervačný formulár
- `/src/components/account/profile-form.tsx` - formulár profilu používateľa
- `/src/app/api/user/profile/route.ts` - API endpoint pre profil
- `/prisma/schema.prisma` - databázová schéma
- `/prisma/migrations/20251005_add_user_address_fields/migration.sql` - migračný skript
