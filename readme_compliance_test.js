#!/usr/bin/env node
/**
 * Test de Cumplimiento con README_SaaS_Peluquerias_2025.md
 * Verificar si el frontend implementa todo lo prometido
 */

const fs = require('fs');
const path = require('path');

class ReadmeComplianceTest {
    constructor() {
        this.results = [];
        this.appPath = './src/app';
    }

    logResult(testName, success, message = "", priority = "normal") {
        const status = success ? "✅" : "❌";
        const priorityIcon = priority === "critical" ? "🔥" : priority === "important" ? "⚡" : "📋";
        this.results.push({ testName, success, message, priority });
        console.log(`${status} ${priorityIcon} ${testName}: ${message}`);
    }

    fileExists(filePath) {
        return fs.existsSync(filePath);
    }

    searchInFile(filePath, searchTerm) {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            return content.includes(searchTerm);
        } catch {
            return false;
        }
    }

    countFiles(directory, extension) {
        try {
            const files = fs.readdirSync(directory, { recursive: true });
            return files.filter(file => file.endsWith(extension)).length;
        } catch {
            return 0;
        }
    }

    testArchitectureCompliance() {
        console.log("\n🧱 ARQUITECTURA SEGÚN README");

        // Angular 19 + PrimeNG + Sakai
        const packageJson = fs.readFileSync('./package.json', 'utf8');
        const hasAngular19 = packageJson.includes('"@angular/core": "^19');
        const hasPrimeNG = packageJson.includes('primeng');
        const hasSakai = packageJson.includes('sakai') || this.fileExists(`${this.appPath}/layout`);

        this.logResult("Angular 19", hasAngular19, hasAngular19 ? "Versión correcta" : "Versión incorrecta", "critical");
        this.logResult("PrimeNG", hasPrimeNG, hasPrimeNG ? "Instalado" : "Faltante", "critical");
        this.logResult("Plantilla Sakai", hasSakai, hasSakai ? "Implementada" : "Faltante", "critical");

        // JWT + Roles + CORS
        const hasJWT = this.searchInFile(`${this.appPath}/pages/auth/service/auth.service.ts`, 'JwtHelperService');
        const hasRoles = this.searchInFile(`${this.appPath}/pages/auth/service/auth.service.ts`, 'getUserRoles');
        
        this.logResult("JWT implementado", hasJWT, hasJWT ? "JwtHelperService presente" : "Faltante", "critical");
        this.logResult("Sistema de roles", hasRoles, hasRoles ? "Implementado" : "Faltante", "critical");
    }

    testRolesCompliance() {
        console.log("\n🗂️ ROLES DEFINIDOS SEGÚN README");

        const authService = `${this.appPath}/pages/auth/service/auth.service.ts`;
        
        // Verificar roles específicos del README
        const expectedRoles = ['Super-Admin', 'Soporte', 'Client-Admin', 'Client-Staff'];
        
        expectedRoles.forEach(role => {
            const hasRole = this.searchInFile(authService, role) || 
                           this.searchInFile(authService, role.replace('-', ''));
            this.logResult(`Rol ${role}`, hasRole, hasRole ? "Implementado" : "Faltante", "important");
        });

        // Verificar rutas por rol
        const hasAdminRoutes = this.fileExists(`${this.appPath}/pages/admin`);
        const hasDashboardRoutes = this.fileExists(`${this.appPath}/pages/client`) || 
                                  this.fileExists(`${this.appPath}/pages/dashboard`);

        this.logResult("Rutas /admin", hasAdminRoutes, hasAdminRoutes ? "SuperAdmin implementado" : "Faltante", "important");
        this.logResult("Rutas /dashboard", hasDashboardRoutes, hasDashboardRoutes ? "Cliente implementado" : "Faltante", "important");
    }

    testEtapa4PanelCliente() {
        console.log("\n⏳ ETAPA 4 - PANEL DEL CLIENTE (MVP)");

        // Gestión de empleados
        const hasEmployees = this.fileExists(`${this.appPath}/pages/client/employees`);
        this.logResult("Gestión empleados", hasEmployees, hasEmployees ? "/dashboard/employees implementado" : "Faltante", "critical");

        // Agenda / Citas
        const hasAppointments = this.fileExists(`${this.appPath}/pages/client/appointments`);
        this.logResult("Agenda/Citas", hasAppointments, hasAppointments ? "/dashboard/appointments implementado" : "Faltante", "critical");

        // Caja / POS
        const hasPOS = this.fileExists(`${this.appPath}/pages/client/pos`);
        this.logResult("Sistema POS", hasPOS, hasPOS ? "/dashboard/pos implementado" : "Faltante", "critical");

        // Earnings por quincena (funcionalidad estrella)
        const hasEarnings = this.fileExists(`${this.appPath}/pages/client/earnings`);
        this.logResult("Ganancias quincena", hasEarnings, hasEarnings ? "Funcionalidad estrella implementada" : "Faltante", "critical");

        if (hasPOS) {
            const posFiles = this.countFiles(`${this.appPath}/pages/client/pos`, '.ts');
            this.logResult("Componentes POS", posFiles >= 5, `${posFiles} archivos (complejo)`, "important");
        }
    }

    testEarningsStarFeature() {
        console.log("\n🔔 FUNCIONALIDAD ESTRELLA - GANANCIAS POR QUINCENA");

        const earningsPath = `${this.appPath}/pages/client/earnings`;
        
        if (this.fileExists(earningsPath)) {
            // Verificar componentes de earnings
            const hasEarningsComponent = this.fileExists(`${earningsPath}/earnings.component.ts`);
            const hasEarningsService = this.fileExists(`${earningsPath}/earnings.service.ts`);
            
            this.logResult("Componente earnings", hasEarningsComponent, hasEarningsComponent ? "Implementado" : "Faltante", "critical");
            this.logResult("Service earnings", hasEarningsService, hasEarningsService ? "Implementado" : "Faltante", "critical");

            // Verificar funcionalidades específicas del README
            if (hasEarningsService) {
                const serviceContent = fs.readFileSync(`${earningsPath}/earnings.service.ts`, 'utf8');
                
                const hasFortnightEarnings = serviceContent.includes('fortnight') || serviceContent.includes('quincena');
                const hasCurrentEarnings = serviceContent.includes('current') || serviceContent.includes('my_earnings');
                
                this.logResult("Consulta quincena", hasFortnightEarnings, hasFortnightEarnings ? "Implementado" : "Faltante", "critical");
                this.logResult("Ganancias actuales", hasCurrentEarnings, hasCurrentEarnings ? "Implementado" : "Faltante", "critical");
            }
        } else {
            this.logResult("Funcionalidad estrella", false, "Earnings por quincena NO implementado", "critical");
        }

        // Verificar notificaciones (toast/WebSocket)
        const hasNotifications = this.fileExists(`${this.appPath}/pages/client/pos`) && 
                                this.searchInFile(`${this.appPath}/pages/client/pos/pos.component.ts`, 'notification');
        
        this.logResult("Notificaciones automáticas", hasNotifications, hasNotifications ? "Toast implementado" : "Faltante", "important");
    }

    testEtapa5Pagos() {
        console.log("\n🧾 ETAPA 5 - PAGOS Y SUSCRIPCIONES");

        // Verificar si hay componentes de pagos
        const hasPayments = this.fileExists(`${this.appPath}/pages/admin/plans`) || 
                           this.searchInFile(`${this.appPath}/pages/auth/service/auth.service.ts`, 'subscription');

        this.logResult("Integración pagos", hasPayments, hasPayments ? "Base implementada" : "Faltante", "important");

        // Verificar planes y suscripciones
        const hasPlans = this.fileExists(`${this.appPath}/pages/admin/plans`);
        this.logResult("Gestión planes", hasPlans, hasPlans ? "CRUD planes implementado" : "Faltante", "important");
    }

    testEtapa6Reportes() {
        console.log("\n📊 ETAPA 6 - REPORTES + OPERACIÓN");

        const hasReports = this.fileExists(`${this.appPath}/pages/client/reports`) || 
                          this.fileExists(`${this.appPath}/pages/admin/reports`);
        
        this.logResult("Sistema reportes", hasReports, hasReports ? "Implementado" : "Faltante", "important");

        // Auditoría
        const hasAudit = this.fileExists(`${this.appPath}/pages/admin/audit-log`);
        this.logResult("Auditoría acciones", hasAudit, hasAudit ? "Implementado" : "Faltante", "normal");
    }

    testBusinessLogicCompliance() {
        console.log("\n🏪 LÓGICA DE NEGOCIO COMPLETA");

        const businessModules = [
            { path: `${this.appPath}/pages/client/clients`, name: "Gestión clientes" },
            { path: `${this.appPath}/pages/client/services`, name: "Catálogo servicios" },
            { path: `${this.appPath}/pages/client/inventory`, name: "Inventario" },
            { path: `${this.appPath}/pages/admin/tenants`, name: "Multitenancy" },
            { path: `${this.appPath}/pages/admin/users`, name: "Gestión usuarios" },
        ];

        businessModules.forEach(module => {
            const exists = this.fileExists(module.path);
            this.logResult(module.name, exists, exists ? "Implementado" : "Faltante", "important");
        });
    }

    testVersion2Readiness() {
        console.log("\n🚀 PREPARACIÓN PARA VERSIÓN 2.0");

        // Notificaciones inteligentes
        const hasNotificationSystem = this.fileExists(`${this.appPath}/pages/client/notifications`) ||
                                     this.searchInFile(`${this.appPath}/layout`, 'notification');
        
        this.logResult("Base notificaciones", hasNotificationSystem, hasNotificationSystem ? "Preparado" : "Faltante", "normal");

        // Sistema de configuración
        const hasSettings = this.fileExists(`${this.appPath}/pages/client/settings`);
        this.logResult("Sistema configuración", hasSettings, hasSettings ? "Implementado" : "Faltante", "normal");

        // Preparación para móvil (responsive)
        const hasTailwind = fs.readFileSync('./package.json', 'utf8').includes('tailwindcss');
        this.logResult("Responsive (móvil)", hasTailwind, hasTailwind ? "Tailwind configurado" : "Faltante", "normal");
    }

    runComplianceTest() {
        console.log("📋 TEST DE CUMPLIMIENTO CON README");
        console.log("Verificando si el frontend implementa TODO lo prometido");
        console.log("=" * 70);

        const testSuites = [
            ["Arquitectura", () => this.testArchitectureCompliance()],
            ["Roles Definidos", () => this.testRolesCompliance()],
            ["Etapa 4 - Panel Cliente", () => this.testEtapa4PanelCliente()],
            ["Funcionalidad Estrella", () => this.testEarningsStarFeature()],
            ["Etapa 5 - Pagos", () => this.testEtapa5Pagos()],
            ["Etapa 6 - Reportes", () => this.testEtapa6Reportes()],
            ["Lógica de Negocio", () => this.testBusinessLogicCompliance()],
            ["Preparación V2.0", () => this.testVersion2Readiness()]
        ];

        testSuites.forEach(([suiteName, testFunc]) => {
            try {
                testFunc();
            } catch (error) {
                console.log(`❌ Error en ${suiteName}: ${error.message}`);
            }
        });

        this.printComplianceSummary();
    }

    printComplianceSummary() {
        console.log("\n" + "=".repeat(70));
        console.log("📊 RESUMEN DE CUMPLIMIENTO CON README");
        console.log("=".repeat(70));

        const total = this.results.length;
        const passed = this.results.filter(r => r.success).length;
        const critical = this.results.filter(r => r.priority === "critical");
        const criticalPassed = critical.filter(r => r.success).length;
        
        const percentage = total > 0 ? (passed / total) * 100 : 0;
        const criticalPercentage = critical.length > 0 ? (criticalPassed / critical.length) * 100 : 0;

        console.log(`📈 ESTADÍSTICAS GENERALES:`);
        console.log(`   Total verificaciones: ${total}`);
        console.log(`   ✅ Cumplidas: ${passed}`);
        console.log(`   ❌ Faltantes: ${total - passed}`);
        console.log(`   📊 Cumplimiento: ${percentage.toFixed(1)}%`);

        console.log(`\n🔥 FUNCIONALIDADES CRÍTICAS:`);
        console.log(`   Total críticas: ${critical.length}`);
        console.log(`   ✅ Implementadas: ${criticalPassed}`);
        console.log(`   📊 Cumplimiento crítico: ${criticalPercentage.toFixed(1)}%`);

        let status;
        if (criticalPercentage >= 90 && percentage >= 85) {
            status = "🎉 EXCELENTE - Cumple completamente con el README";
        } else if (criticalPercentage >= 80 && percentage >= 75) {
            status = "✅ MUY BUENO - Cumple la mayoría del README";
        } else if (criticalPercentage >= 60 && percentage >= 60) {
            status = "⚠️ BUENO - Cumple parcialmente el README";
        } else {
            status = "❌ INSUFICIENTE - No cumple con el README";
        }

        console.log(`\n🎯 VEREDICTO: ${status}`);

        // Mostrar faltantes críticos
        const criticalFailures = this.results.filter(r => r.priority === "critical" && !r.success);
        if (criticalFailures.length > 0) {
            console.log(`\n🔥 FUNCIONALIDADES CRÍTICAS FALTANTES:`);
            criticalFailures.forEach(failure => {
                console.log(`   • ${failure.testName}: ${failure.message}`);
            });
        }

        // Mostrar faltantes importantes
        const importantFailures = this.results.filter(r => r.priority === "important" && !r.success);
        if (importantFailures.length > 0) {
            console.log(`\n⚡ FUNCIONALIDADES IMPORTANTES FALTANTES:`);
            importantFailures.forEach(failure => {
                console.log(`   • ${failure.testName}: ${failure.message}`);
            });
        }

        console.log(`\n📋 CONCLUSIÓN:`);
        if (criticalPercentage >= 90) {
            console.log(`   El frontend CUMPLE con las promesas del README`);
            console.log(`   Todas las funcionalidades críticas están implementadas`);
            console.log(`   El SaaS está listo según la especificación`);
        } else {
            console.log(`   El frontend NO cumple completamente con el README`);
            console.log(`   Faltan funcionalidades críticas prometidas`);
            console.log(`   Se necesita más desarrollo para cumplir la especificación`);
        }

        return criticalPercentage >= 80 && percentage >= 75;
    }
}

// Ejecutar test
const tester = new ReadmeComplianceTest();
const success = tester.runComplianceTest();
process.exit(success ? 0 : 1);