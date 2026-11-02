# Playwright Test Automation

[![TypeScript](https://img.shields.io/badge/TypeScript-5.2.0-blue.svg)](https://www.typescriptlang.org/)
[![Playwright](https://img.shields.io/badge/Playwright-1.40.0-green.svg)](https://playwright.dev/)
[![Allure](https://img.shields.io/badge/Allure-2.8.1-orange.svg)](https://docs.qameta.io/allure/)

Test automation framework Sample Project using **TypeScript**, **Playwright**, and **Page Object Model** with **Allure reporting**.

## 🌍 URL Structure
The application supports multiple environments and countries with dynamic URL generation:
- **Format**: `https://<add-base-URL-here>/{country}/{locale}`
- **Environments**: `dev`, `stg`, `prd`
- **Countries**: `de`, `uk`, `us`, `fr`, `ch`, `at`, `it`, `es`, `pl`, etc. (lowercase)
- **Locale**: `{language}-{COUNTRY}` (e.g., `en-DE`, `de-CH`, `fr-FR`)

**Examples**:
- Dev Germany (English): `https://<add-base-URL-here>/de/en-DE`
- Dev Switzerland (German): `https://<add-base-URL-here>/ch/de-CH`

## 🚀 Setup

**Prerequisites:** Node.js 20+, npm 8+

```bash
# Clone and setup
git clone https://github.com/manishleoy2k3/playwright-automation
cd playwright-automation
npm install
npx playwright install

# Setup test credentials (local development)
cp .env.example .env
# Set TEST_USER_PASSWORD in .env
# Set COMMERCETOOLS_BASIC_AUTH when API-based cart cleanup is required
```

## 🧪 Running Tests

```bash
# Basic execution
npm test                    # Run all tests
npm run test:ui            # Interactive UI mode
npm run test:debug         # Debug mode

# Specific browsers
npm run test:chromium      # Chrome only
npm run test:firefox       # Firefox only
npm run test:webkit        # Safari only

# Reports
npm run report             # Playwright report
npm run allure:serve       # Allure report
```

## ✏️ Writing Tests

### Test Structure
```typescript
test('should verify homepage functionality', { tag: ['@[1604752]'] }, async ({ page }) => {
  await test.step('Navigate to home page', async () => {
    const homePage = new HomePage(page);
    await homePage.navigateToHomePage();
  });

  await test.step('Verify page loaded', async () => {
    await homePage.verifyPageLoaded();
  });
});
```

### Page Objects
Create page objects in `src/pages/` extending `BasePage`:

```typescript
export class MyPage extends BasePage {
  private readonly myElement: Locator;

  constructor(page: Page) {
    super(page, '/my-path');
    this.myElement = page.locator('[data-testid="my-element"]');
  }

  async performAction() {
    await this.helper.clickElement(this.myElement);
  }
}
```

### Authentication States
```typescript
// Logged out tests (default)
test.describe('Guest Features', () => {
  // Tests run without authentication
});

// Authenticated tests, currently not in use
test.describe('User Features', () => {
  test.use({ storageState: '../auth-states/user.json' });
  // Tests run with pre-authenticated user
});

// Dynamic authentication
test('login workflow', async ({ page }) => {
  const homePage = new HomePage(page);
  const user = await homePage.getUser('de'); // Note: lowercase country code
  // Handle login within test
});
```

## ⚙️ Configuration

### Environment Variables (.env)
```bash
# Metrology Hardware Store Environment
SITE_ENV=dev            # dev=development, stg=stage, prd=production
SITE_COUNTRY=de         # Country code (lowercase: de, ch, us, uk, etc.)
SITE_LANGUAGE=en        # Language code (lowercase: en, de, fr, etc.)

# Browser settings
HEADED=false            # Show browser
CI=false               # CI mode
```

### User Credentials
- **Email**: Auto-generated from country as `mach.hws.testuser.{country}@yopmail.com`
- **Password**: Shared value from `TEST_USER_PASSWORD` in `.env` (local) and pipeline variables (CI/CD)
- **CommerceTools auth**: Set `COMMERCETOOLS_BASIC_AUTH` when API-based cart cleanup is used

### Azure DevOps Reporter
Tests are automatically published to Azure DevOps Test Plans using [@alex_neo/playwright-azure-reporter](https://www.npmjs.com/package/@alex_neo/playwright-azure-reporter). Configure `TEST_MANAGEMENT_TOKEN` in environment variables to enable integration. Test cases are linked using tags: `{ tag: ['@[TestCaseID]'] }`.

## 💡 Best Practices

### Code Quality
```bash
npm run lint:fix           # Fix linting issues
npm run format            # Format code
npm run type-check        # TypeScript validation
```

### Test Guidelines
- Use `data-testid` attributes for reliable selectors
- Use `this.helper` methods in page objects for element interactions
- Group related tests in `describe` blocks
- Use meaningful test names that describe the behavior being tested

### Project Structure
- **Page Objects**: `src/pages/` - Extend `BasePage`, use `ElementHelper` via `this.helper`
- **Utilities**: `src/utils/` - Shared helper functions and configurations
- **Tests**: `tests/features/` - Feature-based test organization
- **Test Data**: `test-data/` - User credentials and test data (git-ignored)

## 🔧 Troubleshooting

```bash
# Browser issues
npx playwright install --force

# Debug test failures
npm run test:debug

# Skip pre-commit hooks (emergency only)
git commit --no-verify -m "message"
```

---

**Issues**: Create work items in Azure DevOps Boards
