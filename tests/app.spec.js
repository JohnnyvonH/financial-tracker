import { expect, test } from '@playwright/test';
import { seedDemoData } from './helpers/seedDemoData.js';

test.beforeEach(async ({ page }) => {
  await seedDemoData(page);
  await page.goto('/financial-tracker/');
});

test('reports show net worth trend from current finance snapshots', async ({ page }) => {
  const nav = page.getByRole('navigation', { name: 'Primary navigation' });
  await nav.getByRole('button', { name: 'Reports', exact: true }).click();

  await expect(page.getByRole('heading', { name: 'Net worth trend' })).toBeVisible();
  await expect(page.getByText('4 snapshots from Feb 26 to May 26')).toBeVisible();
  await expect(page.getByText('Latest available assets')).toBeVisible();
  await expect(page.getByText('House deposit access').first()).toBeVisible();
  await expect(page.getByRole('img', { name: 'Net worth trend chart' })).toBeVisible();
});

test('current finances template can add a custom bank and card', async ({ page }) => {
  const nav = page.getByRole('navigation', { name: 'Primary navigation' });
  await nav.getByRole('button', { name: 'Current Finances', exact: true }).click();

  await page.getByRole('button', { name: 'Edit template' }).click();
  await page.getByRole('button', { name: 'Add section' }).click();
  await page.getByLabel('Section name').last().fill('Custom accounts');
  await page.getByLabel('Section help text').last().fill('Accounts created by the user.');
  await page.getByRole('button', { name: 'Add entry' }).last().click();
  await page.getByLabel('Entry name').last().fill('Chase current account');
  await page.getByRole('button', { name: 'Add entry' }).last().click();
  await page.getByLabel('Entry name').last().fill('Barclaycard');
  await page.getByLabel('Calculation type').last().selectOption('liability');
  await page.getByRole('button', { name: 'Save template' }).click();

  await expect(page.getByLabel('Chase current account')).toBeVisible();
  await expect(page.getByLabel('Barclaycard')).toBeVisible();

  await page.getByLabel('Chase current account').fill('1000');
  await page.getByLabel('Barclaycard').fill('250');
  await page.getByLabel('Notes').fill('Custom accounts smoke test');
  await page.getByRole('button', { name: 'Save financial snapshot' }).click();

  await expect(page.getByText('Custom accounts smoke test')).toBeVisible();
  await expect(page.getByText('Chase current account', { exact: true }).first()).toBeVisible();
  await expect(page.getByText('Barclaycard', { exact: true }).first()).toBeVisible();
  await expect(page.getByText('750.00').first()).toBeVisible();
});

