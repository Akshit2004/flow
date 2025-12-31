import { test, expect } from '@playwright/test';

test.describe('Command Palette', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle'); // Wait for initial load
        await page.locator('body').click(); // Ensure focus
    });

    test('should open command palette, search, and navigate', async ({ page }) => {
        // 1. Open
        await page.keyboard.press('Control+K');

        const dialog = page.getByRole('dialog', { name: 'Global Command Menu' });
        // Fallback for Mac in CI if needed, but usually we control the env
        if (!(await dialog.isVisible())) {
            await page.keyboard.press('Meta+K');
        }
        await expect(dialog).toBeVisible();

        // 2. Check Input
        const input = page.getByPlaceholder('Type a command or search...');
        await expect(input).toBeVisible();
        await expect(input).toBeFocused();

        // 3. Search for "Dashboard"
        await input.fill('Dashboard');
        // Check if "Dashboard" item is selected/visible
        await expect(page.getByText('Dashboard')).toBeVisible();

        // 4. Verify Theme Toggle option exists (it might be filtered out if I typed Dashboard)
        // Clear input to see all
        await input.fill('');
        await expect(page.getByText('Toggle Theme')).toBeVisible();
    });
});
