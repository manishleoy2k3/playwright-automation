import { APIRequestContext, BrowserContext, Page } from '@playwright/test';

/**
 * Test data management utilities
 */
export class TestData {
  /**
   * Generate random email address
   */
  static generateRandomEmail(): string {
    const timestamp = Date.now();
    return `test.user.${timestamp}@example.com`;
  }

  /**
   * Generate random string
   */
  static generateRandomString(length: number = 10): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Generate random number within range
   */
  static generateRandomNumber(min: number = 1, max: number = 1000): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * Get current timestamp
   */
  static getCurrentTimestamp(): string {
    return new Date().toISOString();
  }

  static getCurrentTimeInMinutes(): number {
    const now = new Date();
    return now.getHours() * 60 + now.getMinutes();
  }

  /**
   * Format date to string
   */
  static formatDate(date: Date, format: 'ISO' | 'US' | 'EU' = 'ISO'): string {
    switch (format) {
      case 'US':
        return date.toLocaleDateString('en-US');
      case 'EU':
        return date.toLocaleDateString('en-GB');
      default:
        const isoString = date.toISOString().split('T')[0];
        return isoString || '';
    }
  }
}

/**
 * Browser utilities for common browser operations
 */
export class BrowserUtils {
  /**
   * Clear browser storage
   */
  static async clearStorage(context: BrowserContext): Promise<void> {
    await context.clearCookies();
    await context.clearPermissions();
  }

  /**
   * Set viewport size
   */
  static async setViewportSize(page: Page, width: number, height: number): Promise<void> {
    await page.setViewportSize({ width, height });
  }

  /**
   * Simulate slow network connection
   */
  static async simulateSlowNetwork(page: Page): Promise<void> {
    await page.route('**/*', async route => {
      await new Promise(resolve => setTimeout(resolve, 1000)); // 1s delay
      await route.continue();
    });
  }

  /**
   * Block images to speed up tests
   */
  static async blockImages(page: Page): Promise<void> {
    await page.route('**/*.{png,jpg,jpeg,gif,webp}', route => route.abort());
  }

  /**
   * Mock API response
   */
  static async mockApiResponse(page: Page, url: string, response: any): Promise<void> {
    await page.route(url, async route => {
      await route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify(response),
      });
    });
  }

  static async refreshPage(page: Page): Promise<void> {
    await page.reload();
    await page.waitForLoadState('domcontentloaded');
  }
}

/**
 * API utilities for common API operations
 */
export class ApiUtils {
  private static readonly ctHost = 'https://api.europe-west1.gcp.commercetools.com';

  private static getCtProjectKey(siteEnv: string): string {
    switch (siteEnv) {
      case 'dev':
        return '<your dev env key>';
      case 'stg':
        return '<your stage env key>';
      case 'prd':
        return '<your prod env key>';
      default:
        throw new Error(`Unsupported SITE_ENV: ${siteEnv}`);
    }
  }

  /**
   * Get a commercetools OAuth access token using client credentials.
   */
  static async getCTAccessToken(
    request: APIRequestContext,
    basicAuthorization: string = process.env['COMMERCETOOLS_BASIC_AUTH'] ?? ''
  ): Promise<string> {
    if (!basicAuthorization) {
      throw new Error('COMMERCETOOLS_BASIC_AUTH environment variable is not set');
    }

    const response = await request.post(
      'https://<base URL>/oauth/token?grant_type=client_credentials',
      {
        headers: {
          Authorization: `Basic ${basicAuthorization.replace(/^Basic\s+/i, '')}`,
          'Content-Type': 'text/plain',
        },
      }
    );

    const responseBody = await response.text();
    if (!response.ok()) {
      throw new Error(
        `OAuth token request failed with status ${response.status()}: ${responseBody}`
      );
    }

    const payload = JSON.parse(responseBody) as { access_token?: string };
    if (!payload.access_token) {
      throw new Error(`access_token not found in OAuth response: ${responseBody}`);
    }

    return payload.access_token;
  }

