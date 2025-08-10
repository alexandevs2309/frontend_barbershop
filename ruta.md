            🧭 Hoja de Ruta: Módulos del Frontend y Orden de Desarrollo
            ✅ Etapa 1. Base de seguridad y navegación
            [✔] Autenticación básica (/login)

            Login funcional con JWT

            Almacenamiento seguro de tokens

            Redirección si no está autenticado

            🔒 Guardias de rutas (ya iniciado)

            AuthGuard: proteger rutas privadas

            Redirigir a /login si no hay sesión válida

            Expiración automática del token

            🔐 Logout

            Botón funcional para cerrar sesión y redirigir a login

            Limpiar localStorage

            🔁 Interceptor de tokens

            Ya tienes uno: asegúrate de enviar Authorization: Bearer <token> en cada request

            ❌ Página 404 y rutas no existentes

            Ya configurada en rutas (path: '**'), solo prueba visualmente

            ✳️ Etapa 2. Módulo de Recuperación y Registro
            🔁 Forgot password + Reset password

            Página pública /forgot-password

            Envío de email + formulario de nueva contraseña

            Manejo de tokens temporales (validar vía backend)

            🆕 Registro de usuarios (opcional si se hace desde admin)

            Página de registro con campos mínimos

            Envío de token si es requerido (email verification)

            🧑‍💼 Etapa 3. Panel del Cliente (peluquería)
            🏠 Dashboard de usuario logueado

            Sidebar funcional

            Bienvenida personalizada con nombre

            Cards resumen (citas hoy, clientes, etc.)

            ✂️ Módulo de empleados

            Listar empleados

            Crear, editar, eliminar empleados

            Asignar roles si tu backend lo permite

            📆 Módulo de citas/reservas

            Calendario con disponibilidad

            Crear y gestionar citas con clientes

            Filtro por fechas

            👥 Clientes

            Listado y ficha de cliente

            Crear cliente con historial

            📈 Reportes

            Reportes por fecha, empleados, servicios

            Gráficas (puedes usar Chart.js o PrimeNG charts)

            ⚙️ Configuración del negocio

            Nombre del negocio, logo, email, horario

            Cambiar contraseña

            🧑‍⚖️ Etapa 4. Panel del Dueño del SaaS (Administrador Global)
            🧑‍💼 Panel Admin General

            Vista general de cuentas activas

            Total de ingresos, número de peluquerías, etc.

            📦 Gestión de suscripciones

            Ver/editar/eliminar suscripciones activas

            Crear planes nuevos

            📊 Métricas del sistema

            Gráficas: usuarios nuevos por semana, ingresos por mes

            🚫 Desactivación de cuentas

            Botón para suspender peluquerías en impago

            Confirmaciones con alertas visuales

            🔚 Etapa Final. Experiencia, pruebas y extras
            🎨 Personalización y diseño final

            Revisión del tema, responsividad

            Corrección visual con base en Sakai

            🧪 Tests visuales y funcionales

            Probar expiración, redirecciones, errores 403/404

            Testear móviles, tablets y navegadores

            📃 Documentación y onboarding

            Explicaciones internas: cómo crear cuenta, cómo navegar

            Glosario o ayuda dentro del sistema


