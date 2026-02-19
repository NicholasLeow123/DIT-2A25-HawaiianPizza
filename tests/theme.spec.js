/* code for the dark/light theme toggle test, assisted by ai*/
const { test, expect } = require('@playwright/test');

test.describe('Theme Switching', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
  });

  test('defaults to dark theme with neon accents', async ({ page }) => {
    await page.goto('/');
    
    const theme = await page.getAttribute('html', 'data-theme');
    expect(theme).toBe('dark');
    
    // Check dark background is applied
    const bgColor = await page.evaluate(() => {
      return getComputedStyle(document.body).getPropertyValue('--bg-main');
    });
    expect(bgColor.trim()).toBe('#020617');
  });

  test('toggles to light theme when button clicked', async ({ page }) => {
    await page.goto('/');
    
    await page.click('#theme-toggle');
    
    const theme = await page.getAttribute('html', 'data-theme');
    expect(theme).toBe('light');
    
    // Verify light theme variables
    const bgColor = await page.evaluate(() => {
      return getComputedStyle(document.body).getPropertyValue('--bg-main');
    });
    expect(bgColor.trim()).toBe('#f8fafc');
  });

  test('toggles back to dark theme', async ({ page }) => {
    await page.goto('/');
    
    await page.click('#theme-toggle');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    
    await page.click('#theme-toggle');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  });

  test('updates icon when toggling', async ({ page }) => {
    await page.goto('/');
    
    let icon = await page.textContent('#theme-icon');
    expect(icon).toBe('☀️'); // dark mode shows sun
    
    await page.click('#theme-toggle');
    
    icon = await page.textContent('#theme-icon');
    expect(icon).toBe('🌙'); // light mode shows moon
  });

  test('persists theme preference', async ({ page }) => {
    await page.goto('/');
    await page.click('#theme-toggle');
    
    const stored = await page.evaluate(() => localStorage.getItem('theme'));
    expect(stored).toBe('light');
  });

  test('restores theme after reload', async ({ page }) => {
    await page.goto('/');
    await page.click('#theme-toggle');
    
    await page.reload();
    
    const theme = await page.getAttribute('html', 'data-theme');
    expect(theme).toBe('light');
    
    const icon = await page.textContent('#theme-icon');
    expect(icon).toBe('🌙');
  });

  test('applies theme before render (no flash)', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.setItem('theme', 'light'));
    
    await page.goto('/');
    
    const theme = await page.getAttribute('html', 'data-theme');
    expect(theme).toBe('light');
  });

  test('maintains neon accents in both themes', async ({ page }) => {
    await page.goto('/');
    
    // Check dark theme accent
    let accent = await page.evaluate(() => {
      return getComputedStyle(document.documentElement).getPropertyValue('--accent-primary');
    });
    expect(accent.trim()).toBe('#00f5ff');
    
    // Toggle to light
    await page.click('#theme-toggle');
    
    // Check light theme has adjusted accent
    accent = await page.evaluate(() => {
      return getComputedStyle(document.documentElement).getPropertyValue('--accent-primary');
    });
    expect(accent.trim()).toBe('#0891b2');
  });

  test('theme toggle button is accessible', async ({ page }) => {
    await page.goto('/');
    
    const button = page.locator('#theme-toggle');
    await expect(button).toHaveAttribute('aria-label', 'Toggle theme');
    
    // Test keyboard navigation
    await button.focus();
    await page.keyboard.press('Enter');
    
    const theme = await page.getAttribute('html', 'data-theme');
    expect(theme).toBe('light');
  });

  test('navbar styling updates with theme', async ({ page }) => {
    await page.goto('/');
    
    // Check navbar in dark mode
    let navBg = await page.locator('.navbar').evaluate(el => {
      return window.getComputedStyle(el).getPropertyValue('background-image');
    });
    expect(navBg).toContain('linear-gradient');
    
    // Toggle to light mode
    await page.click('#theme-toggle');
    
    // Navbar should update
    navBg = await page.locator('.navbar').evaluate(el => {
      return window.getComputedStyle(el).getPropertyValue('background-image');
    });
    expect(navBg).toContain('linear-gradient');
  });
});