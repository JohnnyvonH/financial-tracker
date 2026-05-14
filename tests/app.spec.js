import { expect, test } from '@playwright/test';
import path from 'node:path';
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
  await expect(page.getByRole('heading', { name: 'Planning exposure' })).toBeVisible();
  await expect(page.getByText('Upcoming costs after saved funds')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Monthly planning basis' })).toBeVisible();
  await expect(page.getByText('Recurring income', { exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Insight radar' })).toBeVisible();
  await expect(page.getByText('Upcoming plan is funded')).toBeVisible();
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

test('current finances can import snapshot history from CSV', async ({ page }) => {
  const nav = page.getByRole('navigation', { name: 'Primary navigation' });
  await nav.getByRole('button', { name: 'Current Finances', exact: true }).click();

  const fileChooserPromise = page.waitForEvent('filechooser');
  await page.getByRole('button', { name: 'Import CSV' }).click();
  const fileChooser = await fileChooserPromise;
  await fileChooser.setFiles(path.resolve('tests/fixtures/current-finances-import.csv'));

  await expect(page.getByText('2 rows ready')).toBeVisible();
  await expect(page.getByText('2026-06-12')).toBeVisible();

  await page.getByRole('button', { name: 'Save imported snapshots' }).click();

  await expect(page.getByText('Imported July snapshot')).toBeVisible();
  await expect(page.getByText('Imported June snapshot')).toBeVisible();
  await expect(page.getByRole('cell', { name: '2026-07-12', exact: true })).toBeVisible();
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
    ['Budgets', 'Monthly budget planner'],
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

test('budgets page explains monthly flow and next action', async ({ page }) => {
  const nav = page.getByRole('navigation', { name: 'Primary navigation' });
  await nav.getByRole('button', { name: 'Budgets', exact: true }).click();

  await expect(page.getByRole('heading', { name: 'Monthly budget planner' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Monthly flow' })).toBeVisible();
  await expect(page.getByLabel('Monthly budget calculation')).toContainText('Money in');
  await expect(page.getByRole('heading', { name: 'Outgoing categories' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Next best action' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Monthly recurring items' })).toBeVisible();
  await expect(page.getByLabel('Monthly recurring items')).toContainText('Salary');
  await expect(page.getByRole('heading', { name: 'Category limits' })).toBeVisible();
  await expect(page.getByText('Snapshot commitments')).toHaveCount(0);
});

test('destructive settings actions use app confirmation dialog', async ({ page }) => {
  const nav = page.getByRole('navigation', { name: 'Primary navigation' });
  await nav.getByRole('button', { name: 'Settings', exact: true }).click();

  await page.getByRole('button', { name: 'Clear All Data' }).click();
  await expect(page.getByRole('dialog', { name: 'Clear all local data?' })).toBeVisible();
  await page.getByRole('button', { name: 'Cancel' }).click();
  await expect(page.getByRole('dialog', { name: 'Clear all local data?' })).toHaveCount(0);
});

test('monthly savings capacity card opens recurring management', async ({ page }) => {
  await page.getByRole('button', { name: /Recurring payments/ }).click();
  await expect(page.getByRole('heading', { name: 'Recurring payments' })).toBeVisible();
});

test('recurring payments can be edited from the management page', async ({ page }) => {
  const nav = page.getByRole('navigation', { name: 'Primary navigation' });
  await nav.getByRole('button', { name: 'Recurring', exact: true }).click();

  await expect(page.getByRole('heading', { name: 'Upcoming recurring dates' })).toBeVisible();
  await expect(page.getByLabel('Upcoming recurring dates')).toContainText('Monthly paycheck');

  await page.getByRole('button', { name: 'Edit Streaming subscriptions' }).click();
  await page.getByLabel('Amount').fill('49.99');
  await page.getByRole('button', { name: 'Save changes' }).click();

  const streamingRow = page.locator('.recurring-row').filter({ hasText: 'Streaming subscriptions' });
  await expect(streamingRow).toBeVisible();
  await expect(streamingRow.getByText(/49\.99/)).toBeVisible();
});

test('plan asset sales use one value and existing plans can be edited', async ({ page }) => {
  const nav = page.getByRole('navigation', { name: 'Primary navigation' });
  await nav.getByRole('button', { name: 'Plan', exact: true }).click();

  await expect(page.getByRole('heading', { name: 'Planning timeline' })).toBeVisible();
  await expect(page.locator('.planning-timeline-panel')).toContainText('Car service and MOT');
  await expect(page.locator('.planning-timeline-panel')).toContainText('Undated furniture wish list');

  await page.getByRole('button', { name: 'Edit Sell XK8' }).click();
  await page.getByLabel('Value').fill('4000');
  await page.getByRole('button', { name: 'Save changes' }).click();

  const sellCard = page.locator('.planning-card').filter({ hasText: 'Sell XK8' });
  await expect(sellCard.getByText('Net help')).toBeVisible();
  await expect(sellCard.getByText(/4,000\.00/)).toHaveCount(2);
  await expect(page.getByLabel('Expected sale value')).toHaveCount(0);
});

test('plan page compares temporary what-if scenarios', async ({ page }) => {
  const nav = page.getByRole('navigation', { name: 'Primary navigation' });
  await nav.getByRole('button', { name: 'Plan', exact: true }).click();

  await expect(page.getByRole('heading', { name: 'What-if scenario' })).toBeVisible();
  await expect(page.getByText('Baseline 90-day cash')).toBeVisible();
  await expect(page.getByText('Scenario 90-day cash')).toBeVisible();
  await expect(page.locator('.scenario-metric').filter({ hasText: 'Scenario movement' }).getByText(/0\.00/)).toBeVisible();

  await page.getByLabel('Extra one-off cost').fill('1000');
  await page.getByLabel('Monthly capacity adjustment').fill('-200');
  await page.getByLabel('Delay asset sales beyond 90 days').check();

  await expect(page.getByText('Scenario movement')).toBeVisible();
  await expect(page.getByText('Versus saved plan')).toBeVisible();
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
