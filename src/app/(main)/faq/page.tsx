import type { Metadata } from 'next'
import { FAQStructuredData } from '@/components/seo/faq-structured-data'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Často kladené otázky – Apartmány Vita Trenčín',
  description: 'Odpovede na najčastejšie otázky o ubytovaní v Apartmánoch Vita Trenčín. Check-in, parkovanie, WiFi, platba, zrušenie rezervácie a ďalšie.',
  keywords: [
    'FAQ apartmány Trenčín',
    'otázky ubytovanie Trenčín',
    'apartmány Vita FAQ',
    'check-in Trenčín',
    'parkovanie apartmány Trenčín',
    'WiFi ubytovanie Trenčín',
  ],
  openGraph: {
    title: 'Často kladené otázky – Apartmány Vita Trenčín',
    description: 'Odpovede na najčastejšie otázky o ubytovaní v Apartmánoch Vita Trenčín.',
    url: 'https://apartmanvita.sk/faq',
    type: 'website',
  },
}

const faqCategories = [
  {
    category: 'Rezervácia',
    icon: '📅',
    questions: [
      {
        question: 'Aká je minimálna dĺžka pobytu v Apartmánoch Vita Trenčín?',
        answer: 'Minimálna dĺžka pobytu je 1 noc. Pre dlhodobé pobyty (7+ nocí) ponúkame zľavy až 10%. Čím dlhší pobyt, tým väčšia zľava – 7-13 nocí: 5%, 14-29 nocí: 7%, 30+ nocí: 10%.',
      },
      {
        question: 'Ako môžem rezervovať apartmán?',
        answer: 'Rezerváciu môžete vykonať online priamo na našej stránke apartmanvita.sk, kde si vyberiete termín a apartmán. Alternatívne nás môžete kontaktovať telefonicky na +421 940 728 676 alebo emailom na info@apartmanvita.sk.',
      },
      {
        question: 'Môžem zrušiť rezerváciu?',
        answer: 'Áno, rezerváciu môžete zrušiť bezplatne až 24 hodín pred príchodom. Pri neskoršom zrušení účtujeme poplatok za prvú noc. Pre dlhodobé rezervácie (14+ nocí) platia špeciálne podmienky.',
      },
      {
        question: 'Dostanem potvrdenie rezervácie?',
        answer: 'Áno, po úspešnej rezervácii vám automaticky pošleme potvrdenie na váš email s detailmi rezervácie, inštrukciami na check-in a kontaktnými údajmi.',
      },
    ],
  },
  {
    category: 'Check-in & Check-out',
    icon: '🔑',
    questions: [
      {
        question: 'O koľkej je check-in a check-out?',
        answer: 'Check-in je od 15:00, check-out do 11:00. V prípade potreby skoršieho príchodu alebo neskoršieho odchodu nás kontaktujte – pokúsime sa vám vyhovieť podľa dostupnosti.',
      },
      {
        question: 'Ako prebieha check-in?',
        answer: 'Check-in je bezkontaktný. Pred príchodom vám pošleme SMS s kódom na vstup do budovy a apartmánu. Kľúče nájdete v bezpečnostnej schránke priamo v apartmáne. Detailné inštrukcie dostanete emailom.',
      },
      {
        question: 'Môžem prísť neskôr ako o 15:00?',
        answer: 'Áno, check-in je flexibilný a možný 24/7 vďaka bezkontaktnému systému. Stačí nás informovať o predpokladanom čase príchodu.',
      },
    ],
  },
  {
    category: 'Vybavenie & Služby',
    icon: '🏠',
    questions: [
      {
        question: 'Sú apartmány vybavené kuchyňou?',
        answer: 'Áno, všetky apartmány majú plne vybavenú kuchyňu s chladničkou, varnou doskou, mikrovlnkou, riadom a príborom. K dispozícii je aj kávovar, varná kanvica a základné kuchynské potreby.',
      },
      {
        question: 'Je v apartmánoch WiFi?',
        answer: 'Áno, všetky apartmány majú bezplatné vysokorýchlostné WiFi pripojenie (100+ Mbps). Prístupové údaje nájdete v apartmáne.',
      },
      {
        question: 'Je v apartmánoch dostupné parkovanie?',
        answer: 'Áno, pre všetkých hostí je k dispozícii bezplatné parkovanie priamo pri budove. Parkovacie miesta sú vo vnútrobloku, prístup cez bránu s diaľkovým ovládaním.',
      },
      {
        question: 'Sú apartmány klimatizované?',
        answer: 'Áno, všetky apartmány majú klimatizáciu s možnosťou nastavenia teploty. V zime slúži klimatizácia aj na vykurovanie.',
      },
      {
        question: 'Je v budove výťah?',
        answer: 'Áno, budova je vybavená výťahom, takže apartmány na vyšších poschodiach sú ľahko dostupné aj s batožinou.',
      },
    ],
  },
  {
    category: 'Platba',
    icon: '💳',
    questions: [
      {
        question: 'Aké sú možnosti platby?',
        answer: 'Akceptujeme platbu kartou online cez bezpečný platobný systém Stripe, bankovým prevodom alebo v hotovosti pri príchode. Pre online platby používame 3D Secure overenie.',
      },
      {
        question: 'Kedy musím zaplatiť?',
        answer: 'Pri online rezervácii platíte okamžite kartou. Pri rezervácii cez telefón alebo email môžete zaplatiť bankovým prevodom do 24 hodín alebo v hotovosti pri príchode (po dohode).',
      },
      {
        question: 'Dostávam faktúru?',
        answer: 'Áno, faktúru vám automaticky pošleme emailom po úhrade. Ak potrebujete faktúru na firmu, uveďte nám IČO a DIČ pri rezervácii.',
      },
    ],
  },
  {
    category: 'Lokalita',
    icon: '📍',
    questions: [
      {
        question: 'Ako ďaleko je centrum Trenčína?',
        answer: 'Apartmány Vita sa nachádzajú priamo na Štúrovom námestí v historickom centre Trenčína. Trenčiansky hrad je vzdialený 5 minút pešo, hlavné námestie 2 minúty.',
      },
      {
        question: 'Sú v blízkosti obchody a reštaurácie?',
        answer: 'Áno, v okolí je množstvo reštaurácií, kaviarní a obchodov. Supermarket Tesco je 3 minúty pešo, Billa 5 minút. Pešia zóna s reštauráciami je priamo pred budovou.',
      },
      {
        question: 'Ako sa dostanem z vlakového/autobusového nádražia?',
        answer: 'Z vlakového nádražia je to 10 minút pešo alebo 5 minút taxíkom. Z autobusovej stanice 8 minút pešo. Detailné inštrukcie vám pošleme po rezervácii.',
      },
    ],
  },
  {
    category: 'Ostatné',
    icon: '❓',
    questions: [
      {
        question: 'Môžem prísť so psom alebo mačkou?',
        answer: 'Bohužiaľ, v apartmánoch nie sú povolené domáce zvieratá. Ďakujeme za pochopenie.',
      },
      {
        question: 'Je v apartmánoch povolené fajčenie?',
        answer: 'Nie, všetky apartmány jsou nefajčiarske. Fajčenie je povolené len na balkóne (ak ho apartmán má) alebo pred budovou.',
      },
      {
        question: 'Sú apartmány vhodné pre rodiny s deťmi?',
        answer: 'Áno, apartmány sú ideálne pre rodiny. Máme k dispozícii detskú postieľku a vysokú stoličku (na požiadanie). Apartmán Design a Deluxe pojmú až 6 osôb.',
      },
      {
        question: 'Poskytujete uteráky a posteľnú bielizeň?',
        answer: 'Áno, všetky apartmány sú vybavené čistými uterákmi a posteľnou bielizňou. Pri dlhodobých pobytoch (7+ nocí) vykonávame výmenu bielizne.',
      },
    ],
  },
]

