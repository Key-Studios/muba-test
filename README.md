# Muba Test

> Editor ligero de disposición de muebles y fondos (proyecto demo)

Descripción
---
Esta aplicación permite explorar un catálogo de muebles, arrastrarlos a un canvas, ajustar su posición/rotación/escala y establecer fondos. Está pensada como una demo de edición de escenas para visualizar composiciones de mobiliario.

Principales funcionalidades
---
- Catálogo de muebles con búsqueda por nombre.
- Arrastrar y soltar muebles desde el catálogo al canvas.
- Transformaciones de los muebles: mover, escalar (con restricciones), rotar y eliminar.
- Selección y edición con un Transformer visual (react-konva).
- Fondos predefinidos (cargados desde public/backgrounds.json) y subida de fondos por el usuario (data URLs).
- Guardado automático de escenas en `localStorage`.
- Exportación del canvas a PNG.
- Resolución de assets públicos usando `import.meta.env.VITE_PUBLIC_URL` con fallback a rutas relativas para evitar 404 en despliegues con basepath.

Estructura del proyecto (resumida)
---
- `src/` - código fuente React
  - `components/` - componentes UI principales (CanvasEditor, FurnitureCatalog, BackgroundSelector, Toolbar, ScenesPanel)
  - `utils/` - utilidades (por ejemplo `publicUrl.js`, `exportUtils.js`)
- `public/` - assets estáticos: `furniture.json`, `backgrounds.json`, carpetas `furniture/`, `backgrounds/` con imágenes

Requisitos
---
- Node.js y npm (o pnpm/yarn). Versión recomendada: Node 16+.

Variables de entorno
---
La app usa la variable de entorno Vite `VITE_PUBLIC_URL` para construir rutas a los assets públicos cuando es necesario.

Ejemplos:

- Desarrollo en raíz del servidor (por defecto):

```cmd
REM archivo .env
VITE_PUBLIC_URL=/
```

- GitHub Pages donde la app se sirve en `https://key-studios.github.io/muba-test/`:

```cmd
REM archivo .env
VITE_PUBLIC_URL=/muba-test
```

Nota: si `VITE_PUBLIC_URL` está mal configurada la app intenta primero usarla y, si la petición falla (404 u otro), hace un fallback a la ruta relativa (`/furniture.json`, `/backgrounds.json`). Esto evita errores como `GET https://key-studios.github.io/furniture.json 404`.

Instalación y ejecución
---
Desde la raíz del proyecto:

```cmd
npm install
npm run dev
```

Compilación para producción:

```cmd
npm run build
npm run preview
```

Despliegue (GitHub Pages)
---
1. Asegúrate de que `VITE_PUBLIC_URL` apunte al subdirectorio donde sirve la app (p.ej. `/muba-test`).
2. Genera el build (`npm run build`).
3. Sube el contenido de `dist/` a la rama de GitHub Pages (habitualmente `gh-pages`) o configura GitHub Actions para desplegar.

Resolución de problemas comunes
---
- 404 al cargar `furniture.json` o `backgrounds.json` desde GitHub Pages: revisa `VITE_PUBLIC_URL`. Si la app está en `https://<user>.github.io/<repo>/`, la variable debe ser `/ <repo>` o la URL completa. La app ahora realiza un fallback automático a rutas relativas si la petición con `VITE_PUBLIC_URL` falla.
- Miniaturas que no se muestran: verifica que las rutas en `public/furniture.json` sean relativas (p.ej. `"image": "furniture/STEP4/BEDS/bed1.png"`) y que `VITE_PUBLIC_URL` sea correcto si usas un base path.

Notas para desarrolladores
---
- `src/utils/publicUrl.js` contiene la utilidad para resolver rutas públicas. Deja intactas las URLs absolutas (`http(s)://`, `//`), `data:` y `blob:`.
- Los componentes que cargan imágenes usan `publicUrl(...)` para evitar problemas en despliegues con base path.
- Si vas a cambiar la ubicación de assets en `public/`, actualiza también `public/furniture.json` y `public/backgrounds.json` en consecuencia.

Contribuir
---
Pull requests bienvenidos. Para cambios grandes abre primero un issue explicando la motivación.

Licencia
---
Proyecto de ejemplo / demo — revisa el repositorio para detalles de licencia si aplica.

Contacto
---
Para dudas o problemas, abre un issue en el repositorio.
# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
