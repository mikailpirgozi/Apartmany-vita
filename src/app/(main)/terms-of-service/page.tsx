import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Obchodné podmienky | Apartmány Vita',
  description: 'Všeobecné obchodné podmienky pre rezerváciu apartmánov Vita',
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-lg shadow-sm p-8 md:p-12">
          {/* Header */}
          <div className="mb-8 pb-8 border-b">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Všeobecné obchodné podmienky
            </h1>
            <p className="text-gray-600">
              Platné od: {new Date().toLocaleDateString('sk-SK')}
            </p>
          </div>

          {/* Table of Contents */}
          <nav className="mb-12 p-6 bg-gray-50 rounded-lg">
            <h2 className="text-lg font-semibold mb-4">Obsah</h2>
            <ul className="space-y-2 text-sm">
              <li><a href="#intro" className="text-blue-600 hover:underline">1. Úvodné ustanovenia</a></li>
              <li><a href="#definitions" className="text-blue-600 hover:underline">2. Definície pojmov</a></li>
              <li><a href="#booking" className="text-blue-600 hover:underline">3. Rezervácia a potvrdenie</a></li>
              <li><a href="#payment" className="text-blue-600 hover:underline">4. Platobné podmienky</a></li>
              <li><a href="#cancellation" className="text-blue-600 hover:underline">5. Stornovanie a zmeny rezervácie</a></li>
              <li><a href="#checkin" className="text-blue-600 hover:underline">6. Check-in a check-out</a></li>
              <li><a href="#guest-obligations" className="text-blue-600 hover:underline">7. Povinnosti hosťa</a></li>
              <li><a href="#house-rules" className="text-blue-600 hover:underline">8. Domáci poriadok</a></li>
              <li><a href="#liability" className="text-blue-600 hover:underline">9. Zodpovednosť za škody</a></li>
              <li><a href="#complaints" className="text-blue-600 hover:underline">10. Reklamácie</a></li>
              <li><a href="#disputes" className="text-blue-600 hover:underline">11. Riešenie sporov</a></li>
              <li><a href="#final" className="text-blue-600 hover:underline">12. Záverečné ustanovenia</a></li>
            </ul>
          </nav>

          {/* Content */}
          <div className="prose prose-gray max-w-none">
            {/* Section 1 */}
            <section id="intro" className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Úvodné ustanovenia</h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">1.1 Prevádzkovateľ</h3>
              <div className="bg-blue-50 p-6 rounded-lg mb-6">
                <p className="font-semibold text-gray-900 mb-2">P2 invest s.r.o.</p>
                <p className="text-gray-700">IČO: 47992701</p>
                <p className="text-gray-700">IČ DPH: SK2120035951</p>
                <p className="text-gray-700">Sídlo: Saratovská 7388/1B, 911 08 Trenčín, Slovensko</p>
                <p className="text-gray-700 mt-4">
                  E-mail: <a href="mailto:info@apartmanyvita.sk" className="text-blue-600 hover:underline">info@apartmanyvita.sk</a>
                </p>
                <p className="text-gray-700">
                  Web: <a href="https://apartmanyvita.sk" className="text-blue-600 hover:underline">apartmanyvita.sk</a>
                </p>
              </div>

              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">1.2 Predmet podnikania</h3>
              <p className="text-gray-700 mb-4">
                Prevádzkovateľ poskytuje služby krátkodobého ubytovania v apartmánoch Vita 
                (ďalej len &quot;Apartmány&quot;) prostredníctvom online rezervačného systému.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">1.3 Platnosť podmienok</h3>
              <p className="text-gray-700">
                Tieto Všeobecné obchodné podmienky (ďalej len &quot;VOP&quot;) upravujú vzťahy medzi 
                prevádzkovateľom a hosťom pri poskytovaní ubytovacích služieb. Vytvorením 
                rezervácie hosť potvrdzuje, že sa oboznámil s týmito VOP a súhlasí s nimi.
              </p>
            </section>

            {/* Section 2 */}
            <section id="definitions" className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Definície pojmov</h2>
              
              <div className="space-y-4">
                <div className="border-l-4 border-blue-500 pl-4">
                  <p className="font-semibold text-gray-900">Prevádzkovateľ</p>
                  <p className="text-gray-700">Spoločnosť P2 invest s.r.o., poskytovateľ ubytovacích služieb</p>
                </div>

                <div className="border-l-4 border-blue-500 pl-4">
                  <p className="font-semibold text-gray-900">Hosť</p>
                  <p className="text-gray-700">Fyzická alebo právnická osoba, ktorá si rezervuje ubytovanie</p>
                </div>

                <div className="border-l-4 border-blue-500 pl-4">
                  <p className="font-semibold text-gray-900">Rezervácia</p>
                  <p className="text-gray-700">Objednávka ubytovania na konkrétny termín</p>
                </div>

                <div className="border-l-4 border-blue-500 pl-4">
                  <p className="font-semibold text-gray-900">Apartmán</p>
                  <p className="text-gray-700">Ubytovacia jednotka s vybavením podľa popisu na webe</p>
                </div>

                <div className="border-l-4 border-blue-500 pl-4">
                  <p className="font-semibold text-gray-900">Check-in</p>
                  <p className="text-gray-700">Príchod a prevzatie apartmánu hosťom</p>
                </div>

                <div className="border-l-4 border-blue-500 pl-4">
                  <p className="font-semibold text-gray-900">Check-out</p>
                  <p className="text-gray-700">Odchod a odovzdanie apartmánu prevádzkovateľovi</p>
                </div>
              </div>
            </section>

            {/* Section 3 */}
            <section id="booking" className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Rezervácia a potvrdenie</h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">3.1 Proces rezervácie</h3>
              <ol className="list-decimal pl-6 space-y-2 text-gray-700">
                <li>Hosť si vyberie apartmán a termín na webovej stránke</li>
                <li>Vyplní kontaktné údaje a špeciálne požiadavky</li>
                <li>Skontroluje cenu a podmienky</li>
                <li>Potvrdí rezerváciu a uhradí platbu</li>
                <li>Obdrží potvrdenie rezervácie e-mailom</li>
              </ol>

              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">3.2 Potvrdenie rezervácie</h3>
              <p className="text-gray-700 mb-4">
                Rezervácia je záväzná po jej potvrdení prevádzkovateľom a úhrade platby. 
                Potvrdenie je zaslané e-mailom na adresu uvedenú pri rezervácii.
              </p>

              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4">
                <p className="text-gray-800">
                  <strong>Dôležité:</strong> Skontrolujte si správnosť údajov v potvrdení. 
                  V prípade chyby nás kontaktujte do 24 hodín.
                </p>
              </div>

              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">3.3 Dostupnosť</h3>
              <p className="text-gray-700">
                Prevádzkovateľ si vyhradzuje právo odmietnuť rezerváciu v prípade nedostupnosti 
                apartmánu alebo z iných vážnych dôvodov. V takom prípade bude platba vrátená v plnej výške.
              </p>
            </section>

            {/* Section 4 */}
            <section id="payment" className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Platobné podmienky</h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">4.1 Cena ubytovania</h3>
              <p className="text-gray-700 mb-4">
                Cena ubytovania zahŕňa:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
                <li>Ubytovanie v apartmáne podľa počtu nocí</li>
                <li>Energie (elektrina, voda, kúrenie)</li>
                <li>WiFi pripojenie</li>
                <li>Základné vybavenie (uteráky, posteľná bielizeň)</li>
                <li>Upratovanie po pobyte</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">4.2 Spôsob platby</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded">
                  <span className="text-2xl">💳</span>
                  <div>
                    <p className="font-semibold text-gray-900">Online platba kartou</p>
                    <p className="text-gray-700 text-sm">Bezpečná platba cez Stripe (Visa, Mastercard, American Express)</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded">
                  <span className="text-2xl">🏦</span>
                  <div>
                    <p className="font-semibold text-gray-900">Bankový prevod</p>
                    <p className="text-gray-700 text-sm">Platba musí byť pripísaná najneskôr 3 dni pred príchodom</p>
                  </div>
                </div>
              </div>

              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">4.3 Platobné podmienky</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded">
                  <span className="text-gray-900 font-medium">Rezervácia viac ako 30 dní vopred</span>
                  <span className="text-gray-700">30% záloha, zvyšok 7 dní pred príchodom</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded">
                  <span className="text-gray-900 font-medium">Rezervácia menej ako 30 dní vopred</span>
                  <span className="text-gray-700">100% platba pri rezervácii</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded">
                  <span className="text-gray-900 font-medium">Last minute (menej ako 7 dní)</span>
                  <span className="text-gray-700">100% platba okamžite</span>
                </div>
              </div>

              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">4.4 Faktúra</h3>
              <p className="text-gray-700">
                Faktúra je automaticky zaslaná e-mailom po úhrade platby. Pre firmy je možné 
                vystaviť faktúru s IČO a DIČ - požiadajte o to pri rezervácii.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">4.5 Kaucia</h3>
              <p className="text-gray-700 mb-4">
                Pri check-ine môže byť požadovaná kaucia vo výške <strong>100 €</strong> na pokrytie 
                prípadných škôd. Kaucia je vrátená do 7 dní po check-oute, ak nedôjde k poškodeniu majetku.
              </p>
            </section>

            {/* Section 5 */}
            <section id="cancellation" className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Stornovanie a zmeny rezervácie</h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">5.1 Stornovacie podmienky</h3>
              <div className="space-y-4 mb-6">
                <div className="border-l-4 border-green-500 pl-4 bg-green-50 p-4 rounded-r">
                  <p className="font-semibold text-gray-900">Storno viac ako 30 dní pred príchodom</p>
                  <p className="text-gray-700">Vrátenie 100% zaplatenej sumy</p>
                  <p className="text-sm text-gray-600 mt-1">Storno poplatok: 0%</p>
                </div>

                <div className="border-l-4 border-yellow-500 pl-4 bg-yellow-50 p-4 rounded-r">
                  <p className="font-semibold text-gray-900">Storno 15-30 dní pred príchodom</p>
                  <p className="text-gray-700">Vrátenie 50% zaplatenej sumy</p>
                  <p className="text-sm text-gray-600 mt-1">Storno poplatok: 50%</p>
                </div>

                <div className="border-l-4 border-orange-500 pl-4 bg-orange-50 p-4 rounded-r">
                  <p className="font-semibold text-gray-900">Storno 7-14 dní pred príchodom</p>
                  <p className="text-gray-700">Vrátenie 25% zaplatenej sumy</p>
                  <p className="text-sm text-gray-600 mt-1">Storno poplatok: 75%</p>
                </div>

                <div className="border-l-4 border-red-500 pl-4 bg-red-50 p-4 rounded-r">
                  <p className="font-semibold text-gray-900">Storno menej ako 7 dní pred príchodom</p>
                  <p className="text-gray-700">Bez vrátenia platby</p>
                  <p className="text-sm text-gray-600 mt-1">Storno poplatok: 100%</p>
                </div>
              </div>

              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">5.2 Ako stornovať rezerváciu</h3>
              <ol className="list-decimal pl-6 space-y-2 text-gray-700">
                <li>Prihláste sa do svojho účtu na apartmanyvita.sk</li>
                <li>Prejdite do sekcie &quot;Moje rezervácie&quot;</li>
                <li>Kliknite na &quot;Stornovať rezerváciu&quot;</li>
                <li>Potvrdenie o storne obdržíte e-mailom</li>
              </ol>
              <p className="text-gray-700 mt-4">
                Alternatívne nás môžete kontaktovať e-mailom na <a href="mailto:info@apartmanyvita.sk" className="text-blue-600 hover:underline">info@apartmanyvita.sk</a>
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">5.3 Zmena rezervácie</h3>
              <p className="text-gray-700 mb-4">
                Zmena termínu rezervácie je možná do 14 dní pred príchodom, podľa dostupnosti. 
                Zmena je bezplatná pri prvej úprave, ďalšie zmeny podliehajú poplatku 20 €.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">5.4 No-show (nedostavenie sa)</h3>
              <p className="text-gray-700">
                Ak sa hosť nedostaví bez predchádzajúceho storna, platba sa nevracia a rezervácia 
                sa považuje za zrušenú.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">5.5 Predčasný odchod</h3>
              <p className="text-gray-700">
                Pri predčasnom ukončení pobytu nie je možné vrátiť poplatok za nevyužité noci.
              </p>
            </section>

            {/* Section 6 */}
            <section id="checkin" className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Check-in a check-out</h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">6.1 Check-in</h3>
              <div className="bg-blue-50 p-6 rounded-lg mb-4">
                <p className="text-gray-900 font-semibold mb-2">Štandardný check-in: 15:00 - 20:00</p>
                <p className="text-gray-700 mb-4">
                  Skorší check-in je možný na požiadanie (podľa dostupnosti, poplatok 20 €)
                </p>
                <p className="text-gray-700 font-medium">Postup pri check-ine:</p>
                <ol className="list-decimal pl-6 space-y-1 text-gray-700 mt-2">
                  <li>Oznámte nám čas príchodu aspoň 24 hodín vopred</li>
                  <li>Obdržíte inštrukcie a prístupové kódy e-mailom</li>
                  <li>Pri príchode použite kód na otvorenie apartmánu</li>
                  <li>Skontrolujte stav apartmánu a nahláste prípadné problémy</li>
                </ol>
              </div>

              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">6.2 Check-out</h3>
              <div className="bg-blue-50 p-6 rounded-lg mb-4">
                <p className="text-gray-900 font-semibold mb-2">Štandardný check-out: do 11:00</p>
                <p className="text-gray-700 mb-4">
                  Neskorší check-out je možný na požiadanie (podľa dostupnosti, poplatok 20 €)
                </p>
                <p className="text-gray-700 font-medium">Postup pri check-oute:</p>
                <ol className="list-decimal pl-6 space-y-1 text-gray-700 mt-2">
                  <li>Vypnite všetky elektrické spotrebiče</li>
                  <li>Zatvorte okná a dvere</li>
                  <li>Odneste odpadky do kontajnerov</li>
                  <li>Nechajte kľúče/karty na určenom mieste</li>
                  <li>Uzamknite apartmán</li>
                </ol>
              </div>

              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">6.3 Identifikácia hosťa</h3>
              <p className="text-gray-700">
                Pri check-ine môže byť požadované preukázanie totožnosti (občiansky preukaz, pas). 
                Údaje sú spracovávané v súlade s GDPR a zákonom o ubytovacích službách.
              </p>
            </section>

            {/* Section 7 */}
            <section id="guest-obligations" className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Povinnosti hosťa</h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">7.1 Základné povinnosti</h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Dodržiavať domáci poriadok a tieto VOP</li>
                <li>Používať apartmán a vybavenie šetrne a účelne</li>
                <li>Dodržiavať nočný kľud (22:00 - 7:00)</li>
                <li>Neobťažovať ostatných hostí a susedov</li>
                <li>Nahlásiť poškodenie alebo poruchu vybavenia</li>
                <li>Neorganizovať večierky a hromadné akcie</li>
                <li>Dodržiavať počet osôb uvedený v rezervácii</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">7.2 Zákazy</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-red-50 rounded border-l-4 border-red-500">
                  <span className="text-2xl">🚭</span>
                  <div>
                    <p className="font-semibold text-gray-900">Fajčenie</p>
                    <p className="text-gray-700 text-sm">V apartmáne je prísny zákaz fajčenia. Poplatok za porušenie: 150 €</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-red-50 rounded border-l-4 border-red-500">
                  <span className="text-2xl">🐕</span>
                  <div>
                    <p className="font-semibold text-gray-900">Domáce zvieratá</p>
                    <p className="text-gray-700 text-sm">Nie sú povolené (výnimka po dohode s príplatkom 20 €/noc)</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-red-50 rounded border-l-4 border-red-500">
                  <span className="text-2xl">🎉</span>
                  <div>
                    <p className="font-semibold text-gray-900">Večierky</p>
                    <p className="text-gray-700 text-sm">Hromadné akcie a večierky nie sú povolené</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-red-50 rounded border-l-4 border-red-500">
                  <span className="text-2xl">👥</span>
                  <div>
                    <p className="font-semibold text-gray-900">Prekročenie kapacity</p>
                    <p className="text-gray-700 text-sm">Maximálny počet osôb nesmie byť prekročený. Poplatok: 30 €/osoba/noc</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 8 */}
            <section id="house-rules" className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Domáci poriadok</h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">8.1 Nočný kľud</h3>
              <p className="text-gray-700 mb-4">
                Nočný kľud je od <strong>22:00 do 7:00</strong>. V tomto čase je potrebné obmedziť 
                hlučné aktivity a rešpektovať ostatných hostí a susedov.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">8.2 Čistota a hygiena</h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Udržiavajte apartmán v čistote počas pobytu</li>
                <li>Odnášajte odpadky pravidelne do kontajnerov</li>
                <li>Trieďte odpad podľa označenia (papier, plast, sklo, bio)</li>
                <li>Neuchovávajte v apartmáne verdavé potraviny</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">8.3 Bezpečnosť</h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Pri odchode vždy uzamknite apartmán</li>
                <li>Nevpúšťajte do budovy neznáme osoby</li>
                <li>V prípade požiaru použite hasiaci prístroj a zavolajte 150</li>
                <li>Nemanipulujte s elektrickými rozvodmi a plynom</li>
                <li>Nepoužívajte vlastné elektrické spotrebiče s vysokým príkonom</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">8.4 Parkovanie</h3>
              <p className="text-gray-700">
                Parkovanie je možné na vyhradených miestach. Dodržiavajte dopravné značenie a 
                neparkujte na miestach pre invalidov bez oprávnenia.
              </p>
            </section>

            {/* Section 9 */}
            <section id="liability" className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Zodpovednosť za škody</h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">9.1 Zodpovednosť hosťa</h3>
              <p className="text-gray-700 mb-4">
                Hosť zodpovedá za škody spôsobené na apartmáne, vybavení alebo spoločných priestoroch 
                počas svojho pobytu. Škody musia byť nahradené v plnej výške.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">9.2 Hlásenie škôd</h3>
              <p className="text-gray-700 mb-4">
                Škody a poruchy je potrebné nahlásiť okamžite na telefónne číslo alebo e-mail 
                uvedený v potvrdzujúcom e-maile.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">9.3 Cenník škôd (orientačný)</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="text-gray-900">Strata kľúčov/karty</span>
                  <span className="text-gray-700 font-medium">50 €</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="text-gray-900">Poškodenie nábytku</span>
                  <span className="text-gray-700 font-medium">Podľa ocenenia</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="text-gray-900">Znečistenie vyžadujúce extra upratovanie</span>
                  <span className="text-gray-700 font-medium">50-150 €</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="text-gray-900">Fajčenie v apartmáne</span>
                  <span className="text-gray-700 font-medium">150 €</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="text-gray-900">Poškodenie elektroniky</span>
                  <span className="text-gray-700 font-medium">Podľa ocenenia</span>
                </div>
              </div>

              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">9.4 Zodpovednosť prevádzkovateľa</h3>
              <p className="text-gray-700">
                Prevádzkovateľ nezodpovedá za stratu alebo poškodenie osobných vecí hosťa. 
                Odporúčame uzatvoriť cestovné poistenie.
              </p>
            </section>

            {/* Section 10 */}
            <section id="complaints" className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Reklamácie</h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">10.1 Reklamačný proces</h3>
              <ol className="list-decimal pl-6 space-y-2 text-gray-700">
                <li>Reklamáciu uplatnite okamžite počas pobytu (telefonicky alebo e-mailom)</li>
                <li>Poskytnite fotodokumentáciu problému</li>
                <li>Umožnite prevádzkovateľovi problém vyriešiť</li>
                <li>Ak nie je problém vyriešený, uplatnite písomnú reklamáciu do 14 dní po check-oute</li>
              </ol>

              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">10.2 Forma reklamácie</h3>
              <p className="text-gray-700 mb-4">
                Písomná reklamácia musí obsahovať:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Identifikáciu hosťa a číslo rezervácie</li>
                <li>Popis problému a dátum vzniku</li>
                <li>Fotodokumentáciu (ak je relevantná)</li>
                <li>Požadované riešenie (zľava, vrátenie platby, atď.)</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">10.3 Vybavenie reklamácie</h3>
              <p className="text-gray-700">
                Prevádzkovateľ vybaví reklamáciu do <strong>30 dní</strong> od jej doručenia. 
                O výsledku vás informujeme písomne (e-mailom).
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">10.4 Alternatívne riešenie sporov</h3>
              <p className="text-gray-700">
                V prípade nespokojnosti s vybavením reklamácie môžete kontaktovať Slovenskú 
                obchodnú inšpekciu (SOI) alebo využiť platformu pre riešenie sporov online (ODR).
              </p>
            </section>

            {/* Section 11 */}
            <section id="disputes" className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Riešenie sporov</h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">11.1 Mimosúdne riešenie</h3>
              <p className="text-gray-700 mb-4">
                Snažíme sa riešiť všetky spory mimosúdnou cestou. V prípade problému nás 
                kontaktujte a pokúsime sa nájsť vzájomne prijateľné riešenie.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">11.2 Príslušný súd</h3>
              <p className="text-gray-700">
                Ak nie je možné dosiahnuť dohodu, spory budú riešené na príslušnom súde 
                Slovenskej republiky podľa miesta sídla prevádzkovateľa (Trenčín).
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">11.3 Rozhodné právo</h3>
              <p className="text-gray-700">
                Vzťahy neupravené týmito VOP sa riadia právnym poriadkom Slovenskej republiky, 
                najmä Občianskym zákonníkom a Zákonom o ochrane spotrebiteľa.
              </p>
            </section>

            {/* Section 12 */}
            <section id="final" className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Záverečné ustanovenia</h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">12.1 Zmeny VOP</h3>
              <p className="text-gray-700 mb-4">
                Prevádzkovateľ si vyhradzuje právo zmeniť tieto VOP. Zmeny nadobúdajú účinnosť 
                dňom zverejnenia na webovej stránke. Na už existujúce rezervácie sa vzťahujú 
                VOP platné v čase vytvorenia rezervácie.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">12.2 Neplatnosť ustanovení</h3>
              <p className="text-gray-700 mb-4">
                Ak je niektoré ustanovenie týchto VOP neplatné alebo nevymáhateľné, ostatné 
                ustanovenia zostávajú v platnosti.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">12.3 Ochrana osobných údajov</h3>
              <p className="text-gray-700 mb-4">
                Spracovanie osobných údajov je upravené v samostatnom dokumente{' '}
                <Link href="/privacy-policy" className="text-blue-600 hover:underline font-semibold">
                  Ochrana osobných údajov
                </Link>.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">12.4 Kontakt</h3>
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg">
                <p className="font-semibold text-gray-900 text-lg mb-4">P2 invest s.r.o.</p>
                <div className="space-y-2 text-gray-700">
                  <p>📍 Saratovská 7388/1B, 911 08 Trenčín, Slovensko</p>
                  <p>📧 E-mail: <a href="mailto:info@apartmanyvita.sk" className="text-blue-600 hover:underline font-semibold">info@apartmanyvita.sk</a></p>
                  <p>🌐 Web: <a href="https://apartmanyvita.sk" className="text-blue-600 hover:underline">apartmanyvita.sk</a></p>
                  <p>🏢 IČO: 47992701</p>
                  <p>💼 IČ DPH: SK2120035951</p>
                </div>
              </div>

              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">12.5 Účinnosť</h3>
              <p className="text-gray-700">
                Tieto VOP nadobúdajú účinnosť dňa {new Date().toLocaleDateString('sk-SK', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}.
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
