# Conectar Google OAuth con StockYa

El botón **Continuar con Google** ya está incluido en la pantalla de login y llama a Supabase Auth. Esta guía configura las credenciales y los destinos para que el flujo funcione. Google devuelve primero al callback HTTPS de Supabase; Supabase luego devuelve la sesión a StockYa.

No agregues el Client Secret de Google a `.env`, Vercel, EAS ni al código de la app. Solo se guarda en la configuración del proveedor Google en Supabase.

## 1. Identificar las URLs de StockYa y Supabase

1. En Supabase abre **Project Settings → API** y copia el **Project URL**. Es la URL que ya usa `EXPO_PUBLIC_SUPABASE_URL`; no compartas aquí la clave.
2. Abre **Authentication → Sign In / Providers → Google** y copia el **Callback URL** que Supabase muestra. Tendrá esta forma:

   ```text
   https://TU_PROJECT_REF.supabase.co/auth/v1/callback
   ```

   No lo inventes ni uses la URL de Vercel. Cópialo del dashboard del proyecto que usa la app.

3. Anota el origen de la web de StockYa si vas a probar el login en navegador. En desarrollo usa el host y puerto que muestra Expo al abrir la app. Por ejemplo, si la app está en `http://localhost:8082`, ese es el origen; no uses el puerto del sitio de confirmación (`5173`).
4. Si ya publicaste la app web de Expo en Vercel, anota también su dominio de producción. `https://deb-peach.vercel.app` es el sitio de confirmación de correo, no necesariamente la app de StockYa.

## 2. Crear las credenciales en Google Cloud

