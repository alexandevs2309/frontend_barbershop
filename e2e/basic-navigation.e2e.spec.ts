import { test, expect } from '@playwright/test';

test.describe('Navegación Básica E2E', () => {
  test('debe cargar la página principal', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Verificar que la página carga
    await expect(page).toHaveTitle(/BarberSaaS|Sakai/);
  });

  test('debe mostrar elementos básicos de la aplicación', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Verificar que hay contenido en la página
    const bodyText = await page.textContent('body');
    expect(bodyText).toBeTruthy();
    expect(bodyText.length).toBeGreaterThan(0);
  });

  test('debe cargar estilos CSS correctamente', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Verificar que los estilos se cargan
    const stylesheets = await page.locator('link[rel="stylesheet"]').count();
    expect(stylesheets).toBeGreaterThan(0);
  });

  test('debe cargar JavaScript sin errores críticos', async ({ page }) => {
    const errors = [];
    page.on('pageerror', error => errors.push(error));
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Verificar que no hay errores críticos de JavaScript
    const criticalErrors = errors.filter(error => 
      error.message.includes('ReferenceError') || 
      error.message.includes('TypeError')
    );
    expect(criticalErrors.length).toBe(0);
  });
});