import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Ochrana osobných údajov | Apartmány Vita',
  description: 'Zásady ochrany osobných údajov a GDPR compliance pre Apartmány Vita',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-lg shadow-sm p-8 md:p-12">
          {/* Header */}
          <div className="mb-8 pb-8 border-b">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Ochrana osobných údajov
            </h1>
            <p className="text-gray-600">
              Platné od: {new Date().toLocaleDateString('sk-SK')}
            </p>
          </div>

          {/* Table of Contents */}
          <nav className="mb-12 p-6 bg-gray-50 rounded-lg">
            <h2 className="text-lg font-semibold mb-4">Obsah</h2>
            <ul className="space-y-2 text-sm">
              <li><a href="#intro" className="text-blue-600 hover:underline">1. Úvod</a></li>
              <li><a href="#controller" className="text-blue-600 hover:underline">2. Prevádzkovateľ</a></li>
              <li><a href="#data-collection" className="text-blue-600 hover:underline">3. Aké údaje zbierame</a></li>
              <li><a href="#data-usage" className="text-blue-600 hover:underline">4. Ako používame vaše údaje</a></li>
              <li><a href="#data-sharing" className="text-blue-600 hover:underline">5. Zdieľanie údajov</a></li>
              <li><a href="#cookies" className="text-blue-600 hover:underline">6. Cookies a tracking</a></li>
              <li><a href="#rights" className="text-blue-600 hover:underline">7. Vaše práva</a></li>
              <li><a href="#security" className="text-blue-600 hover:underline">8. Bezpečnosť údajov</a></li>
              <li><a href="#retention" className="text-blue-600 hover:underline">9. Uchovávanie údajov</a></li>
              <li><a href="#contact" className="text-blue-600 hover:underline">10. Kontakt</a></li>
            </ul>
          </nav>

          {/* Content */}
          <div className="prose prose-gray max-w-none">
            {/* Section 1 */}
            <section id="intro" className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Úvod</h2>
              <p className="text-gray-700 mb-4">
                Vítame vás na stránke Apartmány Vita. Ochrana vašich osobných údajov je pre nás prioritou. 
                Tento dokument vysvetľuje, ako zbierame, používame a chránime vaše osobné údaje v súlade 
                s nariadením GDPR (General Data Protection Regulation) a zákonom č. 18/2018 Z.z. o ochrane 
                osobných údajov.
              </p>
              <p className="text-gray-700">
                Používaním našich služieb súhlasíte so spracovaním vašich osobných údajov spôsobom 
                popísaným v tomto dokumente.
              </p>
            </section>

            {/* Section 2 */}
            <section id="controller" className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Prevádzkovateľ</h2>
              <div className="bg-blue-50 p-6 rounded-lg">
                <p className="font-semibold text-gray-900 mb-2">P2 invest s.r.o.</p>
                <p className="text-gray-700">IČO: 47992701</p>
                <p className="text-gray-700">IČ DPH: SK2120035951</p>
                <p className="text-gray-700">Sídlo: Saratovská 7388/1B, 911 08 Trenčín, Slovensko</p>
                <p className="text-gray-700 mt-4">
                  E-mail: <a href="mailto:info@apartmanyvita.sk" className="text-blue-600 hover:underline">info@apartmanyvita.sk</a>
                </p>
              </div>
            </section>

            {/* Section 3 */}
            <section id="data-collection" className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Aké údaje zbierame</h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">3.1 Údaje pri rezervácii</h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Meno a priezvisko</li>
                <li>E-mailová adresa</li>
                <li>Telefónne číslo</li>
                <li>Adresa (ak je potrebná pre faktúru)</li>
                <li>Dátumy pobytu a počet hostí</li>
                <li>Špeciálne požiadavky a preferencie</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">3.2 Platobné údaje</h3>
              <p className="text-gray-700 mb-4">
                Platobné údaje (čísla kariet) spracováva náš platobný partner <strong>Stripe</strong>. 
                My priamo neuchovávame kompletné čísla platobných kariet. Stripe je certifikovaný 
                poskytovateľ PCI DSS Level 1.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">3.3 Automaticky zbierané údaje</h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>IP adresa</li>
                <li>Typ prehliadača a zariadenia</li>
                <li>Operačný systém</li>
                <li>Čas a dátum návštevy</li>
                <li>Navštívené stránky</li>
                <li>Referrer URL (odkiaľ ste prišli)</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">3.4 Cookies a analytika</h3>
              <p className="text-gray-700">
                Používame Google Analytics na analýzu návštevnosti a zlepšenie našich služieb. 
                Viac informácií nájdete v sekcii <a href="#cookies" className="text-blue-600 hover:underline">Cookies</a>.
              </p>
            </section>

            {/* Section 4 */}
            <section id="data-usage" className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Ako používame vaše údaje</h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">4.1 Spracovanie rezervácií</h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Potvrdenie a správa vašej rezervácie</li>
                <li>Komunikácia o pobyte (check-in, check-out, inštrukcie)</li>
                <li>Vystavenie faktúr a účtovných dokladov</li>
                <li>Riešenie reklamácií a zákazníckej podpory</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">4.2 Zlepšenie služieb</h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Analýza návštevnosti a správania používateľov</li>
                <li>Personalizácia obsahu a ponúk</li>
                <li>Testovanie nových funkcií</li>
                <li>Zlepšenie používateľskej skúsenosti</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">4.3 Marketing (len so súhlasom)</h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Zasielanie newsletterov a špeciálnych ponúk</li>
                <li>Informácie o nových apartmánoch a službách</li>
                <li>Sezónne akcie a zľavy</li>
              </ul>
              <p className="text-gray-700 mt-2 italic">
                Marketingové e-maily môžete kedykoľvek odhlásiť kliknutím na odkaz v e-maile.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">4.4 Právne povinnosti</h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Účtovníctvo a daňové povinnosti</li>
                <li>Ochrana pred podvodmi</li>
                <li>Splnenie zákonných požiadaviek</li>
              </ul>
            </section>

            {/* Section 5 */}
            <section id="data-sharing" className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Zdieľanie údajov</h2>
              <p className="text-gray-700 mb-4">
                Vaše osobné údaje nepredávame tretím stranám. Zdieľame ich len s dôveryhodnými 
                partnermi potrebnými pre prevádzku služieb:
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">5.1 Platobné služby</h3>
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <p className="font-semibold text-gray-900">Stripe, Inc.</p>
                <p className="text-gray-700">Spracovanie platieb kartou</p>
                <p className="text-sm text-gray-600 mt-2">
                  Privacy Policy: <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">stripe.com/privacy</a>
                </p>
              </div>

              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">5.2 Booking systém</h3>
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <p className="font-semibold text-gray-900">Beds24</p>
                <p className="text-gray-700">Správa rezervácií a dostupnosti</p>
                <p className="text-sm text-gray-600 mt-2">
                  Privacy Policy: <a href="https://www.beds24.com/privacy.html" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">beds24.com/privacy</a>
                </p>
              </div>

              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">5.3 Analytika</h3>
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <p className="font-semibold text-gray-900">Google Analytics</p>
                <p className="text-gray-700">Analýza návštevnosti webu</p>
                <p className="text-sm text-gray-600 mt-2">
                  Privacy Policy: <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">policies.google.com/privacy</a>
                </p>
              </div>

              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">5.4 Hosting</h3>
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <p className="font-semibold text-gray-900">Vercel Inc.</p>
                <p className="text-gray-700">Hosting webovej stránky</p>
                <p className="text-sm text-gray-600 mt-2">
                  Privacy Policy: <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">vercel.com/legal/privacy-policy</a>
                </p>
              </div>
            </section>

            {/* Section 6 */}
            <section id="cookies" className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Cookies a tracking</h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">6.1 Čo sú cookies</h3>
              <p className="text-gray-700 mb-4">
                Cookies sú malé textové súbory uložené vo vašom prehliadači. Používame ich na 
                zlepšenie funkčnosti webu a analýzu návštevnosti.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">6.2 Typy cookies</h3>
              
              <div className="space-y-4">
                <div className="border-l-4 border-green-500 pl-4">
                  <p className="font-semibold text-gray-900">Nevyhnutné cookies</p>
                  <p className="text-gray-700">Potrebné pre základnú funkčnosť (prihlásenie, košík, jazyk)</p>
                  <p className="text-sm text-gray-600">Nemožno odmietnuť</p>
                </div>

                <div className="border-l-4 border-blue-500 pl-4">
                  <p className="font-semibold text-gray-900">Analytické cookies</p>
                  <p className="text-gray-700">Google Analytics - sledovanie návštevnosti</p>
                  <p className="text-sm text-gray-600">Môžete odmietnuť</p>
                </div>

                <div className="border-l-4 border-purple-500 pl-4">
                  <p className="font-semibold text-gray-900">Marketingové cookies</p>
                  <p className="text-gray-700">Personalizácia reklám a obsahu</p>
                  <p className="text-sm text-gray-600">Môžete odmietnuť</p>
                </div>
              </div>

              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">6.3 Správa cookies</h3>
              <p className="text-gray-700">
                Cookies môžete spravovať v nastaveniach vášho prehliadača. Upozorňujeme, že 
                vypnutie cookies môže obmedziť funkčnosť webu.
              </p>
            </section>

            {/* Section 7 */}
            <section id="rights" className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Vaše práva (GDPR)</h2>
              <p className="text-gray-700 mb-4">
                Podľa GDPR máte nasledujúce práva:
              </p>

              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">✓ Právo na prístup</h4>
                  <p className="text-gray-700">Máte právo vedieť, aké údaje o vás spracovávame</p>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">✓ Právo na opravu</h4>
                  <p className="text-gray-700">Môžete požiadať o opravu nesprávnych údajov</p>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">✓ Právo na výmaz ("právo byť zabudnutý")</h4>
                  <p className="text-gray-700">Môžete požiadať o vymazanie vašich údajov (s výnimkou zákonných povinností)</p>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">✓ Právo na obmedzenie spracovania</h4>
                  <p className="text-gray-700">Môžete požiadať o pozastavenie spracovania údajov</p>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">✓ Právo na prenosnosť</h4>
                  <p className="text-gray-700">Môžete získať svoje údaje v strojovo čitateľnom formáte</p>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">✓ Právo namietať</h4>
                  <p className="text-gray-700">Môžete namietať proti spracovaniu na marketingové účely</p>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">✓ Právo podať sťažnosť</h4>
                  <p className="text-gray-700">Môžete podať sťažnosť na Úrad na ochranu osobných údajov SR</p>
                </div>
              </div>

              <p className="text-gray-700 mt-6">
                Pre uplatnenie vašich práv nás kontaktujte na: <a href="mailto:info@apartmanyvita.sk" className="text-blue-600 hover:underline font-semibold">info@apartmanyvita.sk</a>
              </p>
            </section>

            {/* Section 8 */}
            <section id="security" className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Bezpečnosť údajov</h2>
              <p className="text-gray-700 mb-4">
                Implementovali sme primerané technické a organizačné opatrenia na ochranu vašich údajov:
              </p>

              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li><strong>SSL/TLS šifrovanie</strong> - všetka komunikácia je šifrovaná</li>
                <li><strong>Bezpečné úložisko</strong> - údaje sú uložené na zabezpečených serveroch</li>
                <li><strong>Prístupové kontroly</strong> - obmedzený prístup len pre oprávnených zamestnancov</li>
                <li><strong>Pravidelné zálohy</strong> - ochrana pred stratou údajov</li>
                <li><strong>Monitoring</strong> - sledovanie bezpečnostných incidentov</li>
                <li><strong>Aktualizácie</strong> - pravidelné bezpečnostné aktualizácie systémov</li>
              </ul>

              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mt-6">
                <p className="text-gray-800">
                  <strong>Upozornenie:</strong> Žiadny systém nie je 100% bezpečný. V prípade bezpečnostného 
                  incidentu vás budeme informovať v súlade so zákonom.
                </p>
              </div>
            </section>

            {/* Section 9 */}
            <section id="retention" className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Uchovávanie údajov</h2>
              <p className="text-gray-700 mb-4">
                Vaše údaje uchovávame len po dobu nevyhnutnú pre účely, na ktoré boli zhromaždené:
              </p>

              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="text-gray-900 font-medium">Rezervačné údaje</span>
                  <span className="text-gray-700">5 rokov (účtovné predpisy)</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="text-gray-900 font-medium">Marketingové súhlasy</span>
                  <span className="text-gray-700">Do odvolania súhlasu</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="text-gray-900 font-medium">Analytické údaje</span>
                  <span className="text-gray-700">26 mesiacov (Google Analytics)</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="text-gray-900 font-medium">Cookies</span>
                  <span className="text-gray-700">1-24 mesiacov (podľa typu)</span>
                </div>
              </div>
            </section>

            {/* Section 10 */}
            <section id="contact" className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Kontakt</h2>
              <p className="text-gray-700 mb-6">
                Ak máte akékoľvek otázky týkajúce sa ochrany osobných údajov, kontaktujte nás:
              </p>

              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg">
                <p className="font-semibold text-gray-900 text-lg mb-4">P2 invest s.r.o.</p>
                <div className="space-y-2 text-gray-700">
                  <p>📍 Saratovská 7388/1B, 911 08 Trenčín, Slovensko</p>
                  <p>📧 E-mail: <a href="mailto:info@apartmanyvita.sk" className="text-blue-600 hover:underline font-semibold">info@apartmanyvita.sk</a></p>
                  <p>🏢 IČO: 47992701</p>
                  <p>💼 IČ DPH: SK2120035951</p>
                </div>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg mt-6">
                <p className="font-semibold text-gray-900 mb-2">Úrad na ochranu osobných údajov SR</p>
                <p className="text-gray-700">Hraničná 12, 820 07 Bratislava</p>
                <p className="text-gray-700">Web: <a href="https://dataprotection.gov.sk" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">dataprotection.gov.sk</a></p>
              </div>
            </section>

            {/* Updates */}
            <section className="mb-12 border-t pt-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Zmeny v zásadách</h2>
              <p className="text-gray-700">
                Tieto zásady môžeme príležitostne aktualizovať. O významných zmenách vás budeme 
                informovať e-mailom alebo oznámením na webovej stránke. Odporúčame pravidelne 
                kontrolovať túto stránku.
              </p>
              <p className="text-gray-600 mt-4 text-sm">
                Posledná aktualizácia: {new Date().toLocaleDateString('sk-SK', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </section>
          </div>

          {/* Back to home */}
          <div className="mt-12 pt-8 border-t text-center">
            <Link 
              href="/" 
              className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
            >
              ← Späť na hlavnú stránku
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