  /**
   * Get cart ID and version from commercetools by user ID. This is useful for cleaning up carts after tests.
   */
  static async getCartIdAndVersionByUserId(
    request: APIRequestContext,
    userId: string,
    accessToken: string,
    projectKey: string = ApiUtils.getCtProjectKey(process.env['SITE_ENV'] as string)
  ): Promise<{ cartId: string; cartVersion: string } | null> {
    const response = await request.get(`${this.ctHost}/${projectKey}/carts/customer-id=${userId}`, {
      headers: {
        Authorization: `Bearer ${accessToken.replace(/^Bearer\s+/i, '')}`,
        'Content-Type': 'application/json',
      },
    });

    const responseBody = await response.text();
    if (response.status() === 404) {
      return null;
    }
    if (!response.ok()) {
      throw new Error(`Cart lookup failed with status ${response.status()}: ${responseBody}`);
    }

    const cart = JSON.parse(responseBody) as { id?: string; version?: number | string };
    if (!cart?.id || cart.version === undefined) {
      return null;
    }

    return { cartId: cart.id, cartVersion: String(cart.version) };
  }

  /**
   * Delete every cart for the customer with the supplied email address.
   */
  static async clearUserCartsByEmail(request: APIRequestContext, email: string): Promise<void> {
    const accessToken = await ApiUtils.getCTAccessToken(request);
    const userId = await ApiUtils.getUserIdByEmail(request, email, accessToken);

    if (!userId) {
      return;
    }

    let cart = await ApiUtils.getCartIdAndVersionByUserId(request, userId, accessToken);
    while (cart) {
      await ApiUtils.deleteCartByCartIdAndVersion(
        request,
        cart.cartId,
        cart.cartVersion,
        accessToken
      );
      cart = await ApiUtils.getCartIdAndVersionByUserId(request, userId, accessToken);
    }
    console.log(`All carts for user ${email} have been cleared.`);
  }