export default function FAQPage() {
  return (
    <div className="container py-12">
      {/* FAQ Structured Data for SEO */}
      <FAQStructuredData />

      {/* Header */}
      <div className="max-w-3xl mx-auto text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">
          Často kladené otázky
        </h1>
        <p className="text-lg text-muted-foreground">
          Odpovede na najčastejšie otázky o ubytovaní v Apartmánoch Vita Trenčín. 
          Ak nenájdete odpoveď na vašu otázku, neváhajte nás kontaktovať.
        </p>
      </div>

      {/* FAQ Categories */}
      <div className="max-w-4xl mx-auto space-y-8">
        {faqCategories.map((category, categoryIndex) => (
          <Card key={categoryIndex}>
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl">
                <span className="text-3xl">{category.icon}</span>
                {category.category}
              </CardTitle>
              <CardDescription>
                {category.questions.length} {category.questions.length === 1 ? 'otázka' : category.questions.length < 5 ? 'otázky' : 'otázok'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {category.questions.map((item, questionIndex) => (
                  <AccordionItem 
                    key={questionIndex} 
                    value={`item-${categoryIndex}-${questionIndex}`}
                  >
                    <AccordionTrigger className="text-left">
                      {item.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* CTA Section */}
      <div className="max-w-3xl mx-auto mt-16">
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="text-2xl text-center">
              Nenašli ste odpoveď na vašu otázku?
            </CardTitle>
            <CardDescription className="text-center text-base">
              Radi vám pomôžeme! Kontaktujte nás telefonicky, emailom alebo cez rezervačný formulár.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <Link href="/contact">Kontaktovať nás</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/booking">Rezervovať apartmán</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Links */}
      <div className="max-w-3xl mx-auto mt-12 text-center">
        <h2 className="text-xl font-semibold mb-4">Užitočné odkazy</h2>
        <div className="flex flex-wrap justify-center gap-4">
          <Button asChild variant="link">
            <Link href="/apartments">Naše apartmány</Link>
          </Button>
          <Button asChild variant="link">
            <Link href="/booking">Rezervácia</Link>
          </Button>
          <Button asChild variant="link">
            <Link href="/contact">Kontakt</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
