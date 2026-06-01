import { test, expect } from '../fixtures/auth.fixture';
import { WorkspacePage } from '../pages/WorkspacePage';

test.describe('Workspace Management', () => {

  const openFirstWorkspace = async (page: any) => {
    await page.locator('div[class*="hover:bg-gray-50"]').first().click();
    await page.waitForURL(/.*workspace\/.*/);
  };

  test.beforeEach(async ({ page, authenticatedPage: _ }) => {
    await page.goto('/dashboard');
    const hasWorkspace = await page.locator('div[class*="hover:bg-gray-50"]').first().isVisible({ timeout: 3000 }).catch(() => false);
    if (!hasWorkspace) {
      await page.getByText('+ New workspace').click();
      await page.getByLabel('Workspace name').fill('E2E Workspace');
      await page.getByRole('button', { name: /create/i }).click();
      await page.waitForURL(/.*workspace\/.*/);
      await page.goto('/dashboard');
      await page.locator('div[class*="hover:bg-gray-50"]').first().waitFor({ timeout: 5000 });
    }
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
    await expect(page.getByText('E2E Test Workspace', { exact: true }).first()).toBeVisible();
  });

  test('workspace page shows tasks and members tabs', async ({ page }) => {
    await page.goto('/dashboard');
    await openFirstWorkspace(page);

    await expect(page).toHaveURL(/.*workspace\/.*/);
    await expect(page.getByRole('button', { name: /tasks/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /members/i })).toBeVisible();
  });

  test('members tab shows workspace members', async ({ page }) => {
    await page.goto('/dashboard');
    await openFirstWorkspace(page);

    await page.getByRole('button', { name: /members/i }).click();
    await expect(page.getByRole('heading', { name: /Members/ })).toBeVisible();
  });

  test('owner sees invite button', async ({ page }) => {
    await page.goto('/dashboard');
    await openFirstWorkspace(page);

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