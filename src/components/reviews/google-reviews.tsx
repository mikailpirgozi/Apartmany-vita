'use client'

import { useQuery } from '@tanstack/react-query'
import { Card } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Star, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'
import { GoogleReviewsResponse } from '@/services/google-reviews'
import { Skeleton } from '@/components/ui/skeleton'
import Link from 'next/link'

async function fetchGoogleReviews(): Promise<GoogleReviewsResponse> {
  const response = await fetch('/api/reviews/google')
  if (!response.ok) {
    throw new Error('Failed to fetch reviews')
  }
  return response.json()
}

function ReviewsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <Card key={i} className="p-6">
          <div className="flex items-center mb-4">
            <Skeleton className="h-10 w-10 rounded-full mr-3" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-3 w-16 mt-2" />
        </Card>
      ))}
    </div>
  )
}

function StarRating({ rating, size = 'default' }: { rating: number; size?: 'sm' | 'default' | 'lg' }) {
  const sizeClasses = {
    sm: 'h-3 w-3',
    default: 'h-4 w-4',
    lg: 'h-6 w-6'
  }

  return (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            sizeClasses[size],
            star <= rating 
              ? "text-yellow-400 fill-current" 
              : "text-gray-300"
          )}
        />
      ))}
    </div>
  )
}

export function GoogleReviews() {
  const { data: reviews, isLoading, error } = useQuery({
    queryKey: ['google-reviews'],
    queryFn: fetchGoogleReviews,
    staleTime: 1000 * 60 * 60, // 1 hour
    retry: 2
  })

  if (isLoading) {
    return (
      <section className="py-16">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Recenzie od hostí</h2>
            <Skeleton className="h-6 w-48 mx-auto mb-4" />
          </div>
          <ReviewsSkeleton />
        </div>
      </section>
    )
  }

  if (error || !reviews) {
    return (
      <section className="py-16">
        <div className="container">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">Recenzie od hostí</h2>
            <p className="text-muted-foreground">
              Momentálne sa nám nepodarilo načítať recenzie. Skúste to neskôr.
            </p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 bg-muted/30">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Recenzie od hostí</h2>
          
          <div className="flex items-center justify-center gap-3 mb-6">
            <StarRating rating={Math.floor(reviews.averageRating)} size="lg" />
            <span className="text-2xl font-bold">{reviews.averageRating}</span>
            <span className="text-muted-foreground">
              ({reviews.totalReviews} recenzií)
            </span>
          </div>
          
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Prečítajte si, co hovoria naši hostia o pobyte v Apartmánoch Vita. 
            Vaše spokojnosť je naša priorita.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {reviews.reviews.slice(0, 6).map((review, index) => (
            <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start mb-4">
                <Avatar className="h-12 w-12 mr-3">
                  <AvatarImage 
                    src={review.profile_photo_url} 
                    alt={review.author_name} 
                  />
                  <AvatarFallback>
                    {review.author_name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{review.author_name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <StarRating rating={review.rating} size="sm" />
                    <span className="text-xs text-muted-foreground">
                      {review.relative_time_description}
                    </span>
                  </div>
                </div>
              </div>
              
              <p className="text-sm text-muted-foreground line-clamp-4 leading-relaxed">
                {review.text}
              </p>
            </Card>
          ))}
        </div>
        
        <div className="text-center space-y-4">
          <Button asChild size="lg">
            <Link 
              href="https://g.page/apartmanyvita/review" 
              target="_blank"
              rel="noopener noreferrer"
              className="gap-2"
            >
              Napísať recenziu na Google
              <ExternalLink className="h-4 w-4" />
            </Link>
          </Button>
          
          <p className="text-sm text-muted-foreground">
            Pomôžte ostatným hosťom a podeľte sa o svoju skúsenosť
          </p>
        </div>
      </div>
    </section>
  )
}
