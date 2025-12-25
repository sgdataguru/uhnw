import { test, expect, type Page } from '@playwright/test';

const RM_USER = 'rm_user@nuvama.com';
const EXEC_USER = 'exec_user@nuvama.com';
const PASSWORD = 'cockpit2025';

const loginAs = async (page: Page, email: string) => {
  await page.goto('/login');
  await page.getByLabel('Email Address').fill(email);
  await page.getByLabel('Password').fill(PASSWORD);
  await page.getByRole('button', { name: 'Sign in' }).click();
};

test.beforeEach(async ({ page }) => {
  await page.goto('/login');
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
});

test('RM login redirects to /rm', async ({ page }) => {
  await loginAs(page, RM_USER);
  await expect(page).toHaveURL(/\/rm$/);
});

test('Executive login redirects to /executive', async ({ page }) => {
  await loginAs(page, EXEC_USER);
  await expect(page).toHaveURL(/\/executive$/);
});

test('RM cannot access executive dashboard', async ({ page }) => {
  await loginAs(page, RM_USER);
  await page.goto('/executive');
  await expect(page).toHaveURL(/\/rm/);
});
