import { test, expect } from '@playwright/test';

test.describe('Nexus Portal and Hubs', () => {
  test('opens Nexus Portal and triggers hub dialog', async ({ page }) => {
    await page.goto('/');

    // Wait for Nexus Portal card
    await expect(page.getByText('Nexus Portal')).toBeVisible({ timeout: 5000 });

    // Click Nexus Portal card
    await page.getByText('Nexus Portal').click();

    // NexusPortal component renders; find a hub card (e.g., Travel Intelligence) and click it
    const hubButton = page.getByRole('button', { name: /Travel Intelligence|Travel/i }).first();
    // If the hub button isn't a role=button, fallback to text
    if (!(await hubButton.count())) {
      await page.getByText('Travel Intelligence').click();
    } else {
      await hubButton.click();
    }

    // Handle dialog created by alert(...) in NexusPortal
    const dialog = await page.waitForEvent('dialog', { timeout: 3000 });
    expect(dialog.message()).toMatch(/Open.*Travel/);
    await dialog.dismiss();
  });
});

