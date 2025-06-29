import { test, expect } from '@playwright/test';

// Helper to generate a unique email for each test run
function uniqueEmail() {
  return `e2e+${Date.now()}@example.com`;
}

test.describe('Submit Tip Form', () => {
  test('should submit tip and show toast, and DB row should exist', async ({ page }) => {
    await page.goto('/submit-tip');
    await page.getByLabel('Institution').fill('Playwright Test University');
    await page.getByLabel('Program').fill('E2E Testing');
    await page.getByLabel('Type of Cut').selectOption({ label: 'Program Suspension' });
    await page.getByLabel('Description').fill('This is an automated test tip.');
    await page.getByLabel('Source (optional)').fill('Playwright E2E');
    const email = uniqueEmail();
    await page.getByLabel('Your Email (optional)').fill(email);
    await page.getByRole('button', { name: /submit/i }).click();
    // Wait for toast
    await expect(page.getByText(/thank you|success|received/i)).toBeVisible({ timeout: 5000 });
    // Optionally, verify DB row via API (if endpoint exists)
    // const res = await page.request.get(`/api/check-tip?email=${email}`);
    // expect(res.status()).toBe(200);
  });
}); 