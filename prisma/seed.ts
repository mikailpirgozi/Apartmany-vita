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
      description: 'Štýlovo zariadený apartmán s moderným dizajnom na prvom poschodí. Perfektný pre páry aj rodiny. Kompletne vybavená kuchyňa, moderná kúpeľňa, pohodlné lôžka a krásny výhľad na Štúrovo námestie.',
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
      beds24Id: '227484'
    },
    {
      name: 'Lite Apartmán',
      slug: 'lite-apartman',
      description: 'Priestranný apartmán na druhom poschodí s balkónom a krásnym výhľadom na mesto. Ideálny pre páry alebo malé rodiny. Plne vybavená kuchyňa s umývačkou riadu, moderná kúpeľňa, klimatizácia a všetko potrebné vybavenie.',
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
      beds24Id: '168900'
    },
    {
      name: 'Deluxe Apartmán',
      slug: 'deluxe-apartman',
      description: 'Najluxusnejší apartmán s krásnym výhľadom a kompletným vybavením pre až 6 hostí. Veľkorysý priestor, dve spálne, moderná kuchyňa s ostrovčekom, luxusná kúpeľňa, klimatizácia a všetko čo potrebujete pre pohodlný pobyt.',
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
      beds24Id: '161445'
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

