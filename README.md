# clean-node

API REST construida con Clean Architecture, TypeScript, Express y TypeORM (PostgreSQL).

Este repositorio contiene un ejemplo de proyecto con separación por capas (domain, infrastructure, application) y adaptadores para usuarios y productos.

## Contenido

- `src/` - Código fuente del servicio.
- `tests/` - Pruebas unitarias.
- `docker/` - Recursos para la base de datos (ej. `init.sql`).
- `docker-compose.yml` - Composición docker para levantar la base de datos.

## Requisitos

- Node.js >= 18
- npm
- Docker (opcional, recomendado para la BD)

## Variables de entorno

Las variables están descritas en `src/application/config/environment.ts`. Valores por defecto:

- `NODE_ENV` - entorno (default: `development`)
- `PORT` - puerto de la app (default: `3000`)
- `API_PREFIX` - prefijo de la API (default: `/api/v1`)
- `DB_HOST` - host de PostgreSQL (default: `localhost`)
- `DB_PORT` - puerto de PostgreSQL (default: `5432`)
- `DB_NAME` - nombre de la BD (default: `clean_node_db`)
- `DB_USER` - usuario de la BD (default: `postgres`)
- `DB_PASSWORD` - contraseña de la BD (default: `postgres`)

Puedes copiar un `.env` y ajustar valores si lo deseas.

## Levantar dependencias (base de datos)

Recomendado usar Docker/Compose incluido. Para levantar la base de datos:

```powershell
docker-compose up -d
```

Esto iniciará un contenedor PostgreSQL y ejecutará `docker/init.sql` (si aplica).

## Instalación y ejecución

```powershell
npm install
npm run dev    # desarrollo (tsx watch)
```

Para construir y ejecutar en producción:

```powershell
npm run build
npm start
```

## Tests

```powershell
npm test
```

## Documentación de la API

La documentación de endpoints se encuentra en `API_DOCS.md`.

## Notas sobre la arquitectura

- La inyección de dependencias se realiza desde `src/application/config/bootstrap.ts` usando un contenedor simple en `src/application/config/dependency-injection.ts`.
- Las rutas principales están en `src/infrastructure/entry-points/api-rest/`.

## Contribuir

Si deseas contribuir, abre un issue o crea un pull request con pruebas y descripción clara del cambio.