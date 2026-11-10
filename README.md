# StockYa

Tu tienda en el bolsillo: registra productos, vende en pocos toques y mantén el stock bajo control. StockYa incluye inventario por negocio, alertas visuales, ventas rápidas, reposición compartible y un resumen diario de ventas y ganancia aproximada.

## Requisitos

- Node.js y npm
- Proyecto de Supabase
- Android Studio para generar e instalar el build de desarrollo Android (o configurar Expo EAS para compilar en la nube)

## Arquitectura

El código sigue la estructura FSD del proyecto de referencia. `app/` conserva rutas delgadas de Expo Router y delega cada pantalla en `src/pages/`:

- `src/app/providers/`: sesión, guard de acceso y layouts de navegación.
- `src/pages/`: pantallas de inicio, autenticación, inventario, caja y ventas.
- `src/entities/`: modelos y acceso a datos de negocio, sesión, inventario y ventas.
- `src/features/`: flujos de autenticación y gestión de productos, negocios y caja.
- `src/widgets/`: encabezado y secciones compuestas del dashboard.
- `src/shared/`: interfaz reutilizable, utilidades, tipos y configuración compartidos.
- `apps/web/`: sitio independiente de confirmación y recuperación de cuenta.

## Ejecutar

1. Instala las dependencias:

   ```bash
   npm install
   ```

2. Copia `.env.example` a `.env` y completa la URL y la clave publicable de tu proyecto Supabase. Es un solo `.env` para Expo y la web; consulta [`apps/web/README.md`](./apps/web/README.md) si ya configuraste también variables `VITE_...`.
3. En un proyecto Supabase nuevo, abre **SQL Editor**, pega y ejecuta [`supabase/schema.sql`](./supabase/schema.sql). Si ya tienes StockYa instalado en Supabase, no vuelvas a ejecutar todo el esquema: ejecuta una vez [`supabase/migrations/20261110000000_sales_category_snapshot.sql`](./supabase/migrations/20261110000000_sales_category_snapshot.sql) para guardar la categoría en cada nueva venta y habilitar el ranking histórico.
4. Inicia Expo:

   ```bash
   npx expo start
   ```

El inicio de sesión con correo y contraseña funciona en Expo Go. Para probar Google desde Expo Go, inicia el servidor con `npx expo start --tunnel` y permite en Supabase el redirect exacto que imprime la app como `StockYa Supabase redirect_to:`. Si el retorno no abre StockYa, usa un development build con el esquema `emprendegest://`.

Para validar el proyecto después de hacer cambios:

```bash
npm run lint
npx tsc --noEmit
```

