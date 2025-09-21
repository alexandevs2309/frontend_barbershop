#!/usr/bin/env node
/**
 * Test Exhaustivo del Frontend Angular
 * Verificar estado real vs checklist
 */

const fs = require('fs');
const path = require('path');

class FrontendTest {
    constructor() {
        this.results = [];
        this.srcPath = './src';
        this.appPath = './src/app';
    }

    logResult(testName, success, message = "") {
        const status = success ? "✅" : "❌";
        this.results.push({ testName, success, message });
        console.log(`${status} ${testName}: ${message}`);
    }

    fileExists(filePath) {
        return fs.existsSync(filePath);
    }

    readFile(filePath) {
        try {
            return fs.readFileSync(filePath, 'utf8');
        } catch {
            return null;
        }
    }

    searchInFile(filePath, searchTerm) {
        const content = this.readFile(filePath);
        return content ? content.includes(searchTerm) : false;
    }

    countFiles(directory, extension) {
        try {
            const files = fs.readdirSync(directory, { recursive: true });
            return files.filter(file => file.endsWith(extension)).length;
        } catch {
            return 0;
        }
    }

    testAuthenticationSecurity() {
        console.log("\n🔑 AUTENTICACIÓN & SEGURIDAD");

        // Auth Service
        const authServiceExists = this.fileExists(`${this.appPath}/pages/auth/service/auth.service.ts`);
        this.logResult("Auth Service", authServiceExists, authServiceExists ? "Implementado" : "Faltante");

        if (authServiceExists) {
            const authContent = this.readFile(`${this.appPath}/pages/auth/service/auth.service.ts`);
            
            // JWT
            const hasJWT = authContent.includes('JwtHelperService');
            this.logResult("JWT integrado", hasJWT, hasJWT ? "JwtHelperService presente" : "Faltante");

            // Refresh token
            const hasRefresh = authContent.includes('refresh') && authContent.includes('token');
            this.logResult("Refresh token", hasRefresh, hasRefresh ? "Implementado" : "Faltante");

            // Roles
            const hasRoles = authContent.includes('getUserRoles') || authContent.includes('roles');
            this.logResult("Sistema de roles", hasRoles, hasRoles ? "Implementado" : "Faltante");
        }

        // Interceptor
        const interceptorExists = this.fileExists(`${this.appPath}/core/interceptors/jwt.interceptor.ts`);
        this.logResult("JWT Interceptor", interceptorExists, interceptorExists ? "Implementado" : "Faltante");

        // Guards
        const guardExists = this.fileExists(`${this.appPath}/core/guard/auth.guard.ts`);
        this.logResult("Auth Guards", guardExists, guardExists ? "Implementado" : "Faltante");

        if (guardExists) {
            const guardContent = this.readFile(`${this.appPath}/core/guard/auth.guard.ts`);
            const hasRoleGuard = guardContent.includes('allowedRoles') || guardContent.includes('hasRequiredRole');
            this.logResult("Guards por rol", hasRoleGuard, hasRoleGuard ? "Implementado" : "Faltante");
        }
    }

    testArchitectureModularization() {
        console.log("\n🏗 ARQUITECTURA & MODULARIZACIÓN");

        // Estructura modular
        const hasAdminModule = fs.existsSync(`${this.appPath}/pages/admin`);
        const hasClientModule = fs.existsSync(`${this.appPath}/pages/client`);
        const hasAuthModule = fs.existsSync(`${this.appPath}/pages/auth`);
        
        this.logResult("Módulo Admin", hasAdminModule, hasAdminModule ? "Presente" : "Faltante");
        this.logResult("Módulo Client", hasClientModule, hasClientModule ? "Presente" : "Faltante");
        this.logResult("Módulo Auth", hasAuthModule, hasAuthModule ? "Presente" : "Faltante");

        // Lazy loading
        const routesFiles = [
            `${this.appPath}/pages/admin/admin.routes.ts`,
            `${this.appPath}/pages/client/client.routes.ts`,
            `${this.appPath}/pages/auth/auth.routes.ts`
        ];

        let hasLazyLoading = false;
        routesFiles.forEach(file => {
            if (this.fileExists(file)) {
                const content = this.readFile(file);
                if (content && (content.includes('loadChildren') || content.includes('import('))) {
                    hasLazyLoading = true;
                }
            }
        });
        this.logResult("Lazy Loading", hasLazyLoading, hasLazyLoading ? "Implementado" : "Faltante");

        // Interfaces TypeScript
        const modelFiles = this.countFiles(`${this.appPath}`, '.model.ts');
        this.logResult("Interfaces/Modelos", modelFiles > 5, `${modelFiles} archivos .model.ts`);

        // Shared utilities
        const hasShared = fs.existsSync(`${this.appPath}/shared`);
        this.logResult("Shared Module", hasShared, hasShared ? "Presente" : "Faltante");
    }

