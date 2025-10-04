/**
 * Admin authorization utilities
 * UNIFIED: Uses both DB isAdmin flag AND email whitelist for security
 */

import { auth } from './auth'
import { prisma } from './db'

// Email whitelist as backup security layer
const ADMIN_EMAILS: readonly string[] = ['pirgozi1@gmail.com']

/**
 * Check if current user is admin
 * Uses BOTH DB flag AND email whitelist for double security
 */
export async function isAdmin(): Promise<boolean> {
  const session = await auth()
  
  if (!session?.user?.email) {
    return false
  }
  
  // Check email whitelist first (fast check)
  if (!ADMIN_EMAILS.includes(session.user.email)) {
    return false
  }
  
  // Then verify DB flag (authoritative source)
  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { isAdmin: true }
    })
    
    return user?.isAdmin ?? false
  } catch (error) {
    console.error('Admin check error:', error)
    return false
  }
}

/**
 * Require admin role or throw error
 * @throws {Error} If user is not admin
 */
export async function requireAdmin(): Promise<void> {
  const isAdminUser = await isAdmin()
  
  if (!isAdminUser) {
    throw new Error('Unauthorized: Admin access required')
  }
}

/**
 * Get admin user session or throw error
 */
export async function getAdminSession() {
  const session = await auth()
  
  if (!session?.user?.email) {
    throw new Error('Unauthorized: Not authenticated')
  }
  
  // Use unified isAdmin check
  const isAdminUser = await isAdmin()
  if (!isAdminUser) {
    throw new Error('Unauthorized: Admin access required')
  }
  
  return session
}