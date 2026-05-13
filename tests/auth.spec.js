import { expect, test } from '@playwright/test';
import { seedDemoData } from './helpers/seedDemoData.js';

const authHeaders = {
  'access-control-allow-origin': '*',
  'access-control-allow-headers': '*',
  'access-control-allow-methods': 'GET,POST,OPTIONS',
  'content-type': 'application/json',
};

test.beforeEach(async ({ page }) => {
  await page.route('**/auth/v1/token**', async (route) => {
    await route.fulfill({
      status: 200,
      headers: authHeaders,
      body: JSON.stringify({
        access_token: 'test-access-token',
        token_type: 'bearer',
        expires_in: 3600,
        refresh_token: 'test-refresh-token',
        user: {
          id: 'auth-test-user',
          email: 'new.user@example.com',
          user_metadata: { full_name: 'New User' },
        },
      }),
    });
  });

  await seedDemoData(page);
  await page.goto('/financial-tracker/');
});

test('new user can create an account with email and password', async ({ page }) => {
  const signupRequests = [];

  await page.route('**/auth/v1/signup', async (route) => {
    const request = route.request();
    signupRequests.push(request.postDataJSON());

    await route.fulfill({
      status: 200,
      headers: authHeaders,
      body: JSON.stringify({
        user: {
          id: 'auth-test-user',
          email: 'new.user@example.com',
          user_metadata: { full_name: 'New User' },
        },
        session: null,
      }),
    });
  });

  await page.getByRole('button', { name: 'Sign In', exact: true }).click();
  await page.getByRole('button', { name: 'Sign up', exact: true }).click();

  await expect(page.getByRole('heading', { name: 'Create Account' })).toBeVisible();

  await page.getByPlaceholder('John Doe').fill('New User');
  await page.getByPlaceholder('you@example.com').fill('new.user@example.com');
  await page.locator('input[type="password"]').fill('correct-horse-battery-staple');
  await page.getByRole('button', { name: 'Create Account' }).click();

  await expect(page.getByText('Check your email to confirm your account!')).toBeVisible();
  expect(signupRequests).toHaveLength(1);
  expect(signupRequests[0]).toMatchObject({
    email: 'new.user@example.com',
    password: 'correct-horse-battery-staple',
    data: { full_name: 'New User' },
  });
});

test('existing user can sign in with email and password', async ({ page }) => {
  const tokenRequests = [];

  await page.route('**/auth/v1/token**', async (route) => {
    const request = route.request();
    tokenRequests.push(request.postDataJSON());

    await route.fulfill({
      status: 200,
      headers: authHeaders,
      body: JSON.stringify({
        access_token: 'test-access-token',
        token_type: 'bearer',
        expires_in: 3600,
        refresh_token: 'test-refresh-token',
        user: {
          id: 'auth-test-user',
          email: 'existing.user@example.com',
          user_metadata: { full_name: 'Existing User' },
        },
      }),
    });
  });

  await page.getByRole('button', { name: 'Sign In', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible();

  await page.getByPlaceholder('you@example.com').fill('existing.user@example.com');
  await page.locator('input[type="password"]').fill('already-secret');
  await page.getByRole('button', { name: 'Sign In' }).click();

  await expect(page.getByRole('heading', { name: "Today's money picture" })).toBeVisible();
  expect(tokenRequests).toHaveLength(1);
  expect(tokenRequests[0]).toMatchObject({
    email: 'existing.user@example.com',
    password: 'already-secret',
  });
});

test('password reset sends a recovery email request', async ({ page }) => {
  const recoveryRequests = [];

  await page.route('**/auth/v1/recover**', async (route) => {
    const request = route.request();
    recoveryRequests.push(request.postDataJSON());

    await route.fulfill({
      status: 200,
      headers: authHeaders,
      body: JSON.stringify({}),
    });
  });

  await page.getByRole('button', { name: 'Sign In', exact: true }).click();
  await page.getByRole('button', { name: 'Forgot password?' }).click();

  await expect(page.getByRole('heading', { name: 'Reset Password' })).toBeVisible();

  await page.getByPlaceholder('you@example.com').fill('reset.user@example.com');
  await page.getByRole('button', { name: 'Send Reset Email' }).click();

  await expect(page.getByText('Password reset email sent! Check your inbox.')).toBeVisible();
  expect(recoveryRequests).toHaveLength(1);
  expect(recoveryRequests[0]).toMatchObject({
    email: 'reset.user@example.com',
  });
});

test('Google and GitHub sign-in options start the correct OAuth provider flow', async ({ page }) => {
  const oauthRequests = [];

  await page.route('**/auth/v1/authorize**', async (route) => {
    const requestUrl = new URL(route.request().url());
    oauthRequests.push({
      provider: requestUrl.searchParams.get('provider'),
      redirectTo: requestUrl.searchParams.get('redirect_to'),
    });

    await route.fulfill({
      status: 200,
      headers: { 'content-type': 'text/html' },
      body: '<!doctype html><title>OAuth mock</title><h1>OAuth mock</h1>',
    });
  });

  await page.getByRole('button', { name: 'Sign In', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible();

  await page.getByRole('button', { name: 'Google' }).click();
  await expect(page).toHaveURL(/\/auth\/v1\/authorize.*provider=google/);
  expect(oauthRequests[0]).toMatchObject({
    provider: 'google',
    redirectTo: 'http://127.0.0.1:4173/financial-tracker',
  });

  await page.goto('/financial-tracker/');
  await page.getByRole('button', { name: 'Sign In', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible();

  await page.getByRole('button', { name: 'GitHub' }).click();
  await expect(page).toHaveURL(/\/auth\/v1\/authorize.*provider=github/);
  expect(oauthRequests[1]).toMatchObject({
    provider: 'github',
    redirectTo: 'http://127.0.0.1:4173/financial-tracker',
  });
});
