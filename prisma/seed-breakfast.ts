import { PrismaClient, BreakfastCategory } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🍳 Seeding breakfast menu...')

  // Clear existing breakfasts (optional)
  await prisma.breakfast.deleteMany({})
  console.log('🗑️  Cleared existing breakfast items')

  const breakfasts = [
    // ===== CHLIEB A VAJÍČKA =====
    {
      name: 'Miešané vajíčka',
      slug: 'miesane-vajicka',
      description: 'Vajíčko (3ks), šalátik, domáci chlebík',
      price: 5.58,
      weight: '200g',
      category: BreakfastCategory.BREAD_AND_EGGS,
      allergens: ['1', '3', '7'],
      images: [],
      isActive: true,
      sortOrder: 1,
    },
    {
      name: 'Ham & Eggs',
      slug: 'ham-and-eggs',
      description: 'Vajíčko (2ks), šunka, domáci chlebík',
      price: 6.58,
      weight: '200g',
      category: BreakfastCategory.BREAD_AND_EGGS,
      allergens: ['1', '3', '7'],
      images: [],
      isActive: true,
      sortOrder: 2,
    },
    {
      name: 'Vajce benedikt',
      slug: 'vajce-benedikt',
      description: 'Vajíčko (2ks), domáci chlebík, avokádo, holandská omáčka, cheddar, slaninka / losos',
      price: 8.98,
      weight: '200g',
      category: BreakfastCategory.BREAD_AND_EGGS,
      allergens: ['1', '3', '7'],
      images: [],
      isActive: true,
      sortOrder: 3,
    },
    {
      name: 'Chlieb vo vajíčku',
      slug: 'chlieb-vo-vajicku',
      description: 'Domáci chlebík, kečup, šalátik',
      price: 6.18,
      weight: '200g',
      category: BreakfastCategory.BREAD_AND_EGGS,
      allergens: ['1', '3', '7'],
      images: [],
      isActive: true,
      sortOrder: 4,
    },

    // ===== SLADKÉ RAŇAJKY =====
    {
      name: 'Grécky jogurt',
      slug: 'grecky-jogurt',
      description: 'Grécky jogurt, ovocie, med, vlašské orechy',
      price: 5.28,
      weight: '300g',
      category: BreakfastCategory.SWEET,
      allergens: ['1', '7', '8'],
      images: [],
      isActive: true,
      sortOrder: 5,
    },
    {
      name: 'Francúzsky toast',
      slug: 'francuzsky-toast',
      description: 'Vianočka, kyslá smotana, ovocie',
      price: 6.58,
      weight: '250g',
      category: BreakfastCategory.SWEET,
      allergens: ['1', '3', '7'],
      images: [],
      isActive: true,
      sortOrder: 6,
    },
    {
      name: 'Dubajský toast',
      slug: 'dubajsky-toast',
      description: 'Vianočka, pistácie, jahody, čokoláda',
      price: 7.48,
      weight: '250g',
      category: BreakfastCategory.SWEET,
      allergens: ['1', '7', '8'],
      images: [],
      isActive: true,
      sortOrder: 7,
    },
    {
      name: 'Plnená palacinka',
      slug: 'plnena-palacinka',
      description: 'Palacinka, mascarpone, jahody, čerstvé bobulové ovocie, horúca čokoláda',
      price: 5.98,
      weight: '140g',
      category: BreakfastCategory.SWEET,
      allergens: ['1', '3', '7'],
      images: [],
      isActive: true,
      sortOrder: 8,
    },

    // ===== SLANÉ RAŇAJKY =====
    {
      name: 'Anglické raňajky',
      slug: 'anglicke-ranajky',
      description: 'Párky (2ks), slanina, volské oko (2ks), fazuľky, domáci chlebík',
      price: 8.18,
      weight: '300g',
      category: BreakfastCategory.SAVORY,
      allergens: ['1', '3', '7', '10', '11'],
      images: [],
      isActive: true,
      sortOrder: 9,
    },
    {
      name: 'Špišské párky',
      slug: 'spisske-parky',
      description: 'Párky (3ks), kečup, horčica, domáci chlebík (3ks), šalátik',
      price: 6.28,
      weight: '250g',
      category: BreakfastCategory.SAVORY,
      allergens: ['1', '3', '7', '10', '11'],
      images: [],
      isActive: true,
      sortOrder: 10,
    },
    {
      name: 'Bagel',
      slug: 'bagel',
      description: 'Bagel, praženica, cibuľka, slanina, šalátik',
      price: 6.58,
      weight: '220g',
      category: BreakfastCategory.SAVORY,
      allergens: ['1', '3', '7', '10', '11'],
      images: [],
      isActive: true,
      sortOrder: 11,
    },
    {
      name: 'Avokádový chlebík',
      slug: 'avokadovy-chlebik',
      description: 'Domáci chlebík, avokádo, Feta/Halloumi, granátové jablko',
      price: 7.28,
      weight: '250g',
      category: BreakfastCategory.SAVORY,
      allergens: ['1', '7', '10'],
      images: [],
      isActive: true,
      sortOrder: 12,
    },

    // ===== DRINKY =====
    {
      name: 'Závorový shot',
      slug: 'zavorovy-shot',
      description: 'Čerstvý závorový shot pre povzbudenie',
      price: 2.18,
      weight: '5cl',
      category: BreakfastCategory.DRINKS,
      allergens: [],
      images: [],
      isActive: true,
      sortOrder: 13,
    },
    {
      name: 'Čerstvá šťava',
      slug: 'cerstva-stava',
      description: 'Čerstvá šťava podľa ponuky',
      price: 2.18,
      weight: '0,1L',
      category: BreakfastCategory.DRINKS,
      allergens: [],
      images: [],
      isActive: true,
      sortOrder: 14,
    },
    {
      name: 'Matcha - Banán Smoothie',
      slug: 'matcha-banan-smoothie',
      description: 'Osviežujúce smoothie s matchou a banánom',
      price: 4.58,
      weight: '0,25L',
      category: BreakfastCategory.DRINKS,
      allergens: ['7'],
      images: [],
      isActive: true,
      sortOrder: 15,
    },
    {
      name: 'Banánový Milkshake s vanilkou',
      slug: 'bananovy-milkshake',
      description: 'Krémový milkshake s banánom a vanilkou',
      price: 3.58,
      weight: '0,4L',
      category: BreakfastCategory.DRINKS,
      allergens: ['7'],
      images: [],
      isActive: true,
      sortOrder: 16,
    },
    {
      name: 'Mango ReFresh',
      slug: 'mango-refresh',
      description: 'Osviežujúci mangový nápoj',
      price: 4.58,
      weight: '0,3L',
      category: BreakfastCategory.DRINKS,
      allergens: [],
      images: [],
      isActive: true,
      sortOrder: 17,
    },

    // ===== CELODENNÉ SNACKY =====
    {
      name: 'Zapekaný toast',
      slug: 'zapekany-toast',
      description: 'Šunka, cheddar, eidam, šalátik',
      price: 4.28,
      weight: '140g',
      category: BreakfastCategory.SNACKS,
      allergens: ['1', '7'],
      images: [],
      isActive: true,
      sortOrder: 18,
    },
    {
      name: 'Tuna lover',
      slug: 'tuna-lover',
      description: 'Tuniak, domáci chlebík, šalátik',
      price: 6.98,
      weight: '225g',
      category: BreakfastCategory.SNACKS,
      allergens: ['1', '3', '4', '7', '10'],
      images: [],
      isActive: true,
      sortOrder: 19,
    },
    {
      name: 'Croissant plnený podľa ponuky',
      slug: 'croissant-plneny',
      description: 'Čerstvý croissant s plnkou podľa dennej ponuky',
      price: 5.98,
      weight: '140g',
      category: BreakfastCategory.SNACKS,
      allergens: ['1', '3', '7'],
      images: [],
      isActive: true,
      sortOrder: 20,
    },
    {
      name: 'Dubajská palacinka',
      slug: 'dubajska-palacinka',
      description: 'Palacinka, pistáciové mascarpone, jahody, čokoláda',
      price: 7.98,
      weight: '140g',
      category: BreakfastCategory.SNACKS,
      allergens: ['1', '3', '6', '7'],
      images: [],
      isActive: true,
      sortOrder: 21,
    },
  ]

  for (const breakfast of breakfasts) {
    const created = await prisma.breakfast.create({
      data: breakfast,
    })
    console.log(`✅ Created breakfast: ${created.name} (${created.slug}) - ${created.price}€`)
  }

  console.log('🎉 Breakfast seeding completed!')
  console.log(`📊 Total items: ${breakfasts.length}`)
  console.log('📝 Allergen legend:')
  console.log('   1 - Obilniny obsahujúce lepok')
  console.log('   3 - Vajcia')
  console.log('   4 - Ryby')
  console.log('   6 - Sójové bôby')
  console.log('   7 - Mlieko')
  console.log('   8 - Orechy')
  console.log('   10 - Horčica')
  console.log('   11 - Sezamové semená')
}

main()
  .catch((e) => {
    console.error('❌ Breakfast seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
