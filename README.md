# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Configurar API local

Sigue estos pasos para conectar el frontend con tu API local:

- Crea un fichero `.env.local` en la raíz del proyecto (no se añade al repositorio).
- Añade la variable `VITE_API_URL` con la URL base de tu API. Ejemplo en `.env.local`:

```
VITE_API_URL=http://localhost:8080/api
```

- El frontend usa `src/api/axios.js`, que ahora toma `import.meta.env.VITE_API_URL` y tiene
	como fallback `http://localhost:8080/api`.
- Asegúrate de que tu API permita solicitudes CORS desde `http://localhost:5173` (puerto por
	defecto de Vite) o el puerto en que estés corriendo el frontend.
- Para iniciar el frontend en modo desarrollo:

```bash
npm install
npm run dev
```

Si prefieres no usar variables de entorno, la configuración por defecto seguirá apuntando a
`http://localhost:8080/api`.
