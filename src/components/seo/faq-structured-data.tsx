'use client'

/**
 * FAQ structured data for rich snippets in Google Search
 * Displays frequently asked questions directly in search results
 */
export function FAQStructuredData() {
  const faqData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Aká je minimálna dĺžka pobytu v Apartmánoch Vita Trenčín?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Minimálna dĺžka pobytu je 1 noc. Pre dlhodobé pobyty (7+ nocí) ponúkame zľavy až 10%."
        }
      },
      {
        "@type": "Question",
        "name": "Je v apartmánoch dostupné parkovanie?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Áno, pre všetkých hostí je k dispozícii bezplatné parkovanie priamo pri budove."
        }
      },
      {
        "@type": "Question",
        "name": "O koľkej je check-in a check-out?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Check-in je od 15:00, check-out do 11:00. V prípade potreby skoršieho príchodu alebo neskoršieho odchodu nás kontaktujte."
        }
      },
      {
        "@type": "Question",
        "name": "Sú apartmány vybavené kuchyňou?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Áno, všetky apartmány majú plne vybavenú kuchyňu s chladničkou, varnou doskou, mikrovlnkou, riadom a príborom."
        }
      },
      {
        "@type": "Question",
        "name": "Je v apartmánoch WiFi?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Áno, všetky apartmány majú bezplatné vysokorýchlostné WiFi pripojenie."
        }
      },
      {
        "@type": "Question",
        "name": "Ako ďaleko je centrum Trenčína?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Apartmány Vita sa nachádzajú priamo na Štúrovom námestí v historickom centre Trenčína. Hrad Trenčín je vzdialený 5 minút pešo."
        }
      },
      {
        "@type": "Question",
        "name": "Aké sú možnosti platby?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Akceptujeme platbu kartou online, bankovým prevodom alebo v hotovosti pri príchode."
        }
      },
      {
        "@type": "Question",
        "name": "Môžem zrušiť rezerváciu?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Áno, rezerváciu môžete zrušiť bezplatne až 24 hodín pred príchodom. Pri neskoršom zrušení účtujeme poplatok za prvú noc."
        }
      }
    ]
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(faqData) }}
    />
  );
}
