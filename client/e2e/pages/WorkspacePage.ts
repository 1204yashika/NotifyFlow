import type { Page, Locator } from '@playwright/test';

export class WorkspacePage {
  readonly page: Page;
  readonly newTaskButton: Locator;
  readonly inviteButton: Locator;
  readonly tasksTab: Locator;
  readonly membersTab: Locator;
  readonly kanbanView: Locator;
  readonly listView: Locator;
  readonly todoColumn: Locator;
  readonly inProgressColumn: Locator;
  readonly doneColumn: Locator;

  constructor(page: Page) {
    this.page = page;
    this.newTaskButton = page.getByRole('button', { name: /new task/i }).first();
    this.inviteButton = page.getByRole('button', { name: /invite/i });
    this.tasksTab = page.getByRole('button', { name: /tasks/i });
    this.membersTab = page.getByRole('button', { name: /members/i });
    this.kanbanView = page.getByRole('button', { name: /kanban/i });
    this.listView = page.getByRole('button', { name: /list/i });
    this.todoColumn = page.getByText('TODO').first();
    this.inProgressColumn = page.getByText('IN PROGRESS').first();
    this.doneColumn = page.getByText('DONE').first();
  }

  async createTask(title: string, priority: string = 'medium') {
    await this.newTaskButton.click();
    await this.page.getByLabel('Title').fill(title);
    await this.page.getByLabel('Priority').selectOption(priority);
    await this.page.getByRole('button', { name: /create task/i }).click();
    await this.page.waitForTimeout(500);
  }

  async switchToList() {
    await this.listView.click();
  }

  async switchToKanban() {
    await this.kanbanView.click();
  }
}