import { expect, test } from '@playwright/test';
import { mockApi } from './support/mock-api';

test('neprihlásený používateľ je presmerovaný na prihlásenie', async ({ page }) => {
  await mockApi(page);

  await page.goto('/');

  await expect(page).toHaveURL(/\/login/);
  await expect(page.getByText('Prihlásenie')).toBeVisible();
  await expect(page.locator('input[name="username"]')).toBeVisible();
  await expect(page.locator('input[name="password"]')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Prihlásiť sa' })).toBeVisible();
});
