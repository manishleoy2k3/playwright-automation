import { test as setup } from '@playwright/test';
import { getCountry } from '@utils/url-config';
import { HomePage } from '@pages/HomePage';
import { LoginPage } from '@pages/LoginPage';

const authFile = '../auth-states/user.json';

/** Currently not used as we have tests for both guest/login users.
 * If we want to run tests only for logged in users, we can use this setup function to authenticate and save the state for future tests.
 * Then new project can be created in playwright.config.ts with state dependency on this authFile.
 */

setup('authenticate', async ({ page }) => {
  const homePage = new HomePage(page);
  const loginPage = new LoginPage(page);

  await homePage.navigateToHomePage();
  const testUser = await homePage.getUser(getCountry());
  await homePage.startLoginFromHeader();
  await loginPage.loginWithUser(testUser);

  await homePage.waitForPageLoad();

  await page.context().storageState({ path: authFile });
});
