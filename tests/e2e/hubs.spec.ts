import { test, expect } from '@playwright/test';

const HUBS = [
  { title: 'Creative Hub', text: 'Creative Hub' },
  { title: 'DevLab', text: 'DevLab' },
  { title: 'Travel Intelligence', text: 'Travel Intelligence' },
  { title: 'Business Suite', text: 'Business Suite' },
  { title: 'Cognition Hub', text: 'Cognition Hub' },
  { title: 'Conversational Core', text: 'Conversational Core' },
  { title: 'Insight Lab', text: 'Insight Lab' },
  { title: 'System Center', text: 'System Center' },
  { title: 'Gemini Connect', text: 'Gemini Connect' },
];

test.describe('Komabi Hubs smoke tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('Nexus Portal')).toBeVisible();
    await page.getByText('Nexus Portal').click();
  });

  for (const hub of HUBS) {
    test(`open hub: ${hub.title}`, async ({ page }) => {
      // Click hub card by text
      await page.getByText(hub.text).click();
      // The NexusPortal currently shows an alert with hub id — intercept dialog
      const dialog = await page.waitForEvent('dialog', { timeout: 3000 });
      expect(dialog.message()).toContain('Open');
      await dialog.dismiss();
    });
  }
});

