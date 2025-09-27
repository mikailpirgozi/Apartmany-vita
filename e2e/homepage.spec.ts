import { test, expect } from '@playwright/test'

test.describe('Homepage', () => {
  test('should load homepage successfully', async ({ page }) => {
    await page.goto('/')
    
    // Check if the page loads
    await expect(page).toHaveTitle(/Apartmány Vita/)
    
    // Check hero section
    await expect(page.locator('h1')).toContainText('Apartmány Vita')
    await expect(page.locator('[data-testid="hero-description"]')).toBeVisible()
  })

  test('should display apartment search widget', async ({ page }) => {
    await page.goto('/')
    
    // Check search form elements
    await expect(page.locator('[data-testid="search-checkin"]')).toBeVisible()
    await expect(page.locator('[data-testid="search-checkout"]')).toBeVisible()
    await expect(page.locator('[data-testid="search-guests"]')).toBeVisible()
    await expect(page.locator('[data-testid="search-button"]')).toBeVisible()
  })

  test('should show apartment preview grid', async ({ page }) => {
    await page.goto('/')
    
    // Wait for apartments to load
    await page.waitForSelector('[data-testid="apartment-card"]')
    
    // Check if apartments are displayed
    const apartmentCards = page.locator('[data-testid="apartment-card"]')
    await expect(apartmentCards).toHaveCount(4) // 4 apartments in preview
    
    // Check first apartment card content
    const firstCard = apartmentCards.first()
    await expect(firstCard.locator('h3')).toBeVisible()
    await expect(firstCard.locator('[data-testid="apartment-price"]')).toBeVisible()
    await expect(firstCard.locator('[data-testid="apartment-size"]')).toBeVisible()
  })

  test('should navigate to apartments page when clicking "Všetky apartmány"', async ({ page }) => {
    await page.goto('/')
    
    await page.click('[data-testid="view-all-apartments"]')
    await expect(page).toHaveURL('/apartments')
  })

  test('should display features section', async ({ page }) => {
    await page.goto('/')
    
    // Check features section
    await expect(page.locator('[data-testid="features-section"]')).toBeVisible()
    
    // Check individual features
    await expect(page.locator('[data-testid="feature-location"]')).toBeVisible()
    await expect(page.locator('[data-testid="feature-amenities"]')).toBeVisible()
    await expect(page.locator('[data-testid="feature-access"]')).toBeVisible()
  })

  test('should have working navigation menu', async ({ page }) => {
    await page.goto('/')
    
    // Check navigation links
    await expect(page.locator('[data-testid="nav-apartments"]')).toBeVisible()
    await expect(page.locator('[data-testid="nav-contact"]')).toBeVisible()
    
    // Test navigation
    await page.click('[data-testid="nav-apartments"]')
    await expect(page).toHaveURL('/apartments')
  })

  test('should display footer with contact information', async ({ page }) => {
    await page.goto('/')
    
    // Scroll to footer
    await page.locator('footer').scrollIntoViewIfNeeded()
    
    // Check footer content
    await expect(page.locator('footer')).toBeVisible()
    await expect(page.locator('[data-testid="footer-contact"]')).toBeVisible()
    await expect(page.locator('[data-testid="footer-address"]')).toBeVisible()
  })

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    
    // Check mobile navigation
    await expect(page.locator('[data-testid="mobile-menu-button"]')).toBeVisible()
    
    // Check apartment grid is responsive
    const apartmentCards = page.locator('[data-testid="apartment-card"]')
    await expect(apartmentCards.first()).toBeVisible()
    
    // Check search widget is responsive
    await expect(page.locator('[data-testid="search-widget"]')).toBeVisible()
  })
})
