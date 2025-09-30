import { redirect } from 'next/navigation'
import { isAdmin } from '@/lib/admin'
import { prisma } from '@/lib/db'
import { AdminApartmentsList } from '@/components/admin/admin-apartments-list'

export const metadata = {
  title: 'Správa apartmánov - Admin | Apartmány Vita',
  description: 'Admin panel pre správu fotiek apartmánov',
}

export default async function AdminApartmentsPage() {
  // Check if user is admin
  const userIsAdmin = await isAdmin()
  
  if (!userIsAdmin) {
    redirect('/auth/signin')
  }

  // Fetch all apartments
  const apartments = await prisma.apartment.findMany({
    orderBy: {
      name: 'asc'
    }
  })

  // Serialize apartments for client component (convert Decimal to string)
  const serializedApartments = apartments.map(apt => ({
    id: apt.id,
    name: apt.name,
    images: apt.images
  }))

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Správa apartmánov</h1>
        <p className="text-muted-foreground">
          Spravuj fotky apartmánov. Zmeny sa uložia po kliknutí na tlačidlo Uložiť.
        </p>
      </div>

      <AdminApartmentsList apartments={serializedApartments} />
    </div>
  )
}

