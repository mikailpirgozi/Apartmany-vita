import { redirect } from 'next/navigation'
import { isAdmin } from '@/lib/admin'
import { prisma } from '@/lib/db'
import { AdminBreakfastList } from '@/components/admin/admin-breakfast-list'

export const metadata = {
  title: 'Správa ranajok - Admin | Apartmány Vita',
  description: 'Admin panel pre správu ranajok v Pražiarničke',
}

export default async function AdminBreakfastPage() {
  // Check if user is admin
  const userIsAdmin = await isAdmin()
  
  if (!userIsAdmin) {
    redirect('/auth/signin')
  }

  // Fetch all breakfasts
  const breakfasts = await prisma.breakfast.findMany({
    orderBy: [
      { sortOrder: 'asc' },
      { name: 'asc' },
    ],
  })

  // Serialize breakfasts for client component (convert Decimal to string)
  const serializedBreakfasts = breakfasts.map(breakfast => ({
    id: breakfast.id,
    name: breakfast.name,
    slug: breakfast.slug,
    description: breakfast.description,
    price: breakfast.price.toString(),
    weight: breakfast.weight,
    images: breakfast.images,
    category: breakfast.category,
    allergens: breakfast.allergens,
    isActive: breakfast.isActive,
    sortOrder: breakfast.sortOrder,
    guestPrice: breakfast.guestPrice?.toString() || null,
    createdAt: breakfast.createdAt.toISOString(),
    updatedAt: breakfast.updatedAt.toISOString(),
  }))

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Správa ranajok</h1>
        <p className="text-muted-foreground">
          Spravuj menu ranajok v Pražiarničke. Pridávaj nové položky, upravuj ceny, nahraj fotky a organizuj kategórie.
        </p>
        <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
          <p className="text-sm text-amber-900 dark:text-amber-100">
            <strong>Pre hostí apartmánov:</strong> 9,90€ dospelý / 5,90€ dieťa
          </p>
          <p className="text-sm text-amber-800 dark:text-amber-200 mt-1">
            <strong>Otváracie hodiny:</strong> Po-Pi 7:30-13:00 | So 8:00-13:00 | Ne 9:00-13:00
          </p>
        </div>
      </div>

      <AdminBreakfastList breakfasts={serializedBreakfasts} />
    </div>
  )
}
