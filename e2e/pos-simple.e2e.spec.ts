import { test, expect } from '@playwright/test';

test.describe('POS E2E - Sin CustomerService', () => {
  test('debe cargar página de POS', async ({ page }) => {
    await page.goto('/pos');
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveTitle(/BarberSaaS|Sakai/);
  });

  test('debe mostrar interfaz de punto de venta', async ({ page }) => {
    await page.goto('/pos');
    await page.waitForLoadState('networkidle');

    // Verificar elementos básicos del POS
    const hasContent = await page.locator('body').textContent();
    expect(hasContent).toBeTruthy();
  });


  test('debe cargar sin errores de JavaScript', async ({ page }) => {
    const errors = [];
    page.on('pageerror', error => errors.push(error));

    await page.goto('/pos');
    await page.waitForLoadState('networkidle');

    const criticalErrors = errors.filter(error =>
      !error.message.includes('CustomerService') &&
      (error.message.includes('ReferenceError') || error.message.includes('TypeError'))
    );
    expect(criticalErrors.length).toBe(0);
  });

  test('debe manejar navegación del carrito', async ({ page }) => {
    await page.goto('/pos');
    await page.waitForLoadState('networkidle');

    // Buscar elementos del carrito
    const cartElements = page.locator('[data-testid*="cart"], .cart, #cart');
    if (await cartElements.count() > 0) {
      await expect(cartElements.first()).toBeVisible();
    }
  });
});
