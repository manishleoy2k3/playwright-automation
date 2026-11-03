import { Page, Locator, expect } from '@playwright/test';

/**
 * Element Helper class that provides common element interaction methods
 * Used by page objects for consistent element handling
 */
export class ElementHelper {
  protected page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Wait for element to be visible
   */
  async waitForElement(locator: Locator, timeout: number = 10000): Promise<void> {
    await locator.waitFor({ state: 'visible', timeout });
  }

  /**
   * Click element
   */
  async clickElement(locator: Locator): Promise<void> {
    await this.waitForElement(locator);
    await locator.click({ force: true });
    return;
  }

  /**
   * Select radio button if not selected
   */
  async selectRadioButton(locator: Locator): Promise<void> {
    await this.waitForElement(locator);
    const isChecked = await locator.isChecked();
    if (!isChecked) {
      await locator.check();
    }
  }

  /**
   * Fill input with text
   */
  async fillInput(locator: Locator, text: string, clearFirst: boolean = true): Promise<void> {
    await this.waitForElement(locator);
    if (clearFirst) {
      await locator.clear();
    }
    await locator.fill(text);
  }

  /**
   * Get element text
   */
  async getElementText(locator: Locator): Promise<string> {
    await this.waitForElement(locator);
    const text = await locator.textContent();
    return text ?? '';
  }

  /**
   * Verify element is visible
   * @param locator - Playwright Locator for the element to check
   * @param softAssertion - If true, will use soft assertion which allows test to continue even if this check fails
   */
  async verifyElementVisible(locator: Locator, softAssertion: boolean = true): Promise<void> {
    if (softAssertion) {
      await expect.soft(locator, `Expect toBeVisible: ${locator.toString()}`).toBeVisible();
    } else {
      await expect(locator, `Expect toBeVisible: ${locator.toString()}`).toBeVisible();
    }
  }

  /**
   * Verify element contains text
   */
  async verifyElementContainsText(locator: Locator, text: string): Promise<void> {
    await expect(locator, `Expect toContainText: ${locator.toString()}`).toContainText(text);
  }

  /**
   * Verify elements number greater than expected
   */
  async verifyElementsCountGreaterThan(locator: Locator, count: number): Promise<void> {
    const elementsCount = await locator.count();
    expect(
      elementsCount,
      `Expect ${locator.toString()} count to be greater than ${count}`
    ).toBeGreaterThan(count);
  }

  /**
   * Scroll element into view
   */
  async scrollToElement(locator: Locator): Promise<void> {
    await locator.scrollIntoViewIfNeeded();
  }

  /**
   * Hover over element
   */
  async hoverElement(locator: Locator): Promise<void> {
    await this.waitForElement(locator);
    await locator.hover();
  }

  /**
   * Select option from dropdown
   */
  async selectOption(selectLocator: Locator, value: string): Promise<void> {
    await this.waitForElement(selectLocator);
    await selectLocator.selectOption(value);
  }

  /**
   * Upload file
   */
  async uploadFile(inputLocator: Locator, filePath: string): Promise<void> {
    await inputLocator.setInputFiles(filePath);
  }

  /**
   * Check if element is visible (without waiting)
   */
  async isElementVisible(locator: Locator, timeout: number = 1000): Promise<boolean> {
    try {
      await locator.waitFor({ state: 'visible', timeout });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Check if element is enabled
   */
  async isElementEnabled(locator: Locator): Promise<boolean> {
    await this.waitForElement(locator);
    return await locator.isEnabled();
  }

  /**
   * Get element attribute value
   */
  async getElementAttribute(locator: Locator, attributeName: string): Promise<string | null> {
    return await locator.getAttribute(attributeName);
  }

  /**
   * Wait for element to be hidden
   */
  async waitForElementHidden(locator: Locator, timeout: number = 5000): Promise<void> {
    await locator.waitFor({ state: 'hidden', timeout });
  }

  /**
   * Double click element
   */
  async doubleClickElement(locator: Locator): Promise<void> {
    await this.waitForElement(locator);
    await locator.dblclick();
  }

  /**
   * Right click element
   */
  async rightClickElement(locator: Locator): Promise<void> {
    await this.waitForElement(locator);
    await locator.click({ button: 'right' });
  }

  /**
   * Clear input field
   */
  async clearInput(locator: Locator): Promise<void> {
    await this.waitForElement(locator);
    await locator.clear();
  }

  /**
   * Press key on element
   */
  async pressKey(locator: Locator, key: string): Promise<void> {
    await this.waitForElement(locator);
    await locator.press(key);
  }

  /**
   * Focus on element
   */
  async focusElement(locator: Locator): Promise<void> {
    await this.waitForElement(locator);
    await locator.focus();
  }

  async getElementValue(locator: Locator): Promise<string> {
    await this.waitForElement(locator);
    return await locator.inputValue();
  }

  async normalizeText(text: string): Promise<string> {
    return text.replace(/[^\p{L}\p{N},.]+/gu, '');
  }

  async extractPriceFromText(text: string): Promise<number> {
    const normalizedText = await this.normalizeText(text);
    const priceMatch = normalizedText.match(/[\d,.]+/);
    if (priceMatch) {
      return parseFloat(priceMatch[0].replace(/,/g, ''));
    }
    throw new Error(`No price found in text: ${text}`);
  }

  async verifyCustomerPriceIsDisplayed(
    listPriceLocator: Locator,
    customerPriceLocator: Locator
  ): Promise<void> {
    await this.scrollToElement(listPriceLocator);
    await this.verifyElementVisible(listPriceLocator);
    await this.verifyElementVisible(customerPriceLocator);

    const listPrice = await this.extractPriceFromText(await this.getElementText(listPriceLocator));
    const customerPrice = await this.extractPriceFromText(
      await this.getElementText(customerPriceLocator)
    );

    expect(
      listPrice,
      `Expected list price (${listPrice}) to be greater than customer price (${customerPrice})`
    ).toBeGreaterThan(customerPrice);
  }
}
