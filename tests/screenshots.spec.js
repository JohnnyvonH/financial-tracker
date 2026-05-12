import { test } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import { seedDemoData } from './helpers/seedDemoData.js';

const screenshotDir = 'docs/screenshots';

const pages = [
  ['dashboard', 'Dashboard'],
  ['transactions', 'Transactions'],
  ['budgets', 'Budgets'],
  ['plan', 'Plan'],
  ['goals', 'Goals'],
  ['current-finances', 'Current Finances'],
  ['reports', 'Reports'],
  ['settings', 'Settings'],
];

test.beforeEach(async ({ page }) => {
  await seedDemoData(page);
  await mkdir(screenshotDir, { recursive: true });
  await page.goto('/financial-tracker/');
});

for (const [fileName, navName] of pages) {
  test(`capture ${navName}`, async ({ page }) => {
    if (navName !== 'Dashboard') {
      await page
        .getByRole('navigation', { name: 'Primary navigation' })
        .getByRole('button', { name: navName, exact: true })
        .click();
    }

    await page.screenshot({
      path: `${screenshotDir}/${fileName}.png`,
      fullPage: true,
    });
  });
}
