import { ReactNode } from 'react'

interface AuthLayoutProps {
  children: ReactNode
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="flex min-h-screen items-center justify-center p-4">
        {children}
      </div>
    </div>
  )
}