test('dashboard shows savings-focused demo summary', async ({ page }) => {
  await expect(page.getByRole('heading', { name: "Today's money picture" })).toBeVisible();
  await expect(page.getByText('Max cash now')).toBeVisible();
  await expect(page.getByText('£1,604.72').first()).toBeVisible();
  await expect(page.getByText('Monthly capacity')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Needs attention' })).toBeVisible();
  await expect(page.getByText('F-Type wheels refurbished')).toBeVisible();
});

test('dashboard softens funding gap when monthly capacity covers it', async ({ page }) => {
  await seedDemoData(page, {
    planningItems: [
      {
        id: 'plan-covered',
        title: 'Covered service bill',
        type: 'expense',
        targetAmount: 500,
        savedAmount: 0,
        expectedValue: 0,
        dueDate: '2026-06-15',
        priority: 'medium',
        status: 'planned',
        notes: '',
      },
    ],
  });
  await page.goto('/financial-tracker/');

  await expect(page.getByRole('heading', { name: 'Plan fits this month' })).toBeVisible();
  await expect(page.getByText(/fits within your monthly capacity/)).toBeVisible();
});

test('primary pages render with demo data', async ({ page }) => {
  const pages = [
    ['Transactions', 'Monthly paycheck'],
    ['Budgets', 'Housing'],
    ['Recurring', 'Monthly paycheck'],
    ['Plan', 'Sell XK8'],
    ['Goals', 'Emergency fund'],
    ['Current Finances', 'MoneyBox'],
    ['Reports', 'Monthly reports'],
    ['Settings', 'Data Management'],
  ];

  const nav = page.getByRole('navigation', { name: 'Primary navigation' });

  for (const [navName, expectedText] of pages) {
    await nav.getByRole('button', { name: navName, exact: true }).click();
    await expect(page.getByText(expectedText).first()).toBeVisible();
  }
});

test('transaction entry is reachable from quick actions', async ({ page }) => {
  await page.getByRole('button', { name: 'Add Transaction' }).click();

  await expect(page.locator('h1', { hasText: 'Add Transaction' })).toBeVisible();
  await expect(page.getByPlaceholder('0.00')).toBeVisible();
});

test('monthly savings capacity card opens recurring management', async ({ page }) => {
  await page.getByRole('button', { name: /Recurring payments/ }).click();
  await expect(page.getByRole('heading', { name: 'Recurring payments' })).toBeVisible();
});

test('recurring payments can be edited from the management page', async ({ page }) => {
  const nav = page.getByRole('navigation', { name: 'Primary navigation' });
  await nav.getByRole('button', { name: 'Recurring', exact: true }).click();

  await page.getByRole('button', { name: 'Edit Streaming subscriptions' }).click();
  await page.getByLabel('Amount').fill('49.99');
  await page.getByRole('button', { name: 'Save changes' }).click();

  await expect(page.getByText('Streaming subscriptions')).toBeVisible();
  await expect(page.getByText(/49\.99/)).toBeVisible();
});

test('plan asset sales use one value and existing plans can be edited', async ({ page }) => {
  const nav = page.getByRole('navigation', { name: 'Primary navigation' });
  await nav.getByRole('button', { name: 'Plan', exact: true }).click();

  await page.getByRole('button', { name: 'Edit Sell XK8' }).click();
  await page.getByLabel('Value').fill('4000');
  await page.getByRole('button', { name: 'Save changes' }).click();

  const sellCard = page.locator('.planning-card').filter({ hasText: 'Sell XK8' });
  await expect(sellCard.getByText('Net help')).toBeVisible();
  await expect(sellCard.getByText(/4,000\.00/)).toHaveCount(2);
  await expect(page.getByLabel('Expected sale value')).toHaveCount(0);
});

test('empty goals page has an add goal button', async ({ page }) => {
  await seedDemoData(page, { goals: [] });
  await page.goto('/financial-tracker/');

  const nav = page.getByRole('navigation', { name: 'Primary navigation' });
  await nav.getByRole('button', { name: 'Goals', exact: true }).click();
  await page.getByRole('button', { name: 'Add goal', exact: true }).click();

  await expect(page.getByRole('heading', { name: 'Add Savings Goal' })).toBeVisible();
});

test('savings goals can be updated by entering a current amount', async ({ page }) => {
  const nav = page.getByRole('navigation', { name: 'Primary navigation' });
  await nav.getByRole('button', { name: 'Goals', exact: true }).click();

  const emergencyGoal = page.locator('.goal-card').filter({ hasText: 'Emergency fund' });
  await emergencyGoal.getByTitle('Add 100').click();
  await expect(emergencyGoal.getByLabel('Current saved')).toHaveValue('6300');

  await emergencyGoal.getByLabel('Current saved').fill('8000');
  await emergencyGoal.getByLabel('Current saved').press('Enter');

  await expect(emergencyGoal.getByText(/8,000\.00/)).toBeVisible();
  await expect(emergencyGoal.getByText(/4,000\.00 remaining/)).toBeVisible();
});

test('financial snapshot demo values calculate current cash correctly', async ({ page }) => {
  const nav = page.getByRole('navigation', { name: 'Primary navigation' });
  await nav.getByRole('button', { name: 'Current Finances', exact: true }).click();
  await expect(page.getByText('£1,604.72').first()).toBeVisible();
  await expect(page.getByText('£32,752.44').first()).toBeVisible();
});
