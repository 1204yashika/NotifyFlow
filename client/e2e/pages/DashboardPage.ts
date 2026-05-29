import type { Page, Locator } from '@playwright/test';

export class DashboardPage {
  readonly page: Page;
  readonly welcomeText: Locator;
  readonly newWorkspaceButton: Locator;
  readonly workspaceList: Locator;
  readonly notificationBell: Locator;
  readonly userMenu: Locator;

  constructor(page: Page) {
    this.page = page;
    this.welcomeText = page.getByText(/welcome back/i);
    this.newWorkspaceButton = page.getByText('+ New workspace');
    this.workspaceList = page.locator('.bg-white.border.border-gray-200.rounded-xl');
    this.notificationBell = page.getByText('🔔');
    this.userMenu = page.locator('.avatar-sm, [class*="rounded-full"]').first();
  }

  async goto() {
    await this.page.goto('/dashboard');
  }

  async waitForLoad() {
    await this.welcomeText.waitFor({ state: 'visible' });
  }

  async logout() {
    await this.userMenu.click();
    await this.page.getByText('Sign out').click();
    await this.page.waitForURL('**/login');
  }
}