import { ApartmentGridSkeleton } from '@/components/ui/apartment-skeleton'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export default function ApartmentsLoading() {
  return (
    <div className="container py-8">
      <div className="mb-8">
        <Skeleton className="h-9 w-64 mb-4" />
        <Skeleton className="h-4 w-96" />
      </div>

      {/* Search Form Skeleton */}
      <Card className="p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Skeleton className="h-4 w-12 mb-2" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div>
            <Skeleton className="h-4 w-12 mb-2" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div>
            <Skeleton className="h-4 w-12 mb-2" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="flex items-end">
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </Card>
      
      <ApartmentGridSkeleton count={6} />
    </div>
  )
}
