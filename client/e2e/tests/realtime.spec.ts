import { test, expect } from '../fixtures/auth.fixture';
import { WorkspacePage } from '../pages/WorkspacePage';

test.describe('Real-time Notifications', () => {

  test('notification bell shows on layout', async ({ page, authenticatedPage }) => {
    await page.goto('/dashboard');
    await expect(page.getByText('🔔')).toBeVisible();
  });

  test('notification dropdown opens and closes', async ({ page, authenticatedPage }) => {
    await page.goto('/dashboard');

    // open bell
    await page.getByText('🔔').click();
    await expect(page.locator('span.font-semibold', { hasText: 'Notifications' })).toBeVisible();

    // close by clicking outside
    await page.keyboard.press('Escape');
  });

  test('shows empty notifications state', async ({ page, authenticatedPage }) => {
    await page.goto('/dashboard');
    await page.getByText('🔔').click();

    // might show "No notifications yet" if no activity
    const emptyState = page.getByText('No notifications yet');
    const hasNotifs = page.locator('[class*="notif"]');

    // one of these should be visible
    const isEmpty = await emptyState.isVisible().catch(() => false);
    const hasNotifications = await hasNotifs.isVisible().catch(() => false);
    expect(isEmpty || hasNotifications).toBe(true);
  });

  test('notifications page loads correctly', async ({ page, authenticatedPage }) => {
    await page.goto('/notifications');

    await expect(page.getByRole('heading', { name: 'Notifications' })).toBeVisible();
    await expect(page.getByText('Activity', { exact: true })).toBeVisible();
  });

  test.describe('Two browser contexts (real-time)', () => {
    test('task created by user A appears for user B', async ({ browser }) => {
      // create two browser contexts
      const contextA = await browser.newContext();
      const contextB = await browser.newContext();

      const pageA = await contextA.newPage();
      const pageB = await contextB.newPage();

      try {
        // login both users
        await pageA.goto('/login');
        await pageA.getByLabel('Email').fill('yashika@test.com');
        await pageA.getByLabel('Password').fill('testpassword123');
        await pageA.getByRole('button', { name: /sign in/i }).click();
        await pageA.waitForURL('**/dashboard');

        // User B should be a different account
        // that is a member of the same workspace
        await pageB.goto('/login');
        await pageB.getByLabel('Email').fill('yashikatest2@gmail.com');
        await pageB.getByLabel('Password').fill('testpassword123');
        await pageB.getByRole('button', { name: /sign in/i }).click();
        await pageB.waitForURL('**/dashboard');

        // both navigate to same workspace
        await pageA.goto('/dashboard');
        await pageA.getByText('Open →').first().click();
        await pageA.waitForURL(/.*workspace\/.*/);

        const workspaceUrl = pageA.url();
        await pageB.goto(workspaceUrl);

        // User A creates a task
        const workspacePageA = new WorkspacePage(pageA);
        await workspacePageA.createTask('Real-time Test Task');

        // User B should see toast notification
        await expect(
          pageB.getByText(/new task created/i)
        ).toBeVisible({ timeout: 5000 });

        // User B's board should show the task
        await expect(
          pageB.getByText('Real-time Test Task')
        ).toBeVisible({ timeout: 5000 });

      } finally {
        await contextA.close();
        await contextB.close();
      }
    });
  });
});