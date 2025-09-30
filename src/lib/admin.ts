/**
 * Admin authorization utilities
 */

import { auth } from './auth'

const ADMIN_EMAILS = ['pirgozi1@gmail.com']

/**
 * Check if current user is admin
 */
export async function isAdmin(): Promise<boolean> {
  const session = await auth()
  
  if (!session?.user?.email) {
    return false
  }
  
  return ADMIN_EMAILS.includes(session.user.email)
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
  
  if (!ADMIN_EMAILS.includes(session.user.email)) {
    throw new Error('Unauthorized: Admin access required')
  }
  
  return session
}

