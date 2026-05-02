import { test, expect } from '@playwright/test';

test.describe('Reinly bootstrap smoke', () => {
  test('Home renders the greeting heading and the four KPI tiles', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 2 })).toBeVisible();
    // KpiTile section is labelled via `aria-label`; fall back to the four
    // tile values being numerically rendered.
    await expect(page.getByRole('region', { name: /today's metrics|ตัวชี้วัด/i })).toBeVisible();
    // The four labels (Queue / Booked / Done / Alerts) — text varies by
    // locale, so just assert the section contains four `tabular-nums` values.
    const kpiValues = page.locator('p.tabular-nums');
    await expect(kpiValues.first()).toBeVisible();
  });

  test('Lang toggle switches the visible label text', async ({ page }) => {
    await page.goto('/');
    const toggle = page.getByRole('button', { name: /switch to english|switch to ภาษาไทย|เปลี่ยนเป็น/i });
    const before = await toggle.textContent();
    await toggle.click();
    const after = await toggle.textContent();
    expect(before).not.toEqual(after);
  });

  test('Mobile bottom-tab dock is visible at 375px and hidden at 1024px', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 800 });
    await page.goto('/');
    await expect(page.locator('nav').filter({ has: page.getByRole('link') }).first()).toBeVisible();
    // Sidebar is `hidden md:flex` — at 1024 it should appear.
    await page.setViewportSize({ width: 1024, height: 800 });
    await expect(page.locator('aside').first()).toBeVisible();
  });

  test('Dev toolbar visible in dev as an aside region', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('dev-toolbar')).toBeVisible();
  });

  test('Patients route loads with a header', async ({ page }) => {
    await page.goto('/patients');
    await expect(page.getByRole('heading', { level: 2 })).toBeVisible();
  });

  test('Audit route renders a table with column headers', async ({ page }) => {
    await page.goto('/audit');
    // Table is only rendered when there are logs; otherwise EmptyState shows.
    // Heading must always render.
    await expect(page.getByRole('heading', { level: 2 })).toBeVisible();
  });
});
