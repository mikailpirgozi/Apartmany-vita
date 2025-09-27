import NextAuth, { NextAuthOptions } from 'next-auth'
import { getServerSession } from 'next-auth/next'
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

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
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
    jwt: async ({ token, user }) => {
      if (user) {
        token.id = user.id
      }
      return token
    },
    
    session: async ({ session, token }) => {
      if (token && session.user) {
        session.user.id = token.id as string
      }
      return session
    }
  },
  
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error'
  },
  
  session: {
    strategy: 'jwt'
  },
  
  secret: process.env.NEXTAUTH_SECRET
}

export const auth = () => getServerSession(authOptions)
export default NextAuth(authOptions)