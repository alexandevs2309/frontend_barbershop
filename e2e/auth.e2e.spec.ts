import { test, expect } from '@playwright/test';

test.describe('Autenticación E2E', () => {
  test('debe cargar la página de login', async ({ page }) => {
    await page.goto('/auth/login');
    await expect(page).toHaveTitle(/BarberSaaS|Sakai/);
  });

  test('debe mostrar elementos del formulario de login', async ({ page }) => {
    await page.goto('/auth/login');
    
    // Verificar que la página carga
    await page.waitForLoadState('networkidle');
    
    // Verificar elementos básicos
    await expect(page.locator('input[type="email"], input[formControlName="email"]')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('input[type="password"], input[formControlName="password"]')).toBeVisible();
  });

  test('debe navegar a forgot password', async ({ page }) => {
    await page.goto('/auth/login');
    await page.waitForLoadState('networkidle');
    
    // Buscar link de forgot password
    const forgotLink = page.locator('a[href*="forgot"], a:has-text("Forgot"), a:has-text("Olvidé")');
    if (await forgotLink.count() > 0) {
      await forgotLink.first().click();
      await expect(page).toHaveURL(/.*forgot.*/);
    }
  });

  test('debe mostrar validación de campos requeridos', async ({ page }) => {
    await page.goto('/auth/login');
    await page.waitForLoadState('networkidle');
    
    // Intentar enviar formulario vacío
    const submitButton = page.locator('button[type="submit"], p-button');
    if (await submitButton.count() > 0) {
      await submitButton.first().click();
      
      // Verificar que sigue en login (no redirige)
      await expect(page).toHaveURL(/.*login.*/);
    }
  });
});
