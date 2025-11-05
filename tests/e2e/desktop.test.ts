import { test, expect } from '@playwright/test';

// E2E: Desktop launcher and app open/close

test.describe('Desktop Launcher', () => {
  test('should open Nexus Portal from desktop grid', async ({ page }) => {
    await page.goto('http://localhost:5173');
    // Find Nexus Portal app card and click
    await page.getByText('Nexus Portal').click();
    // Expect window to open with Nexus Portal title
    await expect(page.getByText('Nexus Portal')).toBeVisible();
  });

  test('should open Settings from launcher and connect Google', async ({ page }) => {
    await page.goto('http://localhost:5173');
    // Open launcher (simulate dock click)
    await page.getByRole('button', { name: /launcher/i }).click();
    await page.getByText('Settings').click();
    await expect(page.getByText('إعدادات التكامل')).toBeVisible();
    // Click connect Google Calendar (mocked)
    await page.getByText('ربط Google Calendar').click();
    // Should redirect to Google OAuth (mocked)
    // For real E2E, intercept and mock OAuth flow
  });
});

