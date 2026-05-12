import { expect, test } from '@playwright/test';
import { seedDemoData } from './helpers/seedDemoData.js';

test.beforeEach(async ({ page }) => {
  await seedDemoData(page);
  await page.goto('/financial-tracker/');
});

test('dashboard shows savings-focused demo summary', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'Your financial position' })).toBeVisible();
  await expect(page.getByText('Max cash now')).toBeVisible();
  await expect(page.getByText('£1,604.72').first()).toBeVisible();
  await expect(page.getByText('Monthly savings capacity')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'House deposit' })).toBeVisible();
  await expect(page.getByText('F-Type wheels refurbished')).toBeVisible();
});

test('primary pages render with demo data', async ({ page }) => {
  const pages = [
    ['Transactions', 'Rent contribution'],
    ['Budgets', 'Housing'],
    ['Plan', 'Sell XK8'],
    ['Goals', 'Emergency fund'],
    ['Current Finances', 'MoneyBox'],
    ['Reports', 'Financial Reports'],
    ['Settings', 'Data Management'],
  ];

  const nav = page.getByRole('navigation', { name: 'Primary navigation' });

  for (const [navName, expectedText] of pages) {
    await nav.getByRole('button', { name: navName, exact: true }).click();
    await expect(page.getByText(expectedText).first()).toBeVisible();
  }
});

test('monthly savings capacity card opens recurring management', async ({ page }) => {
  await page.getByRole('button', { name: 'Review recurring income and outgoings' }).click();
  await expect(page.getByRole('heading', { name: 'Add Recurring Item' })).toBeVisible();
});

test('financial snapshot demo values calculate current cash correctly', async ({ page }) => {
  const nav = page.getByRole('navigation', { name: 'Primary navigation' });
  await nav.getByRole('button', { name: 'Current Finances', exact: true }).click();
  await expect(page.getByText('£1,604.72').first()).toBeVisible();
  await expect(page.getByText('£31,147.72').first()).toBeVisible();
});
