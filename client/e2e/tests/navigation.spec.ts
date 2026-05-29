import { test, expect } from '../fixtures/auth.fixture';

test.describe('Navigation', () => {

  test('404 page shows for unknown routes', async ({ page }) => {
    await page.goto('/this-page-does-not-exist');
    await expect(page.getByText('Page not found')).toBeVisible();
  });

  test('back to dashboard button works on 404', async ({ page }) => {
    await page.goto('/this-page-does-not-exist');
    await page.getByRole('button', { name: /back to dashboard/i }).click();
    await expect(page).toHaveURL(/.*login|.*dashboard/);
  });

  test('sidebar navigation works when logged in', async ({ page, authenticatedPage }) => {
    await page.goto('/dashboard');

    // navigate to My Tasks
    await page.getByText('My Tasks').click();
    await expect(page).toHaveURL(/.*my-tasks/);
    await expect(page.getByText('My Tasks').first()).toBeVisible();

    // navigate to Notifications
    await page.getByText('Notifications').click();
    await expect(page).toHaveURL(/.*notifications/);

    // navigate back to Dashboard
    await page.getByText('Dashboard').click();
    await expect(page).toHaveURL(/.*dashboard/);
  });

  test('my tasks page shows tasks assigned to user', async ({ page, authenticatedPage }) => {
    await page.goto('/my-tasks');
    await expect(page.getByText('My Tasks')).toBeVisible();
    await expect(page.getByText('All tasks assigned to you')).toBeVisible();
  });
});