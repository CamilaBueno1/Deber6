# Sitio web de confirmación de StockYa

La web vive en `apps/web`, igual que la aplicación web del proyecto de referencia Taller6: Vite/React, páginas en `src/pages`, lógica de función en `src/shared/api` y configuración propia. Se despliega como proyecto Vercel separado de Expo. El botón confirma el token de un solo uso con `supabase.auth.verifyOtp`; la página nunca lo procesa automáticamente al abrirse.

## Desarrollo local

Usa **un solo `.env` en la raíz del repositorio**. Las variables `VITE_...` son las que ya configuraste para Vite; las variables `EXPO_PUBLIC_...` son para Expo. Si ya tienes ambos pares, puedes conservarlos y no necesitas crear otro `.env` dentro de `apps/web`.

```dotenv
# Expo / app móvil
EXPO_PUBLIC_SUPABASE_URL=https://TU_PROJECT_ID.supabase.co
EXPO_PUBLIC_SUPABASE_KEY=TU_CLAVE_PUBLICA

# Sitio web Vite de confirmación
VITE_SUPABASE_URL=https://TU_PROJECT_ID.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=TU_CLAVE_PUBLICA
```

También se aceptan `EXPO_PUBLIC_SUPABASE_ANON_KEY` y `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. La clave publishable es pública; nunca uses `service_role` ni una clave secreta.

```powershell
Set-Location apps\web
npm install
npm run dev
```

Vite muestra la dirección local, normalmente `http://localhost:5173`. Si no existe `.env` en la raíz, copia `.env.example` como `.env` y completa la URL y la clave **publishable/anon** de Supabase. Nunca uses la clave `service_role`.

## Despliegue de la web de confirmación en Vercel

Puedes desplegarla con GitHub o sin GitHub usando la CLI. En ambos casos crea un proyecto Vercel separado del proyecto Expo.

### Sin GitHub: Vercel CLI

Necesitas una cuenta de Vercel; puedes iniciar sesión con un método disponible para tu cuenta, sin conectar GitHub. Abre PowerShell desde la raíz del proyecto:

```powershell
npx vercel login
Set-Location apps\web
npx vercel link
```

En las preguntas de `vercel link`, selecciona tu cuenta/equipo y crea un proyecto nuevo, por ejemplo `stockya-confirmacion`. Como ejecutaste el comando desde `apps\web`, ese directorio será la raíz del proyecto Vercel. No enlaces la carpeta raíz del proyecto Expo.

Después de enlazar el proyecto, configura en Vercel las variables para **Production** y **Preview** desde **Project → Settings → Environment Variables**:

   ```text
   VITE_SUPABASE_URL=https://TU_PROJECT_ID.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=TU_CLAVE_PUBLICA
   ```

Vuelve a PowerShell, manteniéndote en `apps\web`, y despliega a producción:

```powershell
npx vercel --prod
```

Vercel ejecuta `npm run build` y publica `dist`. Al final imprime la URL de producción; anótala, por ejemplo `https://stockya-confirmacion.vercel.app`. Para cambios futuros, desde `apps\web` vuelve a ejecutar `npx vercel --prod`. Sin integración Git, los despliegues no se actualizan automáticamente.

### Con GitHub

1. Importa el repositorio en Vercel para crear un proyecto separado.
2. En **Settings → General → Root Directory**, establece `apps/web`.
3. En **Settings → Environment Variables**, agrega las variables de Supabase que aparecen arriba para Production y Preview.
4. Guarda y despliega.

Estas dos variables contienen solo la URL y la clave pública de Supabase, igual que Expo. No agregues credenciales SMTP, Client Secret de Google ni `service_role` a Vercel.

## Supabase: plantilla y URLs

En **Authentication → URL Configuration**:

- **Site URL**: usa el dominio real de la app StockYa si está publicada. No uses el dominio de esta página de confirmación como destino alternativo para OAuth; Supabase puede redirigir allí cuando el redirect solicitado por Google no está permitido.
- **Redirect URLs**: agrega `https://deb-peach.vercel.app/**` y los destinos que realmente uses para web/móvil. En desarrollo local agrega también `http://localhost:5173/**`.

