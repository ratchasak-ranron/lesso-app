import { test, expect } from '@playwright/test';

test.describe('Lesso bootstrap smoke', () => {
  test('renders home with greeting and health card', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('heading', { level: 2 })).toBeVisible();
    await expect(page.getByTestId('health-status')).toContainText('ok');
  });

  test('lang toggle switches text', async ({ page }) => {
    await page.goto('/');
    const toggle = page.getByRole('button', { name: /english|ภาษาไทย/i });
    const before = await toggle.textContent();
    await toggle.click();
    const after = await toggle.textContent();
    expect(before).not.toEqual(after);
  });

  test('dev toolbar visible in dev', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('dev-toolbar')).toBeVisible();
  });
});
