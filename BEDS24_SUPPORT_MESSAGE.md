# Beds24 Support Message

## Subject: API V2 Access - Missing Invite Code Functionality

Dear Beds24 Support Team,

I am writing to request assistance with API access for my Beds24 account. I am trying to integrate Beds24 API with my property management application, but I am encountering issues with API authentication.

## Current Situation:

1. **Account Details:**
   - Property ID: 161445
   - Room IDs: 357931 (Apartman Vita Deluxe), 357932 (Apartman Vita Lite), 483027 (Apartmán Vita Design)
   - API Key 1: AbDalfEtyekmentOsVeb

2. **Problem:**
   - I cannot find the option to create "invite codes" in my account
   - API V2 endpoints return "Token not valid" errors
   - API V1 endpoints return 404 errors (deprecated)

## What I Need:

1. **Access to API V2 functionality:**
   - Ability to create invite codes
   - Proper authentication setup for API V2
   - Access to endpoints: `/properties`, `/rooms`, `/inventory`, `/bookings`

2. **Required Scopes:**
   - `read:properties`
   - `read:inventory`
   - `read:bookings`
   - `read:bookings-personal`
   - `Allow linked properties`

## Questions:

1. Is my account type compatible with API V2?
2. Do I need to upgrade my account to access invite code functionality?
3. Where can I find the option to create invite codes in my account?
4. Is there an alternative way to authenticate with API V2?

## Technical Details:

- I have tested all possible authentication methods:
  - `token: AbDalfEtyekmentOsVeb` → 401 "Token not valid"
  - `api-key: AbDalfEtyekmentOsVeb` → 401 "Token is missing"
  - `Authorization: Bearer AbDalfEtyekmentOsVeb` → 401 "Token is missing"
  - `X-API-Key: AbDalfEtyekmentOsVeb` → 401 "Token is missing"

- API V1 endpoints return 404 errors (deprecated)

## Request:

Could you please:
1. Check my account settings and confirm API V2 compatibility
2. Enable invite code functionality if available
3. Provide step-by-step instructions for API V2 setup
4. Confirm if account upgrade is required

## Contact Information:

- Account: [Your Beds24 account email]
- Property: Apartman Vita (161445)
- Rooms: 357931 (Deluxe), 357932 (Lite), 483027 (Design)

Thank you for your assistance. I look forward to your response.

Best regards,
[Your Name]

---

## Slovak Translation:

Predmet: Prístup k API V2 - Chýbajúca funkcionalita invite code

Vážení podpora Beds24,

Píšem vám s žiadosťou o pomoc s prístupom k API pre môj Beds24 účet. Pokúšam sa integrovať Beds24 API s mojou aplikáciou na správu nehnuteľností, ale narážam na problémy s autentifikáciou API.

## Súčasná situácia:

1. **Detaily účtu:**
   - Property ID: 161445
   - Room IDs: 357931 (Apartman Vita Deluxe), 357932 (Apartman Vita Lite), 483027 (Apartmán Vita Design)
   - API Key 1: AbDalfEtyekmentOsVeb

2. **Problém:**
   - Nemôžem nájsť možnosť vytvoriť "invite codes" v mojom účte
   - API V2 endpointy vracajú chyby "Token not valid"
   - API V1 endpointy vracajú 404 chyby (zastarané)

## Čo potrebujem:

1. **Prístup k API V2 funkcionalite:**
   - Možnosť vytvárať invite codes
   - Správne nastavenie autentifikácie pre API V2
   - Prístup k endpointom: `/properties`, `/rooms`, `/inventory`, `/bookings`

2. **Potrebné scopes:**
   - `read:properties`
   - `read:inventory`
   - `read:bookings`
   - `read:bookings-personal`
   - `Allow linked properties`

## Otázky:

1. Je môj typ účtu kompatibilný s API V2?
2. Potrebujem upgraduovať účet pre prístup k invite code funkcionalite?
3. Kde môžem nájsť možnosť vytvoriť invite codes v mojom účte?
4. Existuje alternatívny spôsob autentifikácie s API V2?

## Technické detaily:

- Otestoval som všetky možné metódy autentifikácie:
  - `token: AbDalfEtyekmentOsVeb` → 401 "Token not valid"
  - `api-key: AbDalfEtyekmentOsVeb` → 401 "Token is missing"
  - `Authorization: Bearer AbDalfEtyekmentOsVeb` → 401 "Token is missing"
  - `X-API-Key: AbDalfEtyekmentOsVeb` → 401 "Token is missing"

- API V1 endpointy vracajú 404 chyby (zastarané)

## Žiadosť:

Mohli by ste prosím:
1. Skontrolovať nastavenia môjho účtu a potvrdiť kompatibilitu s API V2
2. Povoliť invite code funkcionalitu, ak je dostupná
3. Poskytnúť podrobné inštrukcie pre nastavenie API V2
4. Potvrdiť, či je potrebný upgrade účtu

## Kontaktné informácie:

- Účet: [Váš Beds24 email účtu]
- Nehnuteľnosť: Apartman Vita (161445)
- Izby: 357931 (Deluxe), 357932 (Lite), 483027 (Design)

Ďakujem za vašu pomoc. Teším sa na vašu odpoveď.

S pozdravom,
[Vaše meno]
