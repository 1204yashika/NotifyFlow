import { test, expect } from '../fixtures/auth.fixture';
import { WorkspacePage } from '../pages/WorkspacePage';

test.describe('Workspace Management', () => {

  test.beforeEach(async ({ authenticatedPage }) => {
    // all tests start logged in
  });

  test('dashboard shows workspace list', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.getByText('Your workspaces')).toBeVisible();
  });

  test('can create a new workspace', async ({ page }) => {
    await page.goto('/dashboard');

    // click new workspace button in sidebar
    await page.getByText('+ New workspace').click();

    // fill modal
    await page.getByLabel('Workspace name').fill('E2E Test Workspace');
    await page.getByLabel('Description').fill('Created by E2E test');
    await page.getByRole('button', { name: /create/i }).click();

    // should redirect to new workspace
    await expect(page).toHaveURL(/.*workspace\/.*/);
    await expect(page.getByText('E2E Test Workspace')).toBeVisible();
  });

  test('workspace page shows tasks and members tabs', async ({ page }) => {
    await page.goto('/dashboard');

    // open first workspace
    await page.getByText('Open →').first().click();

    await expect(page).toHaveURL(/.*workspace\/.*/);
    await expect(page.getByRole('button', { name: /tasks/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /members/i })).toBeVisible();
  });

  test('members tab shows workspace members', async ({ page }) => {
    await page.goto('/dashboard');
    await page.getByText('Open →').first().click();

    // click members tab
    await page.getByRole('button', { name: /members/i }).click();

    // should show at least the owner
    await expect(page.getByText('Members')).toBeVisible();
  });

  test('owner sees invite button', async ({ page }) => {
    await page.goto('/dashboard');
    await page.getByText('Open →').first().click();

    await expect(
      page.getByRole('button', { name: /invite/i })
    ).toBeVisible();
  });

  test('404 page shows for invalid workspace', async ({ page }) => {
    await page.goto('/workspace/invalid-workspace-id-000');
    await expect(
      page.getByText('Workspace not found')
    ).toBeVisible();
  });
});