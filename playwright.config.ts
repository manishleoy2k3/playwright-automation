import { defineConfig, devices } from '@playwright/test';
import { UrlBuilder } from './src/utils/url-config';
import { TestPoint } from 'azure-devops-node-api/interfaces/TestInterfaces';
import { TestCase } from '@playwright/test/reporter';
import { AzureReporterOptions } from '@alex_neo/playwright-azure-reporter/dist/playwright-azure-reporter';
import 'dotenv/config';
import { CHANNEL_SKIPS } from './channels'


/**
 * Playwright configuration file for TypeScript test automation
 * @see https://playwright.dev/docs/test-configuration
 */

// Build dynamic base URL for websites
function buildBaseUrl(): string {
  // Check if explicit BASE_URL is provided
  if (process.env['BASE_URL']) {
    return process.env['BASE_URL'];
  }

  // Build URL dynamically using URL builder
  const urlBuilder = new UrlBuilder();
  return urlBuilder.buildBaseUrl();
}
// Read the country passed from your Azure pipeline
const currentChannel = process.env['SITE_COUNTRY'] || 'de';
const skipPattern = CHANNEL_SKIPS[currentChannel];

export default defineConfig({
  ...(skipPattern ? { grepInvert: new RegExp(skipPattern) } : {}),
  // Test directory
  testDir: './tests',
  
  // Run tests in files in parallel
  fullyParallel: true,
  
  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env['CI'],
  
  // Retry configuration - only retry in CI environments
  retries: process.env['CI'] ? 1 : 0,
  
  // Opt out of parallel tests on CI
  workers: process.env['CI'] ? 1 : 4,
  
  // Reporter configuration
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    // ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/junit-results.xml' }],
    ['allure-playwright', { 
      detail: true, 
      outputFolder: 'allure-results',
      suiteTitle: true 
    }],
    ['list'],
    ['@alex_neo/playwright-azure-reporter', {
      orgUrl: 'https://dev.azure.com/<add your project group Name here>',
      projectName: '<add your project Name here>',
      planId: <add your plan id here>,
      token: process.env['TEST_MANAGEMENT_TOKEN'],
      authType: 'pat',
      environment: 'TEST',
      logging: false,
      testRunTitle: 'Playwright Test Run',
      publishTestResultsMode: 'testRun',
      uploadAttachments: false,
      testCaseIdMatcher: /\[([\d,\s]+)\]/,
      testPointMapper: async (testCase: TestCase, testPoints: TestPoint[]) => {
        switch(process.env['SITE_COUNTRY']) {
          case 'de':
            return testPoints.filter((testPoint) => testPoint.configuration.id === '2785');
          case 'us':
            return testPoints.filter((testPoint) => testPoint.configuration.id === '2786');
          case 'at':
            return testPoints.filter((testPoint) => testPoint.configuration.id === '2831');
          case 'dk':
            return testPoints.filter((testPoint) => testPoint.configuration.id === '2833');
          case 'se':
            return testPoints.filter((testPoint) => testPoint.configuration.id === '2834');
          case 'no':
            return testPoints.filter((testPoint) => testPoint.configuration.id === '2836');
          case 'fi':
            return testPoints.filter((testPoint) => testPoint.configuration.id === '2835');
          case 'it':
            return testPoints.filter((testPoint) => testPoint.configuration.id === '2832');
          case 'fr':
            return testPoints.filter((testPoint) => testPoint.configuration.id === '2838');
          case 'sk':
            return testPoints.filter((testPoint) => testPoint.configuration.id === '2850');
          case 'cz':
            return testPoints.filter((testPoint) => testPoint.configuration.id === '2844');
          case 'be':
            return testPoints.filter((testPoint) => testPoint.configuration.id === '2841');
          case 'ch':
            return testPoints.filter((testPoint) => testPoint.configuration.id === '2842');
          case 'es':
            return testPoints.filter((testPoint) => testPoint.configuration.id === '2849');
          case 'global':
            return testPoints.filter((testPoint) => testPoint.configuration.id === '2843');
          case 'ie':
            return testPoints.filter((testPoint) => testPoint.configuration.id === '2846');
          case 'in':
            return testPoints.filter((testPoint) => testPoint.configuration.id === '2837');
          case 'kr':
            return testPoints.filter((testPoint) => testPoint.configuration.id === '2847');
          case 'mx':
            return testPoints.filter((testPoint) => testPoint.configuration.id === '2839');
          case 'nl':
            return testPoints.filter((testPoint) => testPoint.configuration.id === '2840');
          case 'pl':
            return testPoints.filter((testPoint) => testPoint.configuration.id === '2845');
          case 'uk':
            return testPoints.filter((testPoint) => testPoint.configuration.id === '2848');
          default:
            throw new Error("invalid test configuration!");
        }
      }
    } as AzureReporterOptions],
  ],

  // Global test configuration
  use: {
    // Base URL for tests - dynamically set based on environment
    baseURL: buildBaseUrl(),

    // dev/stg storefronts sit behind HTTP Basic Auth
    httpCredentials: {
      username: process.env['STOREFRONT_USERNAME']!,
      password: (process.env['SITE_ENV'] === 'dev'
        ? process.env['STOREFRONT_DEV_PASSWORD']
        : process.env['STOREFRONT_STG_PASSWORD'])!,
    },
    
    // Browser context options
    viewport: { width: 1280, height: 720 },
    
    // Collect trace when retrying the failed test
    trace: 'on-first-retry',
    
    // Video recording disabled
    video: 'off',
    
    // Take screenshot on failure
    screenshot: 'only-on-failure',
    
    // Navigation timeout
    navigationTimeout: 30 * 1000,
    
    // Action timeout
    actionTimeout: 10 * 1000,
    
    // Ignore HTTPS errors
    ignoreHTTPSErrors: true,
    
    // Headless mode
    headless: !process.env['HEADED'],
  },

  // Test timeout
  timeout: 100 * 1000,
  expect: {
    timeout: 10 * 1000,
  },

  // Configure projects for major browsers
  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
      // channel: 'chrome'
      },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    
    // Mobile browsers
    {
      name: 'mobile_Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'mobile_Safari',
      use: { ...devices['iPhone 14'] },
    },
  ],

  // Output directories
  outputDir: 'test-results/',
  
  // Global setup and teardown
  globalSetup: require.resolve('./src/utils/global-setup.ts'),
  globalTeardown: require.resolve('./src/utils/global-teardown.ts'),

  // Web server configuration (if needed for local development)
  // webServer: process.env['CI'] ? undefined : {
  //   command: 'npm run dev',
  //   port: 3000,
  //   reuseExistingServer: !process.env['CI'],
  // },
});
