'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TypographyH1, TypographyP } from '@/components/ui/typography'
import { AlertCircle } from 'lucide-react'

const errorMessages: Record<string, string> = {
  Configuration: 'Nastala chyba v konfigurácii. Kontaktujte administrátora.',
  AccessDenied: 'Prístup bol zamietnutý. Skúste to znova alebo použite iný účet.',
  Verification: 'Token vypršal alebo bol už použitý. Požiadajte o nový overovací odkaz.',
  OAuthSignin: 'Chyba pri prihlasovaní cez Google. Skúste to znova.',
  OAuthCallback: 'Chyba pri spracovaní odpovede od Google. Skúste to znova.',
  OAuthCreateAccount: 'Nepodarilo sa vytvoriť účet. Skúste použiť iný spôsob prihlásenia.',
  EmailCreateAccount: 'Nepodarilo sa vytvoriť účet. Email už môže byť použitý.',
  Callback: 'Chyba pri spracovaní prihlásenia. Skúste to znova.',
  OAuthAccountNotLinked: 'Tento email už je registrovaný s iným spôsobom prihlásenia. Prihláste sa pomocou pôvodného spôsobu.',
  EmailSignin: 'Nepodarilo sa odoslať prihlasovací email. Skontrolujte váš email.',
  CredentialsSignin: 'Nesprávny email alebo heslo.',
  SessionRequired: 'Na zobrazenie tejto stránky musíte byť prihlásení.',
  Default: 'Nastala neočakávaná chyba. Skúste to prosím znova.'
}

export default function ErrorPage() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')
  
  const errorMessage = error 
    ? errorMessages[error] || errorMessages.Default
    : errorMessages.Default

  return (
    <div className="container max-w-md mx-auto py-16">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="rounded-full bg-destructive/10 p-3">
            <AlertCircle className="h-10 w-10 text-destructive" />
          </div>
        </div>
        <TypographyH1 className="mb-2">Chyba prihlásenia</TypographyH1>
        <TypographyP className="text-muted-foreground">
          Niečo sa pokazilo pri pokuse o prihlásenie
        </TypographyP>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-center">Čo sa stalo?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-muted p-4 rounded-lg">
            <TypographyP className="text-center">
              {errorMessage}
            </TypographyP>
          </div>
          
          {error && (
            <div className="text-xs text-muted-foreground text-center">
              Kód chyby: {error}
            </div>
          )}
          
          <div className="flex flex-col gap-3">
            <Button asChild className="w-full">
              <Link href="/auth/signin">
                Skúsiť znova
              </Link>
            </Button>
            
            <Button asChild variant="outline" className="w-full">
              <Link href="/">
                Späť na domovskú stránku
              </Link>
            </Button>
          </div>
          
          <div className="text-center">
            <TypographyP className="text-sm text-muted-foreground">
              Potrebujete pomoc?{' '}
              <Link href="/contact" className="text-primary hover:underline">
                Kontaktujte nás
              </Link>
            </TypographyP>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