    testUIUXResponsiveness() {
        console.log("\n🎨 UI/UX & RESPONSIVIDAD");

        // PrimeNG
        const packageJson = this.readFile('./package.json');
        const hasPrimeNG = packageJson && packageJson.includes('primeng');
        this.logResult("PrimeNG", hasPrimeNG, hasPrimeNG ? "Instalado" : "Faltante");

        // Tailwind
        const hasTailwind = packageJson && packageJson.includes('tailwindcss');
        this.logResult("Tailwind CSS", hasTailwind, hasTailwind ? "Instalado" : "Faltante");

        // Layout components
        const layoutComponents = this.countFiles(`${this.appPath}/layout`, '.ts');
        this.logResult("Componentes Layout", layoutComponents > 5, `${layoutComponents} componentes`);

        // Responsive utilities
        const hasResponsive = this.fileExists('./tailwind.config.js');
        this.logResult("Configuración responsive", hasResponsive, hasResponsive ? "Tailwind config presente" : "Faltante");
    }

    testBackendIntegration() {
        console.log("\n🔗 INTEGRACIÓN CON BACKEND");

        // Environment
        const envExists = this.fileExists(`${this.srcPath}/environment.ts`);
        this.logResult("Environment config", envExists, envExists ? "Presente" : "Faltante");

        if (envExists) {
            const envContent = this.readFile(`${this.srcPath}/environment.ts`);
            const hasApiUrl = envContent && envContent.includes('apiUrl');
            this.logResult("API URL configurada", hasApiUrl, hasApiUrl ? "Configurada" : "Faltante");
        }

        // Services
        const serviceFiles = this.countFiles(`${this.appPath}`, '.service.ts');
        this.logResult("Services implementados", serviceFiles > 10, `${serviceFiles} services`);

        // HTTP Client usage
        let hasHttpClient = false;
        const servicesDirs = [
            `${this.appPath}/pages/admin`,
            `${this.appPath}/pages/client`,
            `${this.appPath}/pages/auth/service`
        ];

        servicesDirs.forEach(dir => {
            if (fs.existsSync(dir)) {
                const files = fs.readdirSync(dir, { recursive: true });
                files.forEach(file => {
                    if (file.endsWith('.service.ts')) {
                        const content = this.readFile(path.join(dir, file));
                        if (content && content.includes('HttpClient')) {
                            hasHttpClient = true;
                        }
                    }
                });
            }
        });
        this.logResult("HTTP Client integrado", hasHttpClient, hasHttpClient ? "Implementado" : "Faltante");
    }

    testBusinessLogic() {
        console.log("\n🏪 LÓGICA DE NEGOCIO");

        // POS System
        const posExists = fs.existsSync(`${this.appPath}/pages/client/pos`);
        this.logResult("Sistema POS", posExists, posExists ? "Implementado" : "Faltante");

        if (posExists) {
            const posFiles = this.countFiles(`${this.appPath}/pages/client/pos`, '.ts');
            this.logResult("Componentes POS", posFiles > 5, `${posFiles} archivos`);
        }

        // Appointments
        const appointmentsExists = fs.existsSync(`${this.appPath}/pages/client/appointments`);
        this.logResult("Sistema Citas", appointmentsExists, appointmentsExists ? "Implementado" : "Faltante");

        // Employees
        const employeesExists = fs.existsSync(`${this.appPath}/pages/client/employees`);
        this.logResult("Gestión Empleados", employeesExists, employeesExists ? "Implementado" : "Faltante");

        // Earnings
        const earningsExists = fs.existsSync(`${this.appPath}/pages/client/earnings`);
        this.logResult("Sistema Ganancias", earningsExists, earningsExists ? "Implementado" : "Faltante");

        // Inventory
        const inventoryExists = fs.existsSync(`${this.appPath}/pages/client/inventory`);
        this.logResult("Inventario", inventoryExists, inventoryExists ? "Implementado" : "Faltante");

        // Reports
        const reportsExists = fs.existsSync(`${this.appPath}/pages/client/reports`);
        this.logResult("Reportes", reportsExists, reportsExists ? "Implementado" : "Faltante");
    }

