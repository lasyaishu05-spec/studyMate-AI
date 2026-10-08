import { test, expect } from '@playwright/test';

test('signup, create notebook, create note, summarize', async ({ page }) => {
  await page.goto('/signup');
  await page.fill('[name=email]', `test-${Date.now()}@test.com`);
  await page.fill('[name=password]', 'password123');
  await page.click('button[type=submit]');

  await page.click('text=New Notebook');
  await page.fill('[name=title]', 'Biology');
  await page.click('text=Create');

  await page.click('text=New Note');
  await page.fill('[name=content]', 'Mitochondria are the powerhouse of the cell.');
  await page.click('text=Save');

  await page.click('text=Summarize');
  await expect(page.locator('[data-testid=summary]')).toBeVisible({ timeout: 10000 });
});
