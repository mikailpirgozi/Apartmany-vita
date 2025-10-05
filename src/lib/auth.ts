import NextAuth from 'next-auth'
import { getServerSession } from 'next-auth/next'
import type { Session, User } from 'next-auth'
import type { JWT } from 'next-auth/jwt'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from './db'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
})

interface AuthCallbackParams {
  token: JWT
  user?: User
  account?: Record<string, unknown> | null
}

interface SessionCallbackParams {
  session: Session
  token: JWT
}

interface RedirectCallbackParams {
  url: string
  baseUrl: string
}

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    // Only enable Google provider if credentials are available
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [GoogleProvider({
          clientId: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET
        })]
      : []),
    
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            return null
          }

          const { email, password } = loginSchema.parse(credentials)
          
          const user = await prisma.user.findUnique({
            where: { email }
          })
          
          if (!user || !user.password) {
            return null
          }
          
          const isPasswordValid = await bcrypt.compare(password, user.password)
          
          if (!isPasswordValid) {
            return null
          }
          
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
            isAdmin: user.isAdmin
          }
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      }
    })
  ],
  
  callbacks: {
    jwt: async ({ token, user }: AuthCallbackParams) => {
      if (user) {
        token.id = user.id
        token.isAdmin = user.isAdmin
      }
      return token
    },
    
    session: async ({ session, token }: SessionCallbackParams) => {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.isAdmin = token.isAdmin as boolean
      }
      return session
    },
    
    redirect: async ({ url, baseUrl }: RedirectCallbackParams) => {
      // Allows relative callback URLs
      if (url.startsWith('/')) return `${baseUrl}${url}`
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url
      return baseUrl
    }
  },
  
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error'
  },
  
  session: {
    strategy: 'jwt' as const
  },
  
  secret: process.env.NEXTAUTH_SECRET
}

export const auth = async (): Promise<Session | null> => {
  // Type assertion needed due to NextAuth v4 compatibility with Next.js 15
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return await getServerSession(authOptions as any) as Session | null
}

// Type assertion needed due to NextAuth v4 compatibility with Next.js 15
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default (NextAuth as any)(authOptions)