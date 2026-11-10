# StockYa

StockYa es una aplicación móvil para que pequeños negocios gestionen sus productos, ventas y caja diaria desde un mismo lugar.

## Funcionalidades

- Inventario organizado por negocio y categoría
- Seguimiento de existencias y alertas de stock bajo
- Registro de ventas, compras y gastos
- Apertura, seguimiento y cierre de la caja diaria
- Resumen de actividad y ventas
- Lista de reposición para compartir
- Acceso y gestión de cuenta

## Tecnologías

- Expo y React Native
- Expo Router
- TypeScript
- React Native Reanimated
- Vite y React para el sitio auxiliar de confirmación de cuenta

## Estructura

```text
.
├── app/                 # Rutas de la aplicación móvil
├── src/
│   ├── entities/        # Modelos y acceso a datos
│   ├── features/        # Flujos y funcionalidades del producto
│   ├── pages/           # Pantallas de la aplicación
│   ├── shared/          # Componentes, tipos y utilidades compartidos
│   └── widgets/         # Secciones compuestas de la interfaz
├── apps/web/            # Sitio auxiliar de cuenta
├── assets/              # Imágenes y recursos visuales
└── package.json         # Dependencias y comandos
```

## Requisitos

- Node.js y npm
- Un archivo `.env` con las variables de entorno proporcionadas para el proyecto

## Instalación y ejecución

Instala las dependencias:

```bash
npm install
```

Inicia Expo:

```bash
npx expo start
```

También puedes usar los comandos definidos en `package.json`:

```bash
npm run android
npm run ios
npm run web
```

## Sitio auxiliar

El proyecto incluye un sitio web independiente en [`apps/web/`](./apps/web/) para los flujos de confirmación de cuenta y recuperación de acceso. Su configuración y ejecución están documentadas en [`apps/web/README.md`](./apps/web/README.md).

## Validación

```bash
npm run lint
npx tsc --noEmit
```
