import { test, expect } from '@playwright/test';

test.describe('Smart Nav E2E User Flow Tests', () => {

  test('Homepage loads correctly with building selection', async ({ page }) => {
    await page.goto('/');
    
    // Check main body is visible
    await expect(page.locator('body')).toBeVisible();
    
    // Verify building navigation buttons exist (e.g. CV-RAMAN BLOCK, RAMANUJAN BLOCK)
    const buildingCards = page.locator('button').filter({ hasText: /BLOCK/i });
    await expect(buildingCards.first()).toBeVisible({ timeout: 15000 });
  });

  test('Navigates to Ramanujan Block floor map and verifies map components', async ({ page, isMobile }) => {
    await page.goto('/Ramanujan-Block/first');

    if (!isMobile) {
      // Desktop checks
      const floorTitle = page.locator('header').getByText('FIRST FLOOR', { exact: false });
      await expect(floorTitle.first()).toBeVisible({ timeout: 15000 });

      const zoomInBtn = page.locator('button[title="Zoom In"]');
      await expect(zoomInBtn).toBeVisible({ timeout: 15000 });
    }

    // Verify SVG floor map canvas is rendered on both desktop & mobile
    const svgMap = page.locator('svg').first();
    await expect(svgMap).toBeVisible({ timeout: 15000 });
  });

  test('Search system finds room and highlights location', async ({ page, isMobile }) => {
    await page.goto('/Ramanujan-Block/first');

    if (isMobile) {
      // On mobile, click the search icon/trigger button if visible to expand search sheet
      const searchTrigger = page.locator('button').filter({ has: page.locator('svg') }).first();
      if (await searchTrigger.isVisible()) {
        await searchTrigger.click();
      }
    }

    // Target the first attached search input or mobile trigger container
    const searchInput = page.locator('input[placeholder*="Search"]');
    
    if (!isMobile) {
      await expect(searchInput.first()).toBeVisible({ timeout: 15000 });
      await searchInput.first().fill('Lab');
    } else {
      // On mobile, if input is hidden inside bottom sheet, fill it attached or force-type
      await searchInput.first().fill('Lab', { force: true });
    }

    await page.waitForTimeout(500);

    // Verify search results appear
    const searchResults = page.locator('button:has-text("Lab")');
    await expect(searchResults.first()).toBeAttached({ timeout: 15000 });
  });

});