    testProductionReadiness() {
        console.log("\n🚀 PREPARACIÓN PARA PRODUCCIÓN");

        // Build configuration
        const angularJson = this.readFile('./angular.json');
        const hasProdConfig = angularJson && angularJson.includes('production');
        this.logResult("Build producción", hasProdConfig, hasProdConfig ? "Configurado" : "Faltante");

        // Environment prod
        const envProdExists = this.fileExists(`${this.srcPath}/environment.prod.ts`);
        this.logResult("Environment prod", envProdExists, envProdExists ? "Presente" : "Faltante");

        // Deployment config
        const vercelExists = this.fileExists('./vercel.json');
        this.logResult("Deploy config", vercelExists, vercelExists ? "Vercel configurado" : "Faltante");

        // Optimization
        const hasOptimization = angularJson && angularJson.includes('optimization');
        this.logResult("Optimización", hasOptimization, hasOptimization ? "Configurada" : "Faltante");
    }

    testTesting() {
        console.log("\n🧪 TESTING");

        // Test files
        const specFiles = this.countFiles(`${this.appPath}`, '.spec.ts');
        this.logResult("Tests unitarios", specFiles > 5, `${specFiles} archivos .spec.ts`);

        // Karma config
        const karmaExists = this.fileExists('./karma.conf.js');
        this.logResult("Karma configurado", karmaExists, karmaExists ? "Presente" : "Faltante");

        // Test scripts
        const packageJson = this.readFile('./package.json');
        const hasTestScript = packageJson && packageJson.includes('"test"');
        this.logResult("Scripts de test", hasTestScript, hasTestScript ? "Configurados" : "Faltante");
    }

    runAllTests() {
        console.log("🧪 TEST EXHAUSTIVO DEL FRONTEND ANGULAR");
        console.log("=" * 60);

        const testSuites = [
            ["Autenticación & Seguridad", () => this.testAuthenticationSecurity()],
            ["Arquitectura & Modularización", () => this.testArchitectureModularization()],
            ["UI/UX & Responsividad", () => this.testUIUXResponsiveness()],
            ["Integración Backend", () => this.testBackendIntegration()],
            ["Lógica de Negocio", () => this.testBusinessLogic()],
            ["Preparación Producción", () => this.testProductionReadiness()],
            ["Testing", () => this.testTesting()]
        ];

        testSuites.forEach(([suiteName, testFunc]) => {
            try {
                testFunc();
            } catch (error) {
                console.log(`❌ Error en ${suiteName}: ${error.message}`);
            }
        });

        this.printSummary();
    }

    printSummary() {
        console.log("\n" + "=".repeat(60));
        console.log("📊 RESUMEN EXHAUSTIVO DEL FRONTEND");
        console.log("=".repeat(60));

        const total = this.results.length;
        const passed = this.results.filter(r => r.success).length;
        const percentage = total > 0 ? (passed / total) * 100 : 0;

        console.log(`📈 ESTADÍSTICAS:`);
        console.log(`   Total pruebas: ${total}`);
        console.log(`   ✅ Exitosas: ${passed}`);
        console.log(`   ❌ Fallidas: ${total - passed}`);
        console.log(`   📊 Porcentaje: ${percentage.toFixed(1)}%`);

        let status;
        if (percentage >= 90) {
            status = "🎉 EXCELENTE - Listo para producción";
        } else if (percentage >= 80) {
            status = "✅ MUY BUENO - Casi listo";
        } else if (percentage >= 70) {
            status = "⚠️ BUENO - Necesita ajustes";
        } else {
            status = "❌ NECESITA TRABAJO - Faltan componentes";
        }

        console.log(`\n🎯 ESTADO FRONTEND: ${status}`);

        // Mostrar fallos
        const failures = this.results.filter(r => !r.success);
        if (failures.length > 0) {
            console.log(`\n❌ ELEMENTOS PENDIENTES:`);
            failures.forEach(failure => {
                console.log(`   • ${failure.testName}: ${failure.message}`);
            });
        }

        // Recomendaciones
        console.log(`\n🎯 PRÓXIMOS PASOS:`);
        if (percentage >= 85) {
            console.log(`   1. Completar elementos pendientes menores`);
            console.log(`   2. Probar integración completa con backend`);
            console.log(`   3. Tests E2E básicos`);
        } else {
            console.log(`   1. Completar componentes faltantes críticos`);
            console.log(`   2. Mejorar integración con backend`);
            console.log(`   3. Implementar manejo de errores`);
        }

        return percentage >= 80;
    }
}

// Ejecutar tests
const tester = new FrontendTest();
const success = tester.runAllTests();
process.exit(success ? 0 : 1);