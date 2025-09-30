'use client'

import Link from 'next/link'
import { useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession, signIn } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { SigninForm } from '@/components/forms/signin-form'
import { TypographyH1, TypographyP } from '@/components/ui/typography'

function SignInContent() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  
  useEffect(() => {
    // Check if we just returned from OAuth callback
    const error = searchParams.get('error')
    if (error) {
      router.push(`/auth/error?error=${error}`)
      return
    }
    
    // Redirect if already authenticated
    if (session) {
      const callbackUrl = searchParams.get('callbackUrl') || '/'
      router.push(callbackUrl)
      router.refresh()
    }
  }, [session, router, searchParams])

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
        <TypographyH1 className="mb-2">Prihlásenie</TypographyH1>
        <TypographyP className="text-muted-foreground">
          Prihláste sa a získajte 5% zľavu na všetky rezervácie
        </TypographyP>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-center">Vstup do účtu</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Google OAuth Button */}
          <GoogleSignInButton />
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Alebo</span>
            </div>
          </div>
          
          {/* Email/Password Form */}
          <SigninForm />
          
          <div className="text-center space-y-2">
            <Link 
              href="/auth/forgot-password" 
              className="text-sm text-primary hover:underline"
            >
              Zabudli ste heslo?
            </Link>
            
            <TypographyP className="text-sm text-muted-foreground">
              Nemáte účet?{' '}
              <Link href="/auth/signup" className="text-primary hover:underline">
                Zaregistrujte sa
              </Link>
            </TypographyP>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function GoogleSignInButton() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/'
  
  const handleGoogleSignIn = async () => {
    try {
      await signIn('google', { 
        callbackUrl,
        redirect: true 
      })
    } catch (error) {
      console.error('Google sign in error:', error)
      router.push('/auth/error')
    }
  }
  
  return (
    <Button
      variant="outline"
      className="w-full"
      onClick={handleGoogleSignIn}
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
      Prihlásenie cez Google
    </Button>
  )
}

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="container max-w-md mx-auto py-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        </div>
      </div>
    }>
      <SignInContent />
    </Suspense>
  )
}
