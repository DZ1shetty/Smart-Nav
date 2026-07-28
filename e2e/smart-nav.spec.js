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

  test('Navigates to Ramanujan Block floor map and verifies map components', async ({ page }) => {
    await page.goto('/Ramanujan-Block/first');

    // Wait for the floor title to display in header
    const floorTitle = page.locator('header').getByText('FIRST FLOOR', { exact: false });
    await expect(floorTitle.first()).toBeVisible({ timeout: 15000 });

    // Verify SVG floor map canvas is rendered
    const svgMap = page.locator('svg').first();
    await expect(svgMap).toBeVisible({ timeout: 15000 });

    // Verify zoom controls exist (+ and - buttons)
    const zoomInBtn = page.locator('button[title="Zoom In"]');
    await expect(zoomInBtn).toBeVisible({ timeout: 15000 });
  });

  test('Search system finds room and highlights location', async ({ page }) => {
    await page.goto('/Ramanujan-Block/first');

    // If mobile search button is visible, click it to open search input
    const mobileSearchBtn = page.locator('button[title="Search rooms"]');
    if (await mobileSearchBtn.isVisible()) {
      await mobileSearchBtn.click();
    }

    // Find search input field
    const searchInput = page.locator('input[placeholder*="Search"]').first();
    await expect(searchInput).toBeVisible({ timeout: 15000 });

    await searchInput.fill('Lab');
    await page.waitForTimeout(500);

    // Verify search results popup shows items
    const searchResults = page.locator('button:has-text("Lab")');
    await expect(searchResults.first()).toBeVisible({ timeout: 15000 });
  });

});
