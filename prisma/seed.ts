import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Clear existing apartments (optional)
  await prisma.apartment.deleteMany({})
  console.log('🗑️  Cleared existing apartments')

  // Create apartments with placeholder images from Unsplash
  // NOTE: Replace these with real apartment photos via admin panel later
  const apartments = [
    {
      name: 'Design Apartmán',
      slug: 'design-apartman',
      description: `Design Apartmán v srdci Trenčína ponúka jedinečný zážitok z moderného bývania s dôrazom na štýl a komfort. Tento 45 m² apartmán na prvom poschodí je ideálny pre páry, rodiny s deťmi alebo skupiny až 6 hostí, ktorí hľadajú kvalitné ubytovanie v centre mesta.

Apartmán sa nachádza priamo na Štúrovom námestí, v historickom centre Trenčína, len pár krokov od Trenčianskeho hradu, reštaurácií, kaviarní a obchodov. Výborná dostupnosť MHD, vlakovej a autobusovej stanice zabezpečuje pohodlné spojenie do celého regiónu.

Interiér apartmánu je zariadený v modernom dizajnovom štýle s kvalitným nábytkom a vybavením. Priestranná obývacia izba s pohodlnou sedačkou a Smart TV je ideálna na relaxáciu. Kompletne vybavená kuchyňa obsahuje všetko potrebné pre prípravu jedál - chladnička s mrazničkou, elektrický sporák, mikrovlnná rúra, rýchlovarná kanvica, kávovary a kompletné kuchynské náradie.

Spálňa je vybavená kvalitným manželským lôžkom s ortopedickým matracmi pre maximálny komfort. Moderná kúpeľňa s sprchovacím kútom, WC a práčkou ponúka všetko potrebné pre pohodlný pobyt. K dispozícii sú čisté uteráky, toaletné potreby a fén.

Apartmán je vybavený rýchlym WiFi pripojením zadarmo, klimatizáciou pre letné mesiace a kvalitným kúrením pre zimu. Výťah v budove zabezpečuje pohodlný prístup a bezplatné parkovanie priamo pri budove je veľkou výhodou v centre mesta.

Perfektná voľba pre turistov, obchodných cestujúcich aj rodiny s deťmi, ktorí chcú spoznať Trenčín a okolie v pohodlí moderného apartmánu.`,
      floor: 1,
      size: 45,
      maxGuests: 6,
      maxChildren: 4,
      images: [
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1560448204-603b3fc33ddc?w=800&h=600&fit=crop&crop=center'
      ],
      amenities: ['wifi', 'kitchen', 'tv', 'heating', 'washer', 'elevator', 'parking'],
      basePrice: 105,
      isActive: true,
      beds24Id: '227484',
      seoTitle: 'Design Apartmán Trenčín – Moderný apartmán v centre',
      seoDescription: 'Štýlový Design Apartmán 45m² v centre Trenčína. WiFi, kuchyňa, parkovanie zadarmo. Ideálny pre rodiny až 6 osôb. Rezervujte online!',
      seoKeywords: ['design apartmán trenčín', 'ubytovanie trenčín centrum', 'apartmán štúrovo námestie', 'moderný apartmán trenčín', 'apartmán s parkovaním trenčín']
    },
    {
      name: 'Lite Apartmán',
      slug: 'lite-apartman',
      description: `Lite Apartmán je priestranný 55 m² apartmán na druhom poschodí s balkónom a nádherným výhľadom na historické centrum Trenčína. Tento moderný apartmán je ideálny pre páry, malé rodiny alebo obchodných cestujúcich, ktorí hľadajú pohodlné ubytovanie v srdci mesta.

Nachádza sa na Štúrovom námestí, v absolútnom centre Trenčína, s výbornou dostupnosťou ku všetkým hlavným atrakciám. Trenčiansky hrad je vzdialený len 5 minút pešo, rovnako ako množstvo reštaurácií, kaviarní a obchodov. Vlakové a autobusové nádražie sú v dochádzkovej vzdialenosti.

Apartmán ponúka svetlý a vzdušný priestor s moderným zariadením. Obývacia izba je vybavená pohodlnou sedačkou, jedálenským stolom a Smart TV s prístupom k streamovacím službám. Balkón s posedením je ideálny na ranné kávy alebo večerné posedenie s výhľadom na mesto.

Kuchyňa je plne vybavená všetkým potrebným pre prípravu jedál - chladnička s mrazničkou, elektrický sporák, mikrovlnná rúra, umývačka riadu, rýchlovarná kanvica, kávovar a kompletné kuchynské náradie. Pre dlhodobé pobyty je k dispozícii práčka.

Spálňa s manželským lôžkom a kvalitným ortopedickým matracom zabezpečuje pohodlný spánok. Moderná kúpeľňa so sprchovacím kútom, WC a všetkým potrebným vybavením vrátane fénu a čistých uterákov.

Apartmán disponuje rýchlym WiFi pripojením zadarmo, klimatizáciou pre letné mesiace a efektívnym kúrením pre zimu. Výťah v budove a bezplatné parkovanie priamo pri apartmáne sú samozrejmosťou.

Ideálna voľba pre tých, ktorí hľadajú kvalitné ubytovanie v centre Trenčína s výborným pomerom ceny a kvality.`,
      floor: 2,
      size: 55,
      maxGuests: 2,
      maxChildren: 1,
      images: [
        'https://images.unsplash.com/photo-1560448204-603b3fc33ddc?w=800&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1560448204-603b3fc33ddc?w=800&h=600&fit=crop&crop=center'
      ],
      amenities: ['wifi', 'kitchen', 'tv', 'heating', 'washer', 'dishwasher', 'balcony', 'elevator', 'parking'],
      basePrice: 75,
      isActive: true,
      beds24Id: '168900',
      seoTitle: 'Lite Apartmán Trenčín – Apartmán s balkónom a výhľadom',
      seoDescription: 'Priestranný Lite Apartmán 55m² s balkónom v centre Trenčína. Klimatizácia, WiFi, umývačka riadu. Pre páry a rodiny. Rezervujte teraz!',
      seoKeywords: ['lite apartmán trenčín', 'apartmán s balkónom trenčín', 'ubytovanie centrum trenčín', 'apartmán pre páry trenčín', 'apartmán s klimatizáciou trenčín']
    },
    {
      name: 'Deluxe Apartmán',
      slug: 'deluxe-apartman',
      description: `Deluxe Apartmán je naša najluxusnejšia a najpriestrannejšia ponuka - 70 m² prémiového bývania v absolútnom centre Trenčína. Tento apartmán na druhom poschodí je ideálny pre väčšie rodiny, skupiny priateľov alebo náročných hostí, ktorí očakávajú maximálny komfort a luxus.

Apartmán sa nachádza na Štúrovom námestí, v srdci historického centra Trenčína, s výnimočným výhľadom na mesto a okolie. Všetky hlavné atrakcie, reštaurácie, kaviarne a obchody sú v bezprostrednej blízkosti. Trenčiansky hrad, symbol mesta, je vzdialený len pár minút pešo.

Interiér apartmánu je zariadený v modernom luxusnom štýle s dôrazom na kvalitu a pohodlie. Priestranná obývacia izba s veľkou sedačkou, jedálenským stolom pre 6 osôb a Smart TV vytvára ideálny priestor pre spoločné chvíle. Balkón s posedením ponúka nádherný výhľad na mesto.

Kuchyňa je skutočným srdcom apartmánu - moderná, plne vybavená s ostrovčekom, ktorý slúži ako pracovná plocha aj barový pult. K dispozícii je chladnička s mrazničkou, elektrický sporák, mikrovlnná rúra, umývačka riadu, kávovar, rýchlovarná kanvica a kompletné profesionálne kuchynské vybavenie.

Apartmán disponuje dvoma oddelenými spálňami s kvalitnými manželskými lôžkami a ortopedickými matracmi. Priestranná moderná kúpeľňa s veľkým sprchovacím kútom, WC, práčkou a všetkým potrebným vybavením vrátane fénu, čistých uterákov a toaletných potrieb.

Technické vybavenie je na najvyššej úrovni - rýchle WiFi pripojenie zadarmo, klimatizácia v celom apartmáne, kvalitné kúrenie, Smart TV s prístupom k streamovacím službám. Výťah v budove a bezplatné parkovanie priamo pri apartmáne sú samozrejmosťou.

Deluxe Apartmán je perfektná voľba pre rodiny s deťmi, skupiny priateľov alebo náročných hostí, ktorí chcú zažiť Trenčín v luxuse a pohodlí. Ideálny aj pre dlhodobé pobyty, obchodné cesty alebo špeciálne príležitosti.`,
      floor: 2,
      size: 70,
      maxGuests: 6,
      maxChildren: 4,
      images: [
        'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1560448204-603b3fc33ddc?w=800&h=600&fit=crop&crop=center'
      ],
      amenities: ['wifi', 'kitchen', 'tv', 'heating', 'washer', 'dishwasher', 'balcony', 'elevator', 'parking', 'aircon'],
      basePrice: 100,
      isActive: true,
      beds24Id: '161445',
      seoTitle: 'Deluxe Apartmán Trenčín – Luxusný apartmán pre 6 osôb',
      seoDescription: 'Luxusný Deluxe Apartmán 70m² v centre Trenčína. 2 spálne, klimatizácia, balkón, parkovanie. Ideálny pre rodiny až 6 osôb. Rezervujte!',
      seoKeywords: ['deluxe apartmán trenčín', 'luxusný apartmán trenčín', 'apartmán pre 6 osôb trenčín', 'apartmán 2 spálne trenčín', 'rodinný apartmán trenčín centrum']
    }
  ]

  for (const apartment of apartments) {
    const created = await prisma.apartment.create({
      data: apartment
    })
    console.log(`✅ Created apartment: ${created.name} (${created.slug})`)
  }

  console.log('🎉 Seeding completed!')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

