'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession, signIn } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { SignupForm } from '@/components/forms/signup-form'
import { TypographyH1, TypographyP } from '@/components/ui/typography'
import { Badge } from '@/components/ui/badge'

export default function SignUpPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  useEffect(() => {
    if (session) {
      router.push('/')
    }
  }, [session, router])

  if (status === 'loading') {
    return (
      <div className="container max-w-md mx-auto py-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        </div>
      </div>
    )
  }

  if (session) {
    return null // Will redirect
  }

  return (
    <div className="container max-w-md mx-auto py-16">
      <div className="text-center mb-8">
        <TypographyH1 className="mb-2">Registrácia</TypographyH1>
        <TypographyP className="text-muted-foreground mb-4">
          Vytvorte si účet a získajte okamžite 5% zľavu
        </TypographyP>
        
        <div className="flex justify-center gap-2 mb-4">
          <Badge variant="secondary">5% zľava</Badge>
          <Badge variant="secondary">Rýchlejšie rezervácie</Badge>
          <Badge variant="secondary">História pobytov</Badge>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-center">Nový účet</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Google OAuth Button */}
          <GoogleSignUpButton />
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Alebo</span>
            </div>
          </div>
          
          {/* Registration Form */}
          <SignupForm />
          
          <div className="text-center">
            <TypographyP className="text-sm text-muted-foreground">
              Už máte účet?{' '}
              <Link href="/auth/signin" className="text-primary hover:underline">
                Prihláste sa
              </Link>
            </TypographyP>
          </div>
          
          <div className="text-xs text-muted-foreground text-center">
            Registráciou súhlasíte s našimi{' '}
            <Link href="/terms" className="text-primary hover:underline">
              obchodnými podmienkami
            </Link>{' '}
            a{' '}
            <Link href="/privacy" className="text-primary hover:underline">
              zásadami ochrany osobných údajov
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function GoogleSignUpButton() {
  return (
    <Button
      variant="outline"
      className="w-full"
      onClick={() => signIn('google')}
    >
      <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
        <path
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          fill="#4285F4"
        />
        <path
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          fill="#34A853"
        />
        <path
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          fill="#FBBC05"
        />
        <path
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          fill="#EA4335"
        />
      </svg>
      Registrácia cez Google
    </Button>
  )
}
