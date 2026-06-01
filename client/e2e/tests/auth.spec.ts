import { test, expect, TEST_EMAIL, TEST_PASSWORD } from '../fixtures/auth.fixture';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';

test.describe('Authentication', () => {

  test.describe('Login', () => {
    test('shows login page with correct elements', async ({ page }) => {
      const loginPage = new LoginPage(page);
      await loginPage.goto();

      await expect(page.getByText('Welcome back')).toBeVisible();
      await expect(page.getByLabel('Email')).toBeVisible();
      await expect(page.getByLabel('Password')).toBeVisible();
      await expect(
        page.getByRole('button', { name: /sign in/i })
      ).toBeVisible();
    });

    test('shows validation error for empty fields', async ({ page }) => {
      const loginPage = new LoginPage(page);
      await loginPage.goto();
      await loginPage.submitButton.click();

      await expect(page.getByText('Invalid email')).toBeVisible();
    });

    test('shows error for wrong credentials', async ({ page }) => {
      const loginPage = new LoginPage(page);
      await loginPage.goto();
      await loginPage.login(TEST_EMAIL, 'wrongpassword');

      await expect(
        page.getByText('Invalid email or password')
      ).toBeVisible();
    });

    test('successfully logs in and redirects to dashboard', async ({ page }) => {
      const loginPage = new LoginPage(page);
      await loginPage.goto();
      await loginPage.login(TEST_EMAIL, TEST_PASSWORD);

      await expect(page).toHaveURL(/.*dashboard/);
      await expect(page.getByText(/welcome back/i)).toBeVisible();
    });

    test('redirects to login when accessing protected route', async ({ page }) => {
      // clear any existing tokens
      await page.goto('/dashboard');
      await expect(page).toHaveURL(/.*login/);
    });
  });

  test.describe('Register', () => {
    test('shows register page correctly', async ({ page }) => {
      const registerPage = new RegisterPage(page);
      await registerPage.goto();

      await expect(page.getByRole('heading', { name: 'Create account' })).toBeVisible();
    });

    test('shows error when passwords dont match', async ({ page }) => {
      const registerPage = new RegisterPage(page);
      await registerPage.goto();

      await registerPage.nameInput.fill('Test User');
      await registerPage.emailInput.fill('test@test.com');
      await registerPage.passwordInput.fill('password123');
      await registerPage.confirmPasswordInput.fill('different123');
      await registerPage.submitButton.click();

      await expect(
        page.getByText('Passwords do not match')
      ).toBeVisible();
    });

    test('navigates to login from register page', async ({ page }) => {
      const registerPage = new RegisterPage(page);
      await registerPage.goto();

      await page.getByText('Sign in').click();
      await expect(page).toHaveURL(/.*login/);
    });
  });

  test.describe('Logout', () => {
    test('logs out and redirects to login', async ({ page, authenticatedPage }) => {
      // already logged in via fixture
      await page.goto('/dashboard');

      // click user menu
      await page.locator('[class*="rounded-full"]').first().click();
	  await page.getByText('Yashika Agrawal').click();
      await page.getByText('Sign out').click();

      await expect(page).toHaveURL(/.*login/);
    });

    test('cannot access dashboard after logout', async ({ page, authenticatedPage }) => {
      await page.goto('/dashboard');

      // logout
      await page.locator('[class*="rounded-full"]').first().click();
      await page.getByText('Yashika Agrawal').click();
      await page.getByText('Sign out').click();

      // try to go back
      await page.goto('/dashboard');
      await expect(page).toHaveURL(/.*login/);
    });
  });
});