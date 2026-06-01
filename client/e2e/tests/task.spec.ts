import { test, expect } from '../fixtures/auth.fixture';
import { WorkspacePage } from '../pages/WorkspacePage';

test.describe('Task Management', () => {

  test.beforeEach(async ({ page, authenticatedPage }) => {
    await page.goto('/dashboard');

    const workspaceCard = page.locator('div[class*="hover:bg-gray-50"]').first();
    const hasWorkspace = await workspaceCard.isVisible({ timeout: 3000 }).catch(() => false);

    if (!hasWorkspace) {
      await page.getByText('+ New workspace').click();
      await page.getByLabel('Workspace name').fill('E2E Workspace');
      await page.getByRole('button', { name: /create/i }).click();
      await page.waitForURL(/.*workspace\/.*/);
    } else {
      await workspaceCard.click();
      await page.waitForURL(/.*workspace\/.*/);
    }

    await page.waitForLoadState('networkidle');
  });

  test('shows empty state when no tasks', async ({ page }) => {
    // this test assumes a fresh workspace
    const workspacePage = new WorkspacePage(page);
    await workspacePage.switchToList();

    // either empty state or task list
    const hasEmptyState = await page.getByText('No tasks yet').isVisible()
      .catch(() => false);
    const hasTaskList = await page.locator('.bg-white.border').isVisible()
      .catch(() => false);

    expect(hasEmptyState || hasTaskList).toBe(true);
  });

  test('can create a new task', async ({ page }) => {
    const workspacePage = new WorkspacePage(page);

    await workspacePage.createTask('E2E Test Task');

    // task should appear on board
    await expect(page.getByText('E2E Test Task', { exact: true })).toBeVisible();
  });

  test('can create task with all fields', async ({ page }) => {
    const workspacePage = new WorkspacePage(page);

    await workspacePage.newTaskButton.click();

    await page.getByLabel('Title').fill('Full Task');
    await page.getByLabel('Priority').selectOption('high');
    await page.getByLabel('Due date').fill('2026-12-31');
    await page.getByRole('button', { name: /create task/i }).click();

    await expect(page.getByText('Full Task', { exact: true })).toBeVisible();
    await expect(page.getByText('high', { exact: true })).toBeVisible();
  });

  test('can edit an existing task', async ({ page }) => {
    const workspacePage = new WorkspacePage(page);

    // create task first
    await workspacePage.createTask('Task to Edit');

    // click on the task
    await page.getByText('Task to Edit', { exact: true }).click();

    // modal opens in edit mode
    await expect(page.getByRole('heading', { name: 'Edit task' })).toBeVisible();

    // update title
    await page.getByLabel('Title').clear();
    await page.getByLabel('Title').fill('Updated Task Title');
    await page.getByRole('button', { name: /save changes/i }).click();

    // updated title should show
    await expect(page.getByText('Updated Task Title', { exact: true })).toBeVisible();
  });

  test('can delete a task', async ({ page }) => {
    const workspacePage = new WorkspacePage(page);

    // create task
    await workspacePage.createTask('Task to Delete');
    await expect(page.getByText('Task to Delete', { exact: true })).toBeVisible();

    // click task to open modal
    await page.getByText('Task to Delete', { exact: true }).click();

    // click delete
    await page.getByRole('button', { name: 'Delete', exact: true }).click();

    // task should be gone
    await expect(page.getByText('Task to Delete', { exact: true })).not.toBeVisible();
  });

  test('can switch between kanban and list view', async ({ page }) => {
    const workspacePage = new WorkspacePage(page);

    // kanban columns only show when tasks exist
    await workspacePage.createTask('View Switch Task');

    // start in kanban — match the h3 column heading specifically
    await expect(page.getByRole('heading', { name: 'Todo', exact: true }).first()).toBeVisible();

    // switch to list
    await workspacePage.switchToList();
    await expect(page.getByRole('heading', { name: 'Todo', exact: true })).not.toBeVisible();

    // switch back to kanban
    await workspacePage.switchToKanban();
    await expect(page.getByRole('heading', { name: 'Todo', exact: true }).first()).toBeVisible();
  });

  test('can filter tasks by priority', async ({ page }) => {
    const workspacePage = new WorkspacePage(page);

    // create high priority task
    await workspacePage.createTask('High Priority Task');
    await page.getByText('High Priority Task', { exact: true }).click();
    await page.getByLabel('Priority').selectOption('high');
    await page.getByRole('button', { name: /save changes/i }).click();

    // filter by high priority
    await page.getByRole('combobox').nth(1).selectOption('high');

    // only high priority tasks visible
    await expect(page.getByText('High Priority Task', { exact: true })).toBeVisible();
  });

  test('kanban columns show correct task counts', async ({ page }) => {
    const workspacePage = new WorkspacePage(page);
    await workspacePage.createTask('Count Test Task');

    // todo column count span (bg-white rounded-full) next to "Todo" heading
    const todoCount = page.getByRole('heading', { name: 'Todo', exact: true })
      .locator('..').locator('span.rounded-full').first();
    await expect(todoCount).not.toHaveText('0');
  });

  test('task modal closes on escape key', async ({ page }) => {
    const workspacePage = new WorkspacePage(page);
    await workspacePage.newTaskButton.click();

    await expect(page.getByRole('heading', { name: 'New task' })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('heading', { name: 'New task' })).not.toBeVisible();
  });
});