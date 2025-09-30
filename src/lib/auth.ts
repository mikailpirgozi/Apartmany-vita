import NextAuth from 'next-auth'
import { getServerSession } from 'next-auth/next'
import type { Session, User } from 'next-auth'
import type { JWT } from 'next-auth/jwt'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from './db'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
})

export const authOptions = {
  // Temporarily disable adapter to test OAuth without database
  // adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!
    }),
    
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
            image: user.image
          }
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      }
    })
  ],
  
  callbacks: {
    jwt: async ({ token, user, account }: { token: JWT; user?: User; account?: any }) => {
      if (user) {
        // For OAuth without adapter, generate stable ID from email
        token.id = user.id || `oauth_${user.email?.replace(/[^a-zA-Z0-9]/g, '_')}_${account?.provider || 'google'}`
        token.email = user.email
      }
      return token
    },
    
    session: async ({ session, token }: { session: Session; token: JWT }) => {
      if (token && session.user) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (session.user as any).id = token.id as string
      }
      return session
    },
    
    redirect: async ({ url, baseUrl }: { url: string; baseUrl: string }) => {
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return await getServerSession(authOptions as any)
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const NextAuthHandler = NextAuth as any
export default NextAuthHandler(authOptions)