Los enlaces de confirmación y recuperación de este proyecto apuntan explícitamente a `https://deb-peach.vercel.app`, por lo que ese dominio debe seguir permitido aunque el **Site URL** sea el de la app. Para Google OAuth en un development build, permite `emprendegest://login`. Si pruebas desde Expo Go con `npx expo start --tunnel`, permite el redirect exacto que genera esa sesión; el host del tunnel puede cambiar.

En **Authentication → Sign In / Providers → Email**, activa Email y **Confirm email**. En **Authentication → Email Templates → Confirm signup**, usa un enlace que mande el hash de un solo uso a esta página:

```html
<h2>Confirma tu correo para StockYa</h2>
<p>Presiona el botón para verificar tu dirección de correo.</p>
<p><a href="https://deb-peach.vercel.app/?token_hash={{ .TokenHash }}&amp;type=signup">Confirmar correo</a></p>
<p>Si no creaste esta cuenta, ignora este mensaje.</p>
```

Guarda la plantilla y solicita un registro nuevo. La URL debe abrir la página con `token_hash` y `type=signup`. Si cambiaste variables de Vercel, vuelve a desplegar.

Para probar desde `localhost:5173`, agrega esa dirección a **Redirect URLs** y cambia temporalmente `.SiteURL` en la plantilla por `http://localhost:5173`. Restaura la plantilla de producción al terminar; no uses el puerto anterior de la página estática.

## Recuperación de contraseña

La app móvil solicita la recuperación a Supabase con `https://deb-peach.vercel.app/` como destino. La persona abre el correo en la página web, valida el enlace y establece una contraseña nueva; después vuelve a StockYa para iniciar sesión. Mantén `https://deb-peach.vercel.app/**` en **Redirect URLs**. Para evitar que una versión antigua de la app o una URL de retorno pasada envíe al usuario a `localhost`, el enlace de la plantilla apunta directamente al dominio de producción.

En **Authentication → Email Templates → Reset Password**, configura el botón con el hash de un solo uso:

```html
<h2>Restablece tu contraseña de StockYa</h2>
<p>Abre el enlace para crear una contraseña nueva.</p>
<p><a href="https://deb-peach.vercel.app/?token_hash={{ .TokenHash }}&amp;type=recovery">Restablecer contraseña</a></p>
<p>Si no solicitaste este cambio, ignora este mensaje.</p>
```

La web solo acepta el token cuando la persona pulsa **Validar enlace**. Después pide y confirma la nueva contraseña usando la sesión de recuperación de Supabase. Si el enlace venció o ya fue utilizado, solicita otro desde **Olvidé mi contraseña** en StockYa.

## Si el correo de confirmación no llega

El sitio web **no envía** el correo; Supabase Auth lo envía al registrarse. El SMTP de prueba de Supabase solo entrega a direcciones autorizadas de la organización del proyecto y actualmente limita el envío a 2 mensajes por hora. Por eso desplegar la página, cambiar su animación o reinstalarla no arregla la entrega a Gmail u otras direcciones.

Para permitir destinatarios reales:

1. Crea una cuenta en un servicio SMTP transaccional (por ejemplo, Resend) y verifica un dominio o remitente según los requisitos del proveedor.
2. Configura los registros DNS solicitados por el proveedor, incluidos SPF y DKIM.
3. En el dashboard de Supabase abre **Authentication → SMTP Settings** (o la configuración SMTP de Authentication), habilita SMTP personalizado e ingresa host, puerto, usuario, contraseña SMTP y remitente verificado.
4. Guarda los cambios y prueba un registro nuevo. Revisa spam y promociones.
5. Si falla, revisa **Authentication → Logs** y los logs de entrega del proveedor. Un reenvío también puede quedar limitado por la cuota de correo.

No publiques la contraseña SMTP en `.env`, Vercel ni GitHub; se guarda únicamente en la configuración SMTP de Supabase.

## Qué hace la página

- Solo valida cuando la persona pulsa **Confirmar mi correo**, para evitar que las previsualizaciones automáticas consuman el enlace.
- Usa Supabase Auth con la clave publicable y no guarda una sesión local.
- Los enlaces usados o vencidos requieren reenviar un correo desde StockYa.

Documentación: [Supabase SMTP](https://supabase.com/docs/guides/auth/auth-smtp) y [plantillas de correo](https://supabase.com/docs/guides/auth/auth-email-templates).
