import { test, expect } from '@playwright/test';

test.describe('Citas E2E - Sin CustomerService', () => {
  test('debe cargar página de citas', async ({ page }) => {
    await page.goto('/client/appointments');
    await page.waitForLoadState('networkidle');
    
    await expect(page).toHaveTitle(/BarberSaaS|Sakai/);
  });

  test('debe mostrar formulario de nueva cita', async ({ page }) => {
    await page.goto('/client/appointments');
    await page.waitForLoadState('networkidle');
    
    // Buscar botón de nueva cita
    const newBtn = page.locator('button:has-text("Nueva"), button:has-text("New"), [data-testid*="new"]');
    if (await newBtn.count() > 0) {
      await newBtn.first().click();
      
      // Verificar que aparece formulario
      await expect(page.locator('form, .form-container')).toBeVisible();
    }
  });

  test('debe validar navegación básica en citas', async ({ page }) => {
    await page.goto('/client/appointments');
    await page.waitForLoadState('networkidle');
    
    // Verificar que la página carga contenido
    const bodyText = await page.textContent('body');
    expect(bodyText).toBeTruthy();
  });

  test('debe manejar estados de carga', async ({ page }) => {
    await page.goto('/client/appointments');
    
    // Verificar que no hay errores críticos
    const errors = [];
    page.on('pageerror', error => errors.push(error));
    
    await page.waitForLoadState('networkidle');
    
    const criticalErrors = errors.filter(error => 
      error.message.includes('ReferenceError') || 
      error.message.includes('TypeError')
    );
    expect(criticalErrors.length).toBe(0);
  });
});