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

### Publicar la página web en Vercel

1. Importa el repositorio en [Vercel](https://vercel.com/new) para publicar la app web. [`vercel.json`](./vercel.json) configura `npx expo export --platform web` y la carpeta de salida `dist`.
2. En **Settings → Environment Variables**, agrega `EXPO_PUBLIC_SUPABASE_URL` y `EXPO_PUBLIC_SUPABASE_ANON_KEY` para los entornos que vayas a publicar, y vuelve a desplegar.
3. La aplicación móvil y la app web de Expo son un proyecto Vercel con la raíz del repositorio. El sitio de confirmación de correo se despliega como un segundo proyecto desde [`apps/web/`](./apps/web/), siguiendo la estructura del proyecto de referencia; usa su dominio para los enlaces de verificación.

La URL y la clave publishable/anon son públicas para la app; no configures una `service_role` ni el secreto OAuth en variables `EXPO_PUBLIC_*`.

Para generar e instalar una APK de prueba mediante EAS:

```bash
npx eas-cli@latest login
npx eas-cli@latest build:configure
npx eas-cli@latest build --platform android --profile preview
```

Al terminar, descarga la APK del enlace de EAS e instálala en el teléfono. El perfil `preview` de [`eas.json`](./eas.json) genera una APK y ofrece un retorno nativo más estable. Para volver a probar con Expo Go, usa `npx expo start --tunnel` y permite en Supabase el redirect exacto que genera la sesión. Al cambiar el esquema o los identificadores nativos se debe generar otra APK.

## Configuración de Supabase

1. Crea un proyecto en [Supabase](https://supabase.com/dashboard).
2. En **Project Settings → API** copia la Project URL y la clave publishable (o `anon` heredada) a `.env`:

   ```dotenv
   EXPO_PUBLIC_SUPABASE_URL=https://TU_PROJECT_ID.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=TU_CLAVE_PUBLICA
   ```

3. En un proyecto Supabase nuevo, abre **SQL Editor**, pega y ejecuta [`supabase/schema.sql`](./supabase/schema.sql). Crea las tablas de negocios, jornadas, movimientos, productos y ventas; configura RLS y crea el bucket `product-images`. Este esquema es para una base nueva: si ya tienes datos/tablas en ese proyecto, no lo ejecutes sin revisar primero la estructura para evitar conflictos o pérdida de datos.
4. Publica el sitio independiente de confirmación y recuperación siguiendo [`apps/web/README.md`](./apps/web/README.md). En **Authentication → URL Configuration**, configura **Site URL** con el dominio real de la app StockYa (si está publicada) y agrega los destinos reales de la app y del sitio de correo a **Redirect URLs**. No uses el dominio del sitio de confirmación como destino de reserva de OAuth:

   ```text
   https://deb-peach.vercel.app
   https://deb-peach.vercel.app/**
   https://TU-APP.vercel.app
   https://TU-APP.vercel.app/**
   emprendegest://login
   emprendegest://reset-password
   ```

   Sustituye los dominios por los reales. Agrega los destinos de desarrollo que necesites solo mientras pruebas. Si aún no tienes una web de la app, deja el Site URL temporal y asegúrate de permitir `emprendegest://login` antes de probar Google en un development build; los enlaces de correo ya especifican `https://deb-peach.vercel.app` por separado.

5. En **Authentication → Sign In / Providers → Email**, activa el proveedor Email y **Confirm email** para exigir verificación al registrarse. La app muestra una pantalla con el correo usado y un botón para reenviar el mensaje.
6. En **Authentication → Email Templates → Confirm signup**, cambia el enlace para abrir el sitio independiente y validar el token de un solo uso:

   ```html
   <h2>Confirma tu correo para StockYa</h2>
   <p>Presiona el botón para verificar tu dirección de correo.</p>
   <p><a href="https://deb-peach.vercel.app/?token_hash={{ .TokenHash }}&amp;type=signup">Confirmar correo</a></p>
   ```

   La página de [`apps/web/`](./apps/web/) valida el token con Supabase cuando se pulsa el botón. No se envía el token a la app ni se necesita una función serverless propia.
7. En **Authentication → Email Templates → Reset Password**, configura el enlace para recuperar la contraseña en el mismo sitio:

   ```html
   <h2>Restablece tu contraseña de StockYa</h2>
   <p>Abre el enlace para crear una contraseña nueva.</p>
   <p><a href="https://deb-peach.vercel.app/?token_hash={{ .TokenHash }}&amp;type=recovery">Restablecer contraseña</a></p>
   ```

   Desde **Olvidé mi contraseña**, la app envía el correo con `https://deb-peach.vercel.app/` como destino. Los enlaces de las plantillas también apuntan directamente a Vercel para evitar que una URL antigua de la app los envíe a `localhost`. La persona valida el enlace, crea su contraseña en la página y vuelve a StockYa para iniciar sesión. Consulta [`apps/web/README.md`](./apps/web/README.md) para los pasos completos.
8. El SMTP de prueba de Supabase solo entrega a direcciones autorizadas de la organización y limita el envío (actualmente, 2 mensajes por hora). **La página web no envía correos.** Para entregar correos a direcciones como Gmail, configura un proveedor SMTP y remitente/dominio verificados en Supabase. Sigue la guía de SMTP en [`apps/web/README.md`](./apps/web/README.md); las credenciales se guardan solo en Supabase, nunca en la app ni en Vercel.
9. Prueba desde el teléfono y desde una computadora: regístrate, abre el correo, confirma en la web y luego inicia sesión en StockYa. Prueba también **Olvidé mi contraseña**, valida el correo de recuperación, guarda una contraseña nueva e inicia sesión con ella. Si un enlace venció o ya se usó, solicita otro desde la app.

La confirmación y recuperación web no requieren abrir Expo Go ni una APK. El esquema `emprendegest://` sigue siendo útil para los flujos nativos de acceso.

## Configurar Google OAuth

Sigue la guía paso a paso en [`googl.md`](./googl.md). Incluye Google Cloud, el proveedor Supabase, los dominios permitidos de Vercel y la prueba en web y Android. El flujo usa un cliente OAuth **Web** y el callback de Supabase; el Client Secret solo se guarda en Supabase.

## Funcionalidades

- Registro e inicio de sesión con correo y contraseña, confirmación y reenvío del correo de verificación.
- Inicio de sesión social con Google.
- Recuperación de acceso por correo y edición del nombre de perfil.
- CRUD de productos por negocio: nombre, precio de venta, costo, categoría, stock, mínimo y foto en Supabase Storage.
- Filtros rápidos por categoría en inventario y venta, sugerencias de categorías existentes y ranking de ingresos/unidades por categoría de los últimos 7 días.
- Semáforo de stock bajo o agotado, con lista de reposición compartible desde el menú del teléfono (incluido WhatsApp).
- Venta rápida en cuadrícula: selecciona producto y cantidad; una función transaccional valida y descuenta el stock de forma atómica.
- Resumen diario de ventas, ganancia aproximada y producto estrella, con meta diaria configurable por negocio y celebración animada al superarla.
- Interfaz móvil claymorphism en crema y salvia, con sombras suaves, controles táctiles animados y transiciones sutiles.
- Gestión de varios negocios, perfil, Uniwind/Tailwind 4 y animaciones Lottie.

La ganancia aproximada se calcula con el precio y costo guardados al registrar cada venta; no es utilidad contable y no incluye impuestos ni costos omitidos.

## Guion para el video (menos de 5 minutos)

1. Preséntate con tus nombres completos y muestra la app.
2. Registra una cuenta o inicia sesión; prueba el botón de Google si ya configuraste sus credenciales.
3. Crea un negocio, agrega productos con fotos y mínimo de stock, y registra una venta rápida.
4. Muestra el descuento automático, el semáforo, la lista compartible, la meta diaria y el resumen del día.
5. Edita o elimina un producto y enseña el perfil, la gestión de negocios y las animaciones de `assets/lottie`.

## Publicar en GitHub

1. Crea un repositorio vacío en GitHub.
2. Asegúrate de que `.env` no se suba; `.gitignore` ya lo excluye. Nunca publiques el Client Secret de Google ni la `service_role` key de Supabase.
3. Desde la carpeta del proyecto, agrega el remoto de GitHub y publica la rama:

   ```bash
   git remote add origin https://github.com/TU_USUARIO/TU_REPOSITORIO.git
   git add .
   git commit -m "Completar app móvil StockYa"
   git push -u origin main
   ```

4. Comparte el enlace del repositorio y el video de demostración en la plataforma de entrega.
#   D e b e r 6  
 