1. Abre [Google Cloud Console](https://console.cloud.google.com/) y crea o selecciona un proyecto.
2. Abre **Google Auth Platform → Branding**. Configura el nombre `StockYa` y el correo de soporte.
3. En **Audience**, elige el tipo de usuarios que corresponde. Para probar con cuentas personales, puedes dejar el estado **Testing** y agregarte en **Test users**.
4. En **Data Access**, permite los datos básicos de inicio de sesión: `openid`, `email` y `profile`. No solicites permisos adicionales que StockYa no necesita.
5. Abre **Google Auth Platform → Clients → Create client** y selecciona **Web application**.
6. En **Authorized JavaScript origins**, agrega el origen de la app web, si vas a usarla:

   ```text
   http://localhost:8082
   https://TU-DOMINIO-DE-LA-APP.vercel.app
   ```

   Usa solo los orígenes que realmente correspondan: sin rutas como `/login` ni barra final. En local, sustituye `8082` por el puerto que Expo muestre en tu equipo. No agregues el dominio de confirmación a menos que allí también esté alojada la pantalla de login.
7. En **Authorized redirect URIs**, agrega el Callback URL copiado de Supabase en el paso anterior:

   ```text
   https://TU_PROJECT_REF.supabase.co/auth/v1/callback
   ```

   Debe coincidir exactamente, incluyendo `https`, el project ref y `/auth/v1/callback`. **No** uses aquí `emprendegest://` ni una URL de Vercel.
8. Pulsa **Create** y copia el **Client ID** y el **Client Secret** temporalmente en un lugar privado para el siguiente paso.

## 3. Activar Google en Supabase

1. Abre tu proyecto en [Supabase](https://supabase.com/dashboard) y ve a **Authentication → Sign In / Providers → Google**.
2. Activa el proveedor Google y pega el **Client ID** y **Client Secret** de Google Cloud. Guarda los cambios.
3. Ve a **Authentication → URL Configuration → Redirect URLs** y agrega los destinos finales de StockYa:

   ```text
   emprendegest://login
   emprendegest://reset-password
   http://localhost:8081/login
   http://localhost:8082/login
   https://TU-DOMINIO-DE-LA-APP.vercel.app/**
   https://deb-peach.vercel.app/**
   ```

   Cambia los puertos locales por el que Expo muestre y permite el dominio real de la app web. Cada destino usado debe estar permitido aquí. Mantén `https://deb-peach.vercel.app/**` para las plantillas de correo, pero no lo uses como destino OAuth. En **Site URL**, configura el dominio real de la app StockYa si está publicado, no la página que solo confirma correos. Si Supabase rechaza el redirect OAuth, usa esa Site URL como alternativa; el sitio de correo no tiene el callback ni la sesión de StockYa.

   Para probar desde Expo Go, inicia el servidor con `npx expo start --tunnel`, intenta iniciar sesión y agrega a **Redirect URLs** el valor completo que aparece como `StockYa Supabase redirect_to:` en la consola. El host y puerto del tunnel pueden cambiar, así que vuelve a comprobarlo tras reiniciar Expo. Para una prueba estable de la app nativa, permite `emprendegest://login` y usa el development build.

4. El código envía `redirectTo`, pero Supabase puede usar **Site URL** si el destino no está permitido. Por eso configura **Site URL** con la app StockYa y agrega el redirect nativo exacto a **Redirect URLs**. Las plantillas de correo apuntan directamente al sitio de confirmación y no dependen de esa Site URL.
5. Mantén activo el proveedor Email si también permitirás registro con correo y contraseña.

## 4. Probar en la app web

1. Inicia la app web de Expo y abre la dirección local que muestra Expo con `/login` (por ejemplo `http://localhost:8081/login`). Agrega esa URL exacta en **Supabase → Authentication → URL Configuration → Redirect URLs**. En Google Cloud agrega solo el origen (`http://localhost:8081`) en **Authorized JavaScript origins**.
2. Pulsa **Continuar con Google** y acepta el consentimiento.
3. En web, el retorno conserva el origen web actual. En Expo Go, inicia con `npx expo start --tunnel` y permite el redirect exacto de esa sesión en Supabase. Si el retorno no abre la app, usa un development build. Si Google muestra `redirect_uri_mismatch`, revisa el callback de Google Cloud. Si Supabase muestra `redirect_to is not allowed`, permite el redirect exacto de la plataforma en **Redirect URLs**.

## 5. Probar en Android/iOS

1. Comprueba que [`app.json`](./app.json) conserve el esquema `emprendegest`.
2. En **Supabase → Authentication → URL Configuration → Redirect URLs**, permite `emprendegest://login` (o `emprendegest://**`).
3. Configura `EXPO_PUBLIC_SUPABASE_URL` y la clave pública/anon del mismo proyecto en el entorno EAS que usarás para compilar.
4. Desde la raíz del proyecto genera la APK de prueba con `npx eas-cli@latest build --profile preview --platform android`. Si EAS lo solicita, configura el proyecto y las variables públicas de Supabase en el entorno `preview`. Instala la APK en el teléfono; no abras el proyecto con Expo Go para esta prueba.
5. Pulsa **Continuar con Google** en el teléfono. Después del consentimiento, el navegador debe regresar a StockYa con sesión iniciada.

El código usa `signInWithOAuth` de Supabase y el navegador del sistema; el Client Secret queda exclusivamente en Supabase. El flujo implementado no requiere que agregues ese secreto a la app.

Después de completar Google OAuth, StockYa abre directamente la sesión y te lleva al panel. No se envía un código adicional por correo. Google valida el correo de la cuenta como parte de su propio inicio de sesión.

## Solución de problemas

- **`redirect_uri_mismatch` en Google:** el URI configurado en Google no coincide exactamente con el callback HTTPS de Supabase.
- **Google vuelve a `deb-peach.vercel.app` y muestra “El enlace está incompleto o no es válido”:** Supabase está usando su Site URL como alternativa porque el redirect OAuth no fue aceptado. Revisa `StockYa Supabase redirect_to:` y permite ese valor exacto en **Redirect URLs**. En Expo Go, prueba con `npx expo start --tunnel`; en un development build, permite `emprendegest://login`. `deb-peach.vercel.app` es el sitio de correo y no debe usarse como destino del inicio de sesión con Google.
- **`redirect_to is not allowed` en Supabase:** falta el destino exacto de la app web publicada o el esquema deep link en **Redirect URLs**.
- **Google muestra `access_denied`:** agrega tu cuenta como **Test user** o publica la pantalla de consentimiento.
- **Google vuelve a StockYa pero no abre el panel:** revisa el log `StockYa Supabase redirect_to:` y asegúrate de permitir ese destino exacto en **Authentication → URL Configuration → Redirect URLs**.
- **Google termina en la página de confirmación de Vercel:** el pantallazo de “enlace incompleto” indica que se abrió la página de correo sin sus parámetros; no es una verificación de Google. El redirect solicitado debe coincidir con `StockYa Supabase redirect_to:` y estar permitido en Supabase **Redirect URLs**. Para Expo Go, inicia Expo con `--tunnel`; para un development build, permite `emprendegest://login`. Configura **Site URL** con el dominio de la app StockYa, no con el sitio de confirmación.
- **El correo de confirmación no llega:** revisa la configuración SMTP de Supabase y los logs; el sitio de Vercel verifica el enlace pero no envía el correo. Consulta [`apps/web/README.md`](./apps/web/README.md).

Referencias: [Supabase: Google OAuth](https://supabase.com/docs/guides/auth/social-sign-in/auth-google), [Supabase: URLs de redirección](https://supabase.com/docs/guides/auth/redirect-urls), [Expo AuthSession SDK 57](https://docs.expo.dev/versions/v57.0.0/sdk/auth-session/), [Expo WebBrowser SDK 57](https://docs.expo.dev/versions/v57.0.0/sdk/webbrowser/).
