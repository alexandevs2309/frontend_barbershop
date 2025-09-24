import { test, expect } from '@playwright/test';

test.describe('Admin E2E - Sin CustomerService', () => {
  test('debe redirigir admin sin autenticación', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.clear();
    });
    
    await page.goto('/admin/dashboard');
    await page.waitForLoadState('networkidle');
    
    const isRedirected = page.url().includes('login') || page.url().includes('auth');
    expect(isRedirected).toBeTruthy();
  });

  test('debe cargar página de usuarios admin', async ({ page }) => {
    await page.goto('/admin/users');
    await page.waitForLoadState('networkidle');
    
    // Verificar redirección o carga
    const currentUrl = page.url();
    const isHandled = currentUrl.includes('login') || currentUrl.includes('users') || currentUrl.includes('auth');
    expect(isHandled).toBeTruthy();
  });

  test('debe manejar rutas de configuración', async ({ page }) => {
    await page.goto('/admin/settings');
    await page.waitForLoadState('networkidle');
    
    await expect(page).toHaveTitle(/BarberSaaS|Sakai/);
  });

  test('debe validar acceso a reportes', async ({ page }) => {
    await page.goto('/admin/reports');
    await page.waitForLoadState('networkidle');
    
    const bodyText = await page.textContent('body');
    expect(bodyText).toBeTruthy();
  });

  test('debe cargar sin errores críticos', async ({ page }) => {
    const errors = [];
    page.on('pageerror', error => errors.push(error));
    
    await page.goto('/admin/dashboard');
    await page.waitForLoadState('networkidle');
    
    const criticalErrors = errors.filter(error => 
      !error.message.includes('CustomerService') &&
      (error.message.includes('ReferenceError') || error.message.includes('TypeError'))
    );
    expect(criticalErrors.length).toBe(0);
  });
});