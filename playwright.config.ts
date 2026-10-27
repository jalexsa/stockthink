import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './self-improvement/browser',
  testMatch: '**/*.e2e.ts',
  workers: 1,
  timeout: 120_000,
  expect: { timeout: 15_000 },
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://127.0.0.1:5173',
    reducedMotion: 'reduce',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    // Use the host's native renderer; SwiftShader can saturate Windows CPUs.
    // Linux/VM runs without GPU passthrough can explicitly opt into it.
    launchOptions: { args: process.env.STOCKTHINK_SOFTWARE_GL === '1'
      ? ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] : [] },
  },
  projects: [
    { name: 'desktop', use: { viewport: { width: 1440, height: 1000 } } },
    { name: 'mobile', use: { ...devices['Pixel 5'] } },
  ],
  webServer: {
    command: 'npm run dev -- --host 127.0.0.1 --port 5173 --strictPort',
    url: 'http://127.0.0.1:5173/app.html',
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
