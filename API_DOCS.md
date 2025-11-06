# Documentación de la API - clean-node

Base URL: http://localhost:3000 (ajusta `PORT` si cambias el puerto)
Prefijo de la API: `/api/v1` por defecto (ver `API_PREFIX`)

## Resumen

Endpoints principales:

- Health
  - GET /health
  - GET /health/ready
  - GET /health/live

- Users (prefijo `/api/v1`)
  - POST /users
  - GET /users/:id
  - GET /users
  - PUT /users/:id
  - DELETE /users/:id

- Products (prefijo `/api/v1`)
  - POST /products
  - GET /products/:id
  - GET /products/category/:category
  - GET /products
  - PATCH /products/:id/stock

---

## Formato de respuesta y errores

La aplicación utiliza un formateador de respuestas centralizado. Los errores suelen devolver un JSON con al menos las siguientes propiedades:

- `status` - Código HTTP
- `message` - Mensaje humano
- `errors` - Detalles de validación (opcional)

Ejemplo de error de validación (400):

```json
{
  "status": 400,
  "message": "Validation error",
  "errors": [
    { "field": "email", "message": "Invalid email address" }
  ]
}
```

Ejemplo de respuesta exitosa (201) - crear usuario:

```json
{
  "status": 201,
  "data": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "isActive": true
  }
}
```

---

## Health

GET /health
- Descripción: Estado completo de la aplicación.
- Respuesta: 200 OK con información del sistema.

GET /health/ready
- Descripción: Readiness probe (indica si la app está lista para recibir tráfico).
- Respuesta: 200 OK si listo.

GET /health/live
- Descripción: Liveness probe (indica si el proceso está vivo).
- Respuesta: 200 OK si vivo.

---

## Users

POST /api/v1/users
- Descripción: Crear un nuevo usuario.
- Body (JSON):
  - name (string, required, 2-255)
  - email (string, required, email)
  - password (string, required, min 6)
  - role (string, optional, 'admin'|'user')

Ejemplo curl:

```bash
curl -X POST http://localhost:3000/api/v1/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Jane","email":"jane@example.com","password":"secret"}'
```

GET /api/v1/users/:id
- Descripción: Obtener un usuario por ID (UUID).
- Parámetros de ruta: `id` (UUID)

GET /api/v1/users
- Descripción: Listar usuarios.
- Query params opcionales:
  - role (admin|user)
  - isActive (boolean)

PUT /api/v1/users/:id
- Descripción: Actualizar usuario.
- Body (parcialmente requerido): cualquiera de los campos `name`, `email`, `password`, `role`, `isActive`.

DELETE /api/v1/users/:id
- Descripción: Eliminar usuario por ID.

---

## Products

POST /api/v1/products
- Descripción: Crear un nuevo producto.
- Body (JSON):
  - name (string, required, 3-255)
  - description (string, required)
  - price (number, required, > 0)
  - stock (integer, required, >= 0)
  - category (string, required)
  - userId (UUID, optional)

Ejemplo curl:

```bash
curl -X POST http://localhost:3000/api/v1/products \
  -H "Content-Type: application/json" \
  -d '{"name":"Product A","description":"Desc","price":9.99,"stock":10,"category":"books"}'
```

GET /api/v1/products/:id
- Descripción: Obtener producto por ID (UUID).

GET /api/v1/products/category/:category
- Descripción: Obtener productos por categoría.
- Query params opcionales:
  - inStock (boolean)

GET /api/v1/products
- Descripción: Listar productos con filtros opcionales.
- Query params:
  - minPrice, maxPrice (float)
  - category (string)
  - inStock (boolean)
  - userId (UUID)

PATCH /api/v1/products/:id/stock
- Descripción: Actualizar stock de un producto.
- Body (JSON): { "quantity": number }

---

## Base de datos

La aplicación espera una base de datos PostgreSQL. Valores por defecto están en `src/application/config/environment.ts`.

Si usas Docker Compose incluido:

```powershell
docker-compose up -d
```

Verifica la conexión en `src/application/config/database.ts`.

---

## Ejecutar localmente

1. Instala dependencias:

```powershell
npm install
```

2. Levanta la BD si usas Docker:

```powershell
docker-compose up -d
```

3. Ejecuta en modo desarrollo:

```powershell
npm run dev
```

4. Ejecuta tests:

```powershell
npm test
```

---

## Notas técnicas

- Validaciones con `express-validator` en las rutas.
- Inyección de dependencias mediante `src/application/config/dependency-injection.ts` y `bootstrap.ts`.
- Los controladores están en `src/infrastructure/entry-points/api-rest/*/*.controller.ts`.