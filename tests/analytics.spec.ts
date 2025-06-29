import { test, expect } from '@playwright/test';

test.describe('Analytics Page', () => {
  test('should render all four analytics charts', async ({ page }) => {
    await page.goto('/analytics');
    // Wait for all chart containers to appear
    await expect(page.getByTestId('line-chart')).toBeVisible();
    await expect(page.getByTestId('bar-chart')).toBeVisible();
    await expect(page.getByTestId('choropleth-map')).toBeVisible();
    await expect(page.getByTestId('donut-chart')).toBeVisible();
  });
}); 