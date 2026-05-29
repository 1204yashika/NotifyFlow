import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';

// test credentials — use a dedicated test account
const TEST_EMAIL = 'yashika@test.com';
const TEST_PASSWORD = 'testpassword123';

// extend base test with logged-in fixture
export const test = base.extend<{
  loginPage: LoginPage;
  dashboardPage: DashboardPage;
  authenticatedPage: void;
}>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  dashboardPage: async ({ page }, use) => {
    await use(new DashboardPage(page));
  },

  // automatically logs in before test
  authenticatedPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(TEST_EMAIL, TEST_PASSWORD);
    await page.waitForURL('**/dashboard');
    await use();
  },
});

export { expect } from '@playwright/test';
export { TEST_EMAIL, TEST_PASSWORD };