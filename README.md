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

## Solución de problemas: login y registro

Si al intentar registrar o iniciar sesión recibes errores o no ves acciones completarse, prueba lo siguiente:

- Rutas que usa el frontend: el componente de autenticación intenta las rutas
	`/auth/login` y `/login` para iniciar sesión, y `/auth/register` y `/register` para registro.
	Asegúrate de que tu backend expone alguna de estas rutas y que devuelva un JSON con `token` al
	iniciar sesión, por ejemplo:

```json
{ "token": "<JWT_TOKEN>" }
```

- Verifica que la API esté en marcha y accesible en la URL configurada en `VITE_API_URL`.
	Desde la terminal puedes probar con `curl`:

```bash
curl -i -X POST "${VITE_API_URL:-http://localhost:8080/api}/auth/register" \
	-H "Content-Type: application/json" \
	-d '{"email":"test@example.com","password":"1234"}'

curl -i -X POST "${VITE_API_URL:-http://localhost:8080/api}/auth/login" \
	-H "Content-Type: application/json" \
	-d '{"email":"test@example.com","password":"1234"}'
```

- CORS: si el navegador muestra errores de tipo `CORS` o `preflight`, habilita CORS en el backend.
	Para Spring Boot una opción rápida es añadir `@CrossOrigin(origins = "http://localhost:5173")`
	en tu controlador o configurar un `CorsConfiguration` global. Asegúrate de permitir
	los métodos `POST` y el header `Authorization` si se envía token.

- Inspeccionar peticiones: abre las DevTools del navegador en la pestaña `Network` y revisa
	la petición `register` o `login`. Observa el `Request URL`, `Request Headers` y la `Response`.
	También mira la consola para ver el `console.error` que imprime información más detallada.

- Token y sesión: el frontend guarda el token en `localStorage` con la clave `token`. Si quieres
	forzar que aparezca el formulario de login, elimina la clave `token` en la consola de tu navegador:

```js
localStorage.removeItem('token')
```

- Mensajes de error: el frontend ahora muestra alert con el código de estado y el mensaje devuelto
	por la API cuando falla una operación de auth. Usa esa información para depurar el backend.

Si quieres, puedo añadir un pequeño script de pruebas automáticas que haga POSTs al backend
para verificar las rutas y respuestas. ¿Lo quieres? 
