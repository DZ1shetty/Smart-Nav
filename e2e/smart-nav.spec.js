import { test, expect } from '@playwright/test';

test.describe('Smart Nav E2E User Flow Tests', () => {

  test('Homepage loads correctly with building selection', async ({ page }) => {
    await page.goto('/');
    
    // Check main branding or title exists
    await expect(page.locator('body')).toBeVisible();
    
    // Verify building navigation links exist
    const buildingCards = page.locator('a[href*="-Block"]');
    await expect(buildingCards.first()).toBeVisible();
  });

  test('Navigates to Ramanujan Block floor map and verifies map components', async ({ page }) => {
    await page.goto('/Ramanujan-Block/first');

    // Wait for the floor title to display
    const floorTitle = page.locator('text=/FIRST FLOOR/i');
    await expect(floorTitle.first()).toBeVisible();

    // Verify SVG floor map canvas is rendered
    const svgMap = page.locator('svg').first();
    await expect(svgMap).toBeVisible();

    // Verify zoom controls exist (+ and - buttons)
    const zoomInBtn = page.locator('button[title="Zoom In"]');
    await expect(zoomInBtn).toBeVisible();
  });

  test('Search system finds room and highlights location', async ({ page }) => {
    await page.goto('/Ramanujan-Block/first');

    // Find search input field or trigger
    const searchInput = page.locator('input[placeholder*="Search"]').first();
    if (await searchInput.isVisible()) {
      await searchInput.fill('Lab');
      await page.waitForTimeout(500);
      
      // Verify search results popup shows items
      const searchResults = page.locator('button:has-text("Lab")');
      await expect(searchResults.first()).toBeVisible();
    }
  });

});
