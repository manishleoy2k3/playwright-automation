/**
 * Global setup file for Playwright tests
 * This runs once before all tests
 */
async function globalSetup(): Promise<void> {
  console.log('🚀 Starting global setup for ZEISS IQS E-commerce tests...');

  displayEnvironmentInfo();

  await createEssentialDirectories();

  console.log('✅ Global setup completed');
}

/**
 * Display current environment configuration
 */
function displayEnvironmentInfo(): void {
  const env = process.env['SITE_ENV'] || 'dev';
  const country = process.env['SITE_COUNTRY'] || 'de';
  const language = process.env['SITE_LANGUAGE'] || 'en';

  console.log(`🌍 Environment: ${env.toUpperCase()}-system`);
  console.log(`🏳️  Country: ${country}`);
  console.log(`🗣️  Language: ${language}`);
}

/**
 * Create essential directories that won't be auto-created
 */
async function createEssentialDirectories(): Promise<void> {
  const fs = await import('fs/promises');
  const path = await import('path');
  const directories = ['screenshots', 'auth-states'];

  for (const dir of directories) {
    const dirPath = path.join(process.cwd(), dir);
    try {
      await fs.access(dirPath);
    } catch {
      await fs.mkdir(dirPath, { recursive: true });
      console.log(`📁 Created directory: ${dir}`);
    }
  }
}

export default globalSetup;
