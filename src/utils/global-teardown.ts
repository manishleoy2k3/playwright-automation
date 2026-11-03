/**
 * Global teardown file for Playwright tests
 * This runs once after all tests complete
 */
async function globalTeardown(): Promise<void> {
  console.log('🧹 Starting global teardown for ZEISS IQS E-commerce tests...');

  await cleanupAuthStates();

  console.log('✅ Global teardown completed');
}

/**
 * Clean up temporary authentication states (only in CI)
 */
async function cleanupAuthStates(): Promise<void> {
  // Only clean auth states in CI environment to avoid interfering with local development
  if (!process.env['CI']) {
    return;
  }

  const fs = await import('fs/promises');
  const path = await import('path');

  try {
    const authStatesDir = path.join(process.cwd(), 'auth-states');
    const files = await fs.readdir(authStatesDir);

    // Clean up .json auth state files (but keep the directory)
    const jsonFiles = files.filter(file => file.endsWith('.json'));

    if (jsonFiles.length > 0) {
      for (const file of jsonFiles) {
        const filePath = path.join(authStatesDir, file);
        await fs.unlink(filePath);
      }
      console.log(`🗑️  Cleaned ${jsonFiles.length} auth state file(s) in CI environment`);
    }
  } catch (error) {
    // Auth states directory doesn't exist or is empty - not an error
  }
}

export default globalTeardown;