  /**
   * Get a commercetools user ID by email.
   */
  static async getUserIdByEmail(
    request: APIRequestContext,
    email: string,
    accessToken: string,
    projectKey: string = ApiUtils.getCtProjectKey(process.env['SITE_ENV'] as string)
  ): Promise<string | null> {
    const response = await request.get(
      `${this.ctHost}/${projectKey}/customers?where=email%3D%22${encodeURIComponent(email)}%22`,
      {
        headers: {
          Authorization: `Bearer ${accessToken.replace(/^Bearer\s+/i, '')}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const responseBody = await response.text();
    if (!response.ok()) {
      throw new Error(`Customer lookup failed with status ${response.status()}: ${responseBody}`);
    }

    const payload = JSON.parse(responseBody) as { results?: Array<{ id?: string }> };
    const userId = payload.results?.[0]?.id;
    return userId ?? null;
  }

  /**
   * Delete a commercetools cart using its current version and id.
   */
  static async deleteCartByCartIdAndVersion(
    request: APIRequestContext,
    cartId: string,
    cartVersion: string,
    accessToken: string,
    projectKey: string = ApiUtils.getCtProjectKey(process.env['SITE_ENV'] as string)
  ): Promise<void> {
    const response = await request.delete(
      `${this.ctHost}/${projectKey}/carts/${cartId}?version=${cartVersion}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken.replace(/^Bearer\s+/i, '')}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok()) {
      const responseBody = await response.text();
      throw new Error(`Cart deletion failed with status ${response.status()}: ${responseBody}`);
    }
  }

  /**
   * Get Order SAP number from commercetools by order internal number.
   */
  static async getOrderJSONbyIMTNumber(
    request: APIRequestContext,
    imtNumber: string,
    accessToken: string,
    projectKey: string = ApiUtils.getCtProjectKey(process.env['SITE_ENV'] as string)
  ): Promise<string | null> {
    const response = await request.get(
      `${this.ctHost}/${projectKey}/orders/order-number=${imtNumber}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken.replace(/^Bearer\s+/i, '')}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const responseBody = await response.text();
    if (response.status() === 404) {
      return null;
    }
    if (!response.ok()) {
      throw new Error(`Order lookup failed with status ${response.status()}: ${responseBody}`);
    }
    return responseBody;
  }

  /**
   * Get Quote CRM number from commercetools by quote internal number.
   */
  static async getQuoteJSONbyIMTNumber(
    request: APIRequestContext,
    imtNumber: string,
    accessToken: string,
    projectKey: string = ApiUtils.getCtProjectKey(process.env['SITE_ENV'] as string)
  ): Promise<string | null> {
    const response = await request.get(
      `${this.ctHost}/${projectKey}/quotes?where=custom(fields(webshopInquiryNumber="${imtNumber}"))`,
      {
        headers: {
          Authorization: `Bearer ${accessToken.replace(/^Bearer\s+/i, '')}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const responseBody = await response.text();
    if (response.status() === 404) {
      return null;
    }
    if (!response.ok()) {
      throw new Error(`Quote lookup failed with status ${response.status()}: ${responseBody}`);
    }
    return responseBody;
  }

  /**
   * Get Quote/Order number from commercetools by internal number.
   */
  static async getQuoteOrOrderNumberByIMTNumber(
    request: APIRequestContext,
    orderType: string,
    imtNumber: string
  ): Promise<string | null> {
    const accessToken = await ApiUtils.getCTAccessToken(request);
    if (orderType === 'quote') {
      const quoteResponse = await ApiUtils.getQuoteJSONbyIMTNumber(request, imtNumber, accessToken);
      const quoteData = quoteResponse ? JSON.parse(quoteResponse) : null;
      const quoteNumber = quoteData?.results?.[0]?.custom?.fields?.crmQuoteId ?? null;
      console.log(`CRM quote number received: ${quoteNumber} for IMT number: ${imtNumber}`);
      return quoteNumber;
    } else {
      const orderResponse = await ApiUtils.getOrderJSONbyIMTNumber(request, imtNumber, accessToken);
      const orderData = orderResponse ? JSON.parse(orderResponse) : null;
      const orderNumber = orderData?.custom?.fields?.sapSalesOrderNumber ?? null;
      console.log(`SAP order number received: ${orderNumber} for IMT number: ${imtNumber}`);
      return orderNumber;
    }
  }

  /**
   * Wait for shopping or quote cart API response and return cartId from the payload
   */
  static async interceptCartIdFromApiResponse(
    page: Page,
    timeout: number = 15000
  ): Promise<{ cartId: string; cartVersion: string }> {
    const supportedCartTypes = new Set(['quote-request', 'shopping-cart']);
    const supportedCartPaths = new Set([
      '/api/checkout/quote/carts/active',
      '/api/checkout/shopping-cart/carts/active',
    ]);
    const response = await page.waitForResponse(
      res => {
        if (!res.ok() || res.request().method() !== 'GET') {
          return false;
        }

        const requestUrl = new URL(res.url());
        return (
          requestUrl.origin === '<your stg env url>m' &&
          supportedCartPaths.has(requestUrl.pathname) &&
          supportedCartTypes.has(requestUrl.searchParams.get('cartType') ?? '') &&
          requestUrl.searchParams.get('shop') === 'HWS' &&
          requestUrl.searchParams.has('storeCode') &&
          requestUrl.searchParams.has('languageCode')
        );
      },
      { timeout }
    );

    const payload = (await response.json()) as {
      id?: string;
      version?: string;
    };

    const cartId = payload.id;
    const cartVersion = payload.version;
    if (!cartId || !cartVersion) {
      throw new Error(
        `cartId or cartVersion not found in response payload: ${JSON.stringify(payload)}`
      );
    }

    return { cartId, cartVersion };
  }
}
