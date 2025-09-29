'use client'

import { signOut } from 'next-auth/react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { User, Settings, Calendar, LogOut, Star } from 'lucide-react'
import { useSessionHydrationSafe } from '@/hooks/use-session-hydration-safe'

function UserMenuContent() {
  const { data: session } = useSessionHydrationSafe()

  // NOTE: Dynamic import handles loading state via Suspense
  // Component should render immediately without internal loading checks
  
  if (!session) {
    return (
      <div className="flex items-center space-x-2">
        <Button variant="ghost" asChild>
          <Link href="/auth/signin">Prihlásenie</Link>
        </Button>
        <Button asChild>
          <Link href="/auth/signup">Registrácia</Link>
        </Button>
      </div>
    )
  }

  const getInitials = (name: string | null, email: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase()
    }
    return email[0].toUpperCase()
  }

  // Only render DropdownMenu after mount to prevent hydration mismatch
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarImage src={session.user?.image || undefined} alt={session.user?.name || session.user?.email || ''} />
            <AvatarFallback>
              {getInitials(session.user?.name || null, session.user?.email || '')}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {session.user?.name || 'Nepomenovaný používateľ'}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {session.user?.email}
            </p>
            <div className="pt-1">
              <Badge variant="secondary" className="text-xs">
                <Star className="h-3 w-3 mr-1" />
                5% zľava
              </Badge>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem asChild>
          <Link href="/account/dashboard" className="cursor-pointer">
            <User className="mr-2 h-4 w-4" />
            <span>Môj účet</span>
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuItem asChild>
          <Link href="/account/bookings" className="cursor-pointer">
            <Calendar className="mr-2 h-4 w-4" />
            <span>Moje rezervácie</span>
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuItem asChild>
          <Link href="/account/profile" className="cursor-pointer">
            <Settings className="mr-2 h-4 w-4" />
            <span>Nastavenia</span>
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem
          className="cursor-pointer text-red-600 focus:text-red-600"
          onClick={() => signOut({ callbackUrl: '/' })}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Odhlásiť sa</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function UserMenu() {
  return (
    <div suppressHydrationWarning>
      <UserMenuContent />
    </div>
  )
}
