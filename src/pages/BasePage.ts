import { Page, Locator, expect } from '@playwright/test';
import { urlBuilder } from '../utils/url-config';
import { ElementHelper } from '../utils/helper';
import { allure } from 'allure-playwright';

export interface TestUser {
  email: string;
  password: string;
  country: string;
}

/**
 * Base Page class that provides common functionality for all page objects
 * Following the Page Object Model pattern for websites
 */
export abstract class BasePage {
  protected page: Page;
  protected urlBuilder = urlBuilder;
  protected helper: ElementHelper;
  private readonly cookieConsentDialog: Locator;
  private readonly acceptAllCookiesButton: Locator;
  private readonly cookieSettingsButton: Locator;

  constructor(page: Page, url: string = '') {
    this.page = page;
    this.helper = new ElementHelper(page);
    this.cookieConsentDialog = page.locator('#onetrust-banner-sdk');
    this.acceptAllCookiesButton = page.locator('#onetrust-accept-btn-handler');
    this.cookieSettingsButton = page.locator('#onetrust-pc-btn-handler');
  }

  /**
   * Navigate to URL
   */
  async gotoUrl(url: string): Promise<void> {
    await this.page.goto(url);
    await allure.step(`Resolved URL: ${this.page.url()}`, async () => {});
  }

  /**
   * Navigate to specific page using URL builder
   */
  async gotoPage(page: string): Promise<void> {
    const url = this.urlBuilder.buildPageUrl(page);
    await this.page.goto(url);
  }

  /**
   * Get current URL
   */
  async getCurrentUrl(): Promise<string> {
    return this.page.url();
  }

  /**
   * Wait for page to be loaded
   */
  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Handle cookie consent if displayed
   */
  async handleCookieConsent(acceptAll: boolean = true): Promise<void> {
    try {
      await this.helper.waitForElement(this.cookieConsentDialog, 3000);

      if (acceptAll) {
        await this.helper.clickElement(this.acceptAllCookiesButton);
      } else {
        await this.helper.clickElement(this.cookieSettingsButton);
      }
    } catch {
      // Cookie dialog not present or already handled
    }
  }

  /**
   * Take a screenshot
   */
  async takeScreenshot(name: string): Promise<void> {
    await this.page.screenshot({
      path: `screenshots/${name}-${Date.now()}.png`,
      fullPage: true,
    });
  }

  /**
   * Verify page title
   */
  async verifyPageTitle(expectedTitle: string): Promise<void> {
    await expect(this.page).toHaveTitle(expectedTitle);
  }

  /**
   * Verify current URL
   */
  async verifyCurrentUrl(expectedUrl: string | RegExp): Promise<void> {
    await expect(this.page).toHaveURL(expectedUrl);
  }

  /**
   * Handle dialog/alert
   */
  async handleDialog(accept: boolean = true, promptText?: string): Promise<void> {
    this.page.once('dialog', async dialog => {
      if (promptText && dialog.type() === 'prompt') {
        await dialog.accept(promptText);
      } else if (accept) {
        await dialog.accept();
      } else {
        await dialog.dismiss();
      }
    });
  }

  /**
   * Switch to new tab/window
   */
  async switchToNewTab(): Promise<Page> {
    const [newPage] = await Promise.all([
      this.page.context().waitForEvent('page'),
      // The action that triggers the new tab should be performed after this
    ]);
    await newPage.waitForLoadState();
    return newPage;
  }

  /**
   * Close current page
   */
  async closePage(): Promise<void> {
    await this.page.close();
  }

  // ============================================
  // AUTHENTICATION METHODS
  // ============================================

  /**
   * Get user credentials by country
   * Email is derived by country, password is shared via environment variable.
   */
  async getUser(country: string): Promise<TestUser> {
    const normalizedCountry = country.toLowerCase();
    const autotestUsersPassword = process.env['TEST_USER_PASSWORD'];

    if (!autotestUsersPassword) {
      throw new Error(
        'Missing TEST_USER_PASSWORD environment variable for test users. Set it in .env (local) or pipeline variables (CI/CD).'
      );
    }

    return {
      email: `mach.hws.testuser.${normalizedCountry}@yopmail.com`,
      password: autotestUsersPassword,
      country: normalizedCountry,
    };
  }

  /**
   * Perform logout
   */
  async logout(): Promise<void> {
    // Navigate to logout or find logout button
    // This is a generic implementation - adjust based on your app
    try {
      const logoutButton = this.page.locator('[data-testid="my-account-logout-button"]');
      await logoutButton.first().click();
    } catch {
      // If no logout button found, clear session manually
      await this.page.context().clearCookies();
      await this.page.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
      });
    }
  }

  /**
   * Check if user is currently logged in
   */
  async isLoggedIn(): Promise<boolean> {
    // Check for login indicators - adjust these selectors based on your app
    try {
      const loginIndicators = [
        '[data-testid="user-menu"]',
        '[data-testid="logout"]',
        'a:has-text("Logout")',
        '.user-profile',
        '.account-menu',
      ];

      for (const selector of loginIndicators) {
        const element = this.page.locator(selector).first();
        if (await this.helper.isElementVisible(element, 1000)) {
          return true;
        }
      }
      return false;
    } catch {
      return false;
    }
  }

  /**
   * Ensure user is logged out, logout if needed
   */
  async ensureLoggedOut(): Promise<void> {
    const loggedIn = await this.isLoggedIn();
    if (loggedIn) {
      await this.logout();
    }
  }

  /**
   * Clean authentication state
   */
  async cleanAuthState(): Promise<void> {
    await this.logout();
    // Clear any stored authentication
    await this.page.context().clearCookies();
    await this.page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  }
}
