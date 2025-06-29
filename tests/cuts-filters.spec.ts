import { test, expect } from '@playwright/test';

test.describe('Cuts DataGrid Filters', () => {
  test('should filter by State=OH then Control=Public and verify table counts', async ({ page }) => {
    await page.goto('/cuts');
    // Wait for table to load
    await expect(page.getByRole('table')).toBeVisible();
    // Get initial row count
    const initialRows = await page.locator('tbody tr').count();
    // Filter by State=OH
    await page.getByLabel(/state/i).selectOption({ label: 'OH' });
    await page.waitForTimeout(500); // Wait for filter to apply
    const stateRows = await page.locator('tbody tr').count();
    expect(stateRows).toBeLessThanOrEqual(initialRows);
    // Filter by Control=Public
    await page.getByLabel(/control/i).selectOption({ label: 'Public' });
    await page.waitForTimeout(500); // Wait for filter to apply
    const filteredRows = await page.locator('tbody tr').count();
    expect(filteredRows).toBeLessThanOrEqual(stateRows);
    // Optionally, check that at least one row remains
    expect(filteredRows).toBeGreaterThan(0);
  });
}); 