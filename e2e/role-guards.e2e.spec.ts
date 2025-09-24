import { test, expect } from '@playwright/test';

test.describe('Guards de Rol E2E', () => {
  test('debe redirigir a login cuando no hay token', async ({ page }) => {
    // Limpiar localStorage
    await page.addInitScript(() => {
      localStorage.clear();
    });
    
    await page.goto('/admin/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Debe ser redirigido al login o mostrar login
    const isLoginPage = page.url().includes('login') || page.url().includes('auth');
    expect(isLoginPage).toBeTruthy();
  });

  test('debe mostrar página de acceso denegado para rutas protegidas', async ({ page }) => {
    await page.goto('/admin/system-settings');
    await page.waitForLoadState('networkidle');
    
    // Verificar que no accede directamente o es redirigido
    const currentUrl = page.url();
    const isProtected = currentUrl.includes('login') || currentUrl.includes('access') || currentUrl.includes('auth');
    expect(isProtected).toBeTruthy();
  });

  test('debe cargar página de acceso denegado', async ({ page }) => {
    await page.goto('/access');
    await page.waitForLoadState('networkidle');
    
    // Verificar que la página carga
    await expect(page).toHaveTitle(/BarberSaaS|Sakai|Access/);
  });

  test('debe manejar rutas inexistentes', async ({ page }) => {
    await page.goto('/ruta-que-no-existe');
    await page.waitForLoadState('networkidle');
    
    // Verificar que maneja la ruta (404 o redirección)
    const currentUrl = page.url();
    const isHandled = currentUrl.includes('login') || currentUrl.includes('404') || currentUrl.includes('auth');
    expect(isHandled).toBeTruthy();
  });
});