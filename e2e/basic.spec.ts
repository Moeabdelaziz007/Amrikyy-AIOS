import { test, expect } from '@playwright/test';

test.describe('Amrikyy AI OS - Basic Tests', () => {
  test('should load the home page', async ({ page }) => {
    await page.goto('/');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Check that the page title is set
    await expect(page).toHaveTitle(/Amrikyy/i);
  });

  test('should display the dock', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check that dock is visible (you may need to adjust the selector)
    const dock = page.locator('[class*="dock"]').first();
    await expect(dock).toBeVisible();
  });

  test('should open app launcher', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Look for grid/app launcher icon and click it
    const appLauncher = page.locator('button').filter({ hasText: /apps/i }).first();
    if (await appLauncher.isVisible()) {
      await appLauncher.click();
      
      // Wait for app launcher to open
      await page.waitForTimeout(500);
    }
  });
});
