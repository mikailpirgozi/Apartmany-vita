import { test, expect } from '@playwright/test'

test.describe('Apartment Search Flow', () => {
  test('should perform complete search flow', async ({ page }) => {
    await page.goto('/')
    
    // Fill search form
    await page.fill('[data-testid="search-checkin"]', '2024-12-01')
    await page.fill('[data-testid="search-checkout"]', '2024-12-03')
    
    // Select guests
    await page.click('[data-testid="search-guests"]')
    await page.click('[data-testid="guests-adults-plus"]')
    await page.click('[data-testid="guests-adults-plus"]') // 4 adults total
    
    // Submit search
    await page.click('[data-testid="search-button"]')
    
    // Should navigate to apartments page with search params
    await expect(page).toHaveURL(/\/apartments\?.*checkin=2024-12-01.*checkout=2024-12-03.*guests=4/)
    
    // Check search results
    await expect(page.locator('[data-testid="search-results-header"]')).toContainText('4 hostia')
    await expect(page.locator('[data-testid="search-results-dates"]')).toContainText('1. dec - 3. dec 2024')
  })

  test('should validate search form', async ({ page }) => {
    await page.goto('/')
    
    // Try to search without dates
    await page.click('[data-testid="search-button"]')
    
    // Should show validation errors
    await expect(page.locator('[data-testid="checkin-error"]')).toContainText('Vyberte dátum príchodu')
    await expect(page.locator('[data-testid="checkout-error"]')).toContainText('Vyberte dátum odchodu')
  })

  test('should validate date logic', async ({ page }) => {
    await page.goto('/')
    
    // Set checkout before checkin
    await page.fill('[data-testid="search-checkin"]', '2024-12-05')
    await page.fill('[data-testid="search-checkout"]', '2024-12-03')
    
    await page.click('[data-testid="search-button"]')
    
    // Should show date validation error
    await expect(page.locator('[data-testid="date-error"]')).toContainText('Dátum odchodu musí byť po dátume príchodu')
  })

  test('should handle guest selection', async ({ page }) => {
    await page.goto('/')
    
    // Open guest selector
    await page.click('[data-testid="search-guests"]')
    
    // Check initial state
    await expect(page.locator('[data-testid="guests-adults-count"]')).toContainText('2')
    await expect(page.locator('[data-testid="guests-children-count"]')).toContainText('0')
    
    // Add adults
    await page.click('[data-testid="guests-adults-plus"]')
    await expect(page.locator('[data-testid="guests-adults-count"]')).toContainText('3')
    
    // Add children
    await page.click('[data-testid="guests-children-plus"]')
    await expect(page.locator('[data-testid="guests-children-count"]')).toContainText('1')
    
    // Remove adult
    await page.click('[data-testid="guests-adults-minus"]')
    await expect(page.locator('[data-testid="guests-adults-count"]')).toContainText('2')
    
    // Check minimum constraints
    await page.click('[data-testid="guests-adults-minus"]')
    await page.click('[data-testid="guests-adults-minus"]')
    await expect(page.locator('[data-testid="guests-adults-count"]')).toContainText('1') // Should not go below 1
  })

  test('should filter apartments on search page', async ({ page }) => {
    await page.goto('/apartments')
    
    // Wait for apartments to load
    await page.waitForSelector('[data-testid="apartment-card"]')
    
    // Apply price filter
    await page.click('[data-testid="filter-price"]')
    await page.fill('[data-testid="price-min"]', '50')
    await page.fill('[data-testid="price-max"]', '80')
    await page.click('[data-testid="apply-filters"]')
    
    // Check filtered results
    const priceElements = page.locator('[data-testid="apartment-price"]')
    const count = await priceElements.count()
    
    for (let i = 0; i < count; i++) {
      const priceText = await priceElements.nth(i).textContent()
      const price = parseInt(priceText?.replace('€', '') || '0')
      expect(price).toBeGreaterThanOrEqual(50)
      expect(price).toBeLessThanOrEqual(80)
    }
  })

  test('should show apartment details', async ({ page }) => {
    await page.goto('/apartments')
    
    // Wait for apartments to load
    await page.waitForSelector('[data-testid="apartment-card"]')
    
    // Click on first apartment
    await page.click('[data-testid="apartment-card"]:first-child')
    
    // Should navigate to apartment detail page
    await expect(page).toHaveURL(/\/apartments\/[^\/]+/)
    
    // Check apartment details are displayed
    await expect(page.locator('[data-testid="apartment-name"]')).toBeVisible()
    await expect(page.locator('[data-testid="apartment-description"]')).toBeVisible()
    await expect(page.locator('[data-testid="apartment-gallery"]')).toBeVisible()
    await expect(page.locator('[data-testid="apartment-amenities"]')).toBeVisible()
    await expect(page.locator('[data-testid="booking-widget"]')).toBeVisible()
  })

  test('should handle no search results', async ({ page }) => {
    await page.goto('/apartments')
    
    // Apply very restrictive filters
    await page.click('[data-testid="filter-price"]')
    await page.fill('[data-testid="price-min"]', '1000')
    await page.fill('[data-testid="price-max"]', '2000')
    await page.click('[data-testid="apply-filters"]')
    
    // Should show no results message
    await expect(page.locator('[data-testid="no-results"]')).toContainText('Žiadne apartmány nevyhovujú vašim kritériám')
    await expect(page.locator('[data-testid="clear-filters"]')).toBeVisible()
    
    // Clear filters should work
    await page.click('[data-testid="clear-filters"]')
    await page.waitForSelector('[data-testid="apartment-card"]')
    await expect(page.locator('[data-testid="apartment-card"]')).toHaveCount(4)
  })
})
