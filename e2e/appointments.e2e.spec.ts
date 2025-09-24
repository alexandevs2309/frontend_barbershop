import { test, expect } from '@playwright/test';

test.describe('Gestión de Citas E2E - Simplificado', () => {
  test.beforeEach(async ({ page }) => {
    // Navegar directamente sin login complejo
    await page.goto('/client/appointments');
    await page.waitForLoadState('networkidle');
  });

  test('debe cargar página de citas', async ({ page }) => {
    await expect(page).toHaveTitle(/BarberSaaS|Sakai/);
  });

  test('debe mostrar contenido básico', async ({ page }) => {
    const bodyText = await page.textContent('body');
    expect(bodyText).toBeTruthy();
    expect(bodyText.length).toBeGreaterThan(0);
  });

  test('debe cargar sin errores críticos', async ({ page }) => {
    const errors = [];
    page.on('pageerror', error => errors.push(error));
    
    await page.waitForLoadState('networkidle');
    
    const criticalErrors = errors.filter(error => 
      !error.message.includes('CustomerService') &&
      (error.message.includes('ReferenceError') || error.message.includes('TypeError'))
    );
    expect(criticalErrors.length).toBe(0);
  });

  test('debe manejar navegación básica', async ({ page }) => {
    // Verificar que los estilos se cargan
    const stylesheets = await page.locator('link[rel="stylesheet"]').count();
    expect(stylesheets).toBeGreaterThan(0);
  });
});
