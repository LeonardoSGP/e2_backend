<p align="center">
  <h1 align="center">Deltos — Sistema de Gestión de Proyectos Académicos</h1>
  <p align="center">
    API REST robusta construida con <strong>Node.js</strong>, <strong>Express</strong>, <strong>TypeScript</strong> y <strong>Prisma ORM</strong> para la gestión integral de eventos, equipos, proyectos y evaluaciones académicas.
  </p>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-20-339933?logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/TypeScript-6.0-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Express-4.x-000000?logo=express&logoColor=white" alt="Express" />
  <img src="https://img.shields.io/badge/Prisma-5.19-2D3748?logo=prisma&logoColor=white" alt="Prisma" />
  <img src="https://img.shields.io/badge/MySQL-8.0-4479A1?logo=mysql&logoColor=white" alt="MySQL" />
  <img src="https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white" alt="Docker" />
  <img src="https://github.com/LeonardoSGP/e2_backend/actions/workflows/ci.yml/badge.svg" alt="CI Status" />
  <img src="https://github.com/LeonardoSGP/e2_backend/actions/workflows/cd.yml/badge.svg" alt="CD Status" />
  <img src="https://github.com/LeonardoSGP/e2_backend/actions/workflows/security.yml/badge.svg" alt="Security" />
  <img src="https://github.com/LeonardoSGP/e2_backend/actions/workflows/docker-verify.yml/badge.svg" alt="Docker Verify" />
</p>

---

## Entornos en Vivo (Producción)

- **Frontend (Netlify):** [https://silly-capybara-cf4d11.netlify.app](https://silly-capybara-cf4d11.netlify.app)
- **Backend API (Railway):** [https://e2backend-production-6af0.up.railway.app](https://e2backend-production-6af0.up.railway.app)
- **Documentación Swagger:** [https://e2backend-production-6af0.up.railway.app/api-docs](https://e2backend-production-6af0.up.railway.app/api-docs)
- **Colección Postman:** [Deltos_API_Postman_Collection.json](./Deltos_API_Postman_Collection.json) (Descargar e importar en Postman)

> **Nota:** El backend en Railway puede tardar unos segundos en responder la primera vez si estuvo inactivo (cold start).

---

## Tabla de Contenidos

- [Entornos en Vivo (Producción)](#entornos-en-vivo-producción)
- [Tecnologías Utilizadas](#tecnologías-utilizadas)
- [Arquitectura del Sistema](#arquitectura-del-sistema)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Diagrama de Entidad-Relación (UML)](#diagrama-de-entidad-relación-uml)
- [Patrones de Diseño Utilizados](#patrones-de-diseño-utilizados)
- [Instalación](#instalación)
- [Variables de Entorno](#variables-de-entorno)
- [Ejecución](#ejecución)
- [Docker](#docker)
- [Endpoints de la API](#endpoints-de-la-api)
- [Scripts Disponibles](#scripts-disponibles)
- [Testing](#testing)
- [Pipeline CI/CD](#pipeline-cicd)
- [Buenas Prácticas y Notas](#buenas-prácticas-y-notas)
- [Autores](#autores)

---

## Tecnologías Utilizadas

| Categoría | Tecnología |
|-----------|-----------|
| **Runtime** | Node.js 20 (Alpine) |
| **Lenguaje** | TypeScript 6.x |
| **Framework** | Express 4.x |
| **ORM** | Prisma 5.19 |
| **Base de Datos** | MySQL 8.0 |
| **Autenticación** | JSON Web Tokens (jsonwebtoken + bcryptjs) |
| **Validación** | Zod 4.x |
| **Documentación** | Swagger (swagger-jsdoc + swagger-ui-express) |
| **Generación PDF** | PDFKit |
| **Generación Excel** | ExcelJS / xlsx |
| **Carga de Archivos** | Multer |
| **Contenedores** | Docker + Docker Compose |
| **Hot Reload (dev)** | tsx |

---

## Arquitectura del Sistema

El backend implementa una **arquitectura multicapa modular** con separación clara de responsabilidades por dominio:

```mermaid
flowchart TD
    classDef frontend fill:#41B883,stroke:#35495E,stroke-width:1px,color:#ffffff
    classDef entry    fill:#FEF3C7,stroke:#B45309,stroke-width:1px,color:#78350F
    classDef layer    fill:#EDE9FE,stroke:#6D28D9,stroke-width:1px,color:#4C1D95
    classDef helper   fill:#F3F4F6,stroke:#6B7280,stroke-width:1px,color:#374151
    classDef database fill:#DBEAFE,stroke:#1D4ED8,stroke-width:1px,color:#1E3A8A

    Client[" Cliente — Frontend Vue 3<br/><i>Vite · Pinia · Router · Axios · Tailwind</i>"]:::frontend

    subgraph Backend [" Backend Node.js + Express + TypeScript (Docker)"]
        direction TB
        API[" app.ts / server.ts<br/><i>Middlewares · Rutas base · Swagger</i>"]:::entry
        Auth[" Auth middleware (JWT)"]:::helper

        subgraph Modulo [" Módulo de dominio (ej. Proyectos)"]
            direction TB
            Router[" Router — capa de presentación<br/><i>proyecto.router.ts</i>"]:::layer
            Zod[" Zod schema<br/><i>proyecto.schema.ts</i>"]:::helper
            Service[" Service — capa de negocio<br/><i>proyecto.service.ts</i>"]:::layer
            Mapper[" Mapper<br/><i>proyecto.mapper.ts</i>"]:::helper
            ErrorH[" Error handler<br/><i>captura AppError</i>"]:::helper
            Repository[" Repository — capa de datos<br/><i>proyecto.repository.ts</i>"]:::layer
        end

        Prisma[" Prisma Client (ORM)"]:::entry
    end

    DB[(" MySQL 8.0")]:::database

    Client -- "Petición HTTP / REST" --> API
    API --> Auth
    Auth --> Router
    Router --> Service
    Service --> Repository
    Repository --> Prisma
    Prisma -- "TCP/IP" --> DB

    Router -. "valida entrada" .-> Zod
    Service -. "formatea DTOs" .-> Mapper
    Service -. "lanza excepción" .-> ErrorH
```

**Flujo de una petición:**

1. El **Cliente Vue 3** envía una petición HTTP.
2. **Express** la recibe y aplica middlewares globales (CORS, JSON parser).
3. El **Auth Middleware** verifica el JWT y extrae el usuario.
4. El **Role Middleware** valida que el rol del usuario tenga acceso.
5. El **Router** del módulo valida el body con **Zod** y delega al **Service**.
6. El **Service** ejecuta la lógica de negocio, usa **Mappers** y lanza **AppError** si falla.
7. El **Repository** interactúa con **Prisma Client** para las operaciones en base de datos.
8. La respuesta regresa por el mismo camino al cliente.

---

## Estructura del Proyecto

```
e2_backend/
├── docker-compose.yml          # Orquestación de servicios
├── backend/
│   ├── Dockerfile              # Build multi-stage (build + producción)
│   ├── docker-entrypoint.sh    # Migraciones automáticas al arrancar
│   ├── package.json
│   ├── tsconfig.json
│   ├── tsconfig.build.json
│   ├── .env                    # Variables locales (no versionado)
│   ├── .env.example            # Plantilla de variables de entorno
│   ├── prisma/
│   │   ├── schema.prisma       # Definición de modelos y relaciones
│   │   ├── seed.ts             # Script de datos iniciales
│   │   └── migrations/         # Historial de migraciones
│   ├── src/
│   │   ├── server.ts           # Punto de entrada (arranque del servidor)
│   │   ├── app.ts              # Configuración de Express, rutas y middlewares
│   │   ├── config.ts           # Validación de env con Zod
│   │   ├── errors.ts           # Clase AppError personalizada
│   │   ├── prisma.config.ts    # Instancia singleton de PrismaClient
│   │   ├── middlewares/
│   │   │   ├── auth.middleware.ts   # Verificación JWT
│   │   │   ├── role.middleware.ts   # Control de acceso por rol
│   │   │   └── error.middleware.ts  # Manejador global de errores
│   │   ├── modules/            # Módulos de dominio
│   │   │   ├── admin/          # Dashboard y preferencias admin
│   │   │   ├── auth/           # Registro, login, perfil, avatar
│   │   │   ├── avances/        # Bitácora de avances (participante)
│   │   │   ├── carreras/       # Catálogo de carreras
│   │   │   ├── constancias/    # Gestión de constancias/certificados
│   │   │   ├── criterios/      # Criterios de evaluación
│   │   │   ├── equipos/        # Gestión de equipos y miembros
│   │   │   ├── eventos/        # CRUD de eventos y asignación de jueces
│   │   │   ├── invitaciones/   # Invitaciones entre participantes
│   │   │   ├── jueces/         # Dashboard y evaluaciones del juez
│   │   │   ├── participante/   # Dashboard completo del participante
│   │   │   ├── perfiles/       # Catálogo de perfiles (roles de equipo)
│   │   │   ├── proyectos/      # CRUD de proyectos
│   │   │   ├── reportes/       # Generación de reportes PDF
│   │   │   └── resultados/     # Rankings y constancias de resultados
│   │   ├── users/              # CRUD de usuarios (admin)
│   │   └── utils/
│   │       └── pdf.service.ts  # Servicio de generación de PDFs
│   └── uploads/                # Archivos subidos (avatares, etc.)
└── frontend/                   # Aplicación Vue 3 — ver frontend/README.md
    ├── README.md               # Documentación del frontend
    ├── Dockerfile              # Build multi-stage (Vite + Nginx)
    ├── nginx.conf              # Proxy inverso al backend
    ├── vite.config.ts          # Proxy de desarrollo → backend :3001
    └── src/                    # Código fuente Vue 3
```

---

## Diagrama de Entidad-Relación (UML)

```mermaid
erDiagram
    users {
        int id
        string name
        string email
        string password
        string avatar
        string carrera
        string no_control
        string telefono
        string role
    }

    eventos {
        int id
        string nombre
        string descripcion
        string fecha_inicio
        string fecha_fin
        int max_jueces
    }

    equipos {
        int id
        string nombre
        int max_programadores
        int max_disenadores
        int max_testers
    }

    proyectos {
        int id
        int equipo_id
        int evento_id
        string nombre
        string descripcion
        string repositorio_url
    }

    equipo_miembros {
        int id
        int equipo_id
        int user_id
        string rol
    }

    equipo_interacciones {
        int id
        int equipo_id
        int user_id
        string tipo
        string estado
        string mensaje
        int perfil_id
    }

    evaluacion_criterios {
        int id
        int evento_id
        string nombre
        float ponderacion
    }

    evaluaciones {
        int id
        int proyecto_id
        int juez_id
        int criterio_id
        float puntuacion
        string comentario
    }

    evento_jueces {
        int evento_id
        int user_id
    }

    proyecto_avances {
        int id
        int proyecto_id
        string descripcion
        string fecha
    }

    certificados {
        int id
        int user_id
        int evento_id
        string tipo
        string archivo_path
        string codigo_qr
    }

    user_preferences {
        int id
        int user_id
        string settings
    }

    carreras {
        int id
        string nombre
        string clave
    }

    perfiles {
        int id
        string nombre
    }

    users ||--o{ equipo_miembros : participa
    users ||--o{ equipo_interacciones : interacciones
    users ||--o{ evaluaciones : evalua
    users ||--o{ certificados : obtiene
    users ||--o{ evento_jueces : juez
    users ||--o| user_preferences : tiene

    equipos ||--o{ equipo_miembros : miembros
    equipos ||--o{ equipo_interacciones : acciones
    equipos ||--o{ proyectos : proyectos

    eventos ||--o{ proyectos : contiene
    eventos ||--o{ evaluacion_criterios : criterios
    eventos ||--o{ evento_jueces : jueces
    eventos ||--o{ certificados : certificados

    proyectos ||--o{ evaluaciones : evaluaciones
    proyectos ||--o{ proyecto_avances : avances

    evaluacion_criterios ||--o{ evaluaciones : puntua

    perfiles ||--o{ equipo_interacciones : perfil
```

---

## Patrones de Diseño Utilizados

El sistema implementa cinco patrones de diseño reconocidos, cada uno justificado por una necesidad concreta del proyecto.

---

### 1. Singleton

**Descripción:** Garantiza que exista una única instancia de un objeto durante toda la vida de la aplicación.

**¿Por qué se usa aquí?**  
Tanto el cliente de Prisma como el objeto de configuración se exportan como un módulo singleton. Crear múltiples instancias de `PrismaClient` provoca agotamiento del pool de conexiones a MySQL; un singleton compartido previene este problema.

**Implementación:**

```typescript
// backend/src/prisma.config.ts
const prisma = new PrismaClient({ log: ['query', 'info', 'warn', 'error'] });
export default prisma; // ← misma instancia reutilizada en todo el backend
```

```typescript
// backend/src/config.ts
export const config = {        // ← objeto de configuración compartido globalmente
  port: parsedEnv.data.PORT,
  jwtSecret: parsedEnv.data.JWT_SECRET,
  ...
};
```

**Archivos:** `backend/src/prisma.config.ts`, `backend/src/config.ts`

---

### 2. Repository

**Descripción:** Abstrae la lógica de acceso a datos detrás de una interfaz, desacoplando la capa de negocio (Service) de la tecnología de persistencia (Prisma/MySQL).

**¿Por qué se usa aquí?**  
Cada módulo de dominio tiene su propio repositorio (`*.repository.ts`) que encapsula todas las queries de Prisma. El Service solo llama métodos del repositorio sin conocer cómo se construyen las consultas SQL, lo que facilita pruebas unitarias con mocks y permite cambiar el ORM sin tocar la lógica de negocio.

**Implementación:**

```typescript
// backend/src/modules/proyectos/proyecto.repository.ts
export class ProyectoRepository {
  async findAllPaginated(options: ProyectoQueryOptions) { ... }
  async findById(id: number) { ... }
  async create(data: CreateProyectoDto) { ... }
  async update(id: number, data: UpdateProyectoDto) { ... }
  async delete(id: number) { ... }
}

// backend/src/modules/proyectos/proyecto.service.ts
export class ProyectoService {
  constructor(private readonly proyectoRepository: ProyectoRepository) {}
  // El service nunca toca Prisma directamente
}
```

**Archivos:** `backend/src/modules/*/**.repository.ts` (15 módulos)

---

### 3. API Gateway

**Descripción:** Punto de entrada único que centraliza el enrutamiento, la seguridad y la orquestación de todas las peticiones externas hacia los servicios internos.

**¿Por qué se usa aquí?**  
`app.ts` actúa como el API Gateway del sistema: aplica middlewares globales (CORS, JSON parser), define guards de seguridad por rol y distribuye cada petición al router del módulo correspondiente. En producción, Nginx actúa como un segundo nivel de gateway redirigiendo el tráfico HTTP del frontend al contenedor del backend.

**Implementación:**

```typescript
// backend/src/app.ts
const adminGuard        = [authMiddleware, requireRole(['ADMIN'])];
const juezGuard         = [authMiddleware, requireRole(['JUEZ'])];
const participanteGuard = [authMiddleware, requireRole(['PARTICIPANTE'])];

// Enrutamiento centralizado con guards aplicados por grupo
app.use('/api/admin/usuarios',  adminGuard,         userRouter);
app.use('/api/admin/eventos',   adminGuard,         eventoRouter);
app.use('/api/juez',            juezGuard,          juezRouter);
app.use('/api/participante',    participanteGuard,  participanteDashboardRouter);
```

```nginx
# frontend/nginx.conf
location /api/ { proxy_pass http://backend:3001; }
```

**Archivos:** `backend/src/app.ts`, `frontend/nginx.conf`

---

### 4. Mapper / DTO (Data Transfer Object)

**Descripción:** Transforma las entidades internas (modelos de Prisma con tipos `BigInt` y relaciones anidadas) en objetos de transferencia limpios y tipados que el cliente puede consumir directamente.

**¿Por qué se usa aquí?**  
Prisma devuelve `BigInt` para los IDs y objetos anidados con nombres de tabla. Los mappers convierten estos datos al formato esperado por el frontend sin exponer detalles internos del esquema de base de datos. Sin el mapper, `JSON.stringify()` lanzaría un `TypeError` al intentar serializar un `BigInt`.

**Implementación:**

```typescript
// backend/src/modules/proyectos/proyecto.mapper.ts
export function toProyectoResponse(proyecto: ProyectoConRelaciones) {
  return {
    ...proyecto,
    id:         Number(proyecto.id),          // BigInt → number
    equipo_id:  Number(proyecto.equipo_id),
    evento_id:  Number(proyecto.evento_id),
    equipo:     proyecto.equipos   ? { ...proyecto.equipos,  id: Number(proyecto.equipos.id) }  : null,
    evaluaciones: proyecto.evaluaciones.map(toEvaluacionResponse),
  };
}
```

**Archivos:** `backend/src/modules/*/**.mapper.ts` (presente en todos los módulos)

---

### 5. Chain of Responsibility (Middleware Pipeline)

**Descripción:** Encadena manejadores de peticiones donde cada eslabón puede procesar la solicitud o pasarla al siguiente. Si alguno falla, la cadena se interrumpe.

**¿Por qué se usa aquí?**  
Express implementa este patrón de forma nativa. Cada petición protegida pasa por: `authMiddleware` (verifica JWT) → `requireRole` (valida rol) → router del módulo. Si cualquier eslabón detecta un problema, corta la cadena y retorna el error HTTP apropiado.

**Implementación:**

```typescript
// backend/src/middlewares/auth.middleware.ts
export const authMiddleware = async (req, res, next) => {
  // Verifica el JWT → si falla: res.status(401) y corta la cadena
  // Si es válido: next() → pasa al siguiente eslabón
};

// backend/src/middlewares/role.middleware.ts
export const requireRole = (allowedRoles: string[]) => (req, res, next) => {
  // Verifica el rol → si no tiene permiso: res.status(403) y corta la cadena
  // Si tiene permiso: next() → pasa al router del módulo
};

// backend/src/middlewares/error.middleware.ts
export const errorMiddleware = (err, req, res, next) => {
  // Captura cualquier excepción no manejada → respuesta JSON de error uniforme
};

// Cadena completa en app.ts:
// authMiddleware → requireRole([...]) → router → errorMiddleware
```

**Archivos:** `backend/src/middlewares/auth.middleware.ts`, `role.middleware.ts`, `error.middleware.ts`

---

### Resumen de Patrones

| # | Patrón | Categoría | Archivos clave |
|---|--------|-----------|----------------|
| 1 | **Singleton** | Creacional | `prisma.config.ts`, `config.ts` |
| 2 | **Repository** | Arquitectural | `modules/*/**.repository.ts` |
| 3 | **API Gateway** | Estructural/Nube | `app.ts`, `nginx.conf` |
| 4 | **Mapper / DTO** | Estructural | `modules/*/**.mapper.ts` |
| 5 | **Chain of Responsibility** | Comportamental | `middlewares/*.middleware.ts` |

---

## Instalación

### Requisitos Previos

- **Node.js** ≥ 20
- **MySQL** 8.0 corriendo con la base de datos `gestor_proyectos` creada
- **npm** (incluido con Node.js)

### Pasos

```bash
# 1. Clonar el repositorio
git clone https://github.com/LeonardoSGP/e2_backend.git
cd e2_backend

# 2. Instalar dependencias del backend
cd backend
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Edita .env con tus credenciales reales

# 4. Generar el cliente Prisma
npx prisma generate

# 5. Aplicar migraciones a la base de datos
npx prisma db push

# 6. (Opcional) Poblar la base de datos con datos de prueba
npm run seed
```

---

## Variables de Entorno

Crea un archivo `.env` en `backend/` basado en `.env.example`:

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `PORT` | Puerto del servidor Express | `3001` |
| `DB_HOST` | Host de la base de datos MySQL | `127.0.0.1` |
| `DB_PORT` | Puerto de MySQL | `3306` |
| `DB_NAME` | Nombre de la base de datos | `gestor_proyectos` |
| `DB_USER` | Usuario de MySQL | `root` |
| `DB_PASS` | Contraseña de MySQL | `****` |
| `JWT_SECRET` | Clave secreta para firmar **access tokens** | `****` |
| `JWT_EXPIRES_IN` | Duración del access token (vida corta) | `15m` |
| `JWT_REFRESH_SECRET` | Clave secreta para firmar **refresh tokens** (distinta a `JWT_SECRET`) | `****` |
| `JWT_REFRESH_EXPIRES_IN` | Duración del refresh token (vida larga) | `7d` |
| `DATABASE_URL` | URL de conexión Prisma | `mysql://user:pass@host:port/db` |

---

## Ejecución

### Desarrollo (Hot Reload)

```bash
cd backend
npm run dev
```

- **API:** [http://localhost:3001](http://localhost:3001)
- **Swagger Docs:** [http://localhost:3001/api-docs](http://localhost:3001/api-docs)
- **Health Check:** [http://localhost:3001/health](http://localhost:3001/health)

### Producción

```bash
cd backend
npm run build    # Compila TypeScript → dist/
npm start        # Ejecuta dist/server.js
```

---

## Docker

El proyecto incluye un `docker-compose.yml` que orquesta **3 contenedores** que conforman el stack completo:

```mermaid
flowchart LR
    classDef user     fill:#F0FDF4,stroke:#16A34A,stroke-width:2px,color:#14532D
    classDef frontend fill:#41B883,stroke:#35495E,stroke-width:2px,color:#ffffff
    classDef backend  fill:#EDE9FE,stroke:#6D28D9,stroke-width:2px,color:#4C1D95
    classDef database fill:#DBEAFE,stroke:#1D4ED8,stroke-width:2px,color:#1E3A8A
    classDef volume   fill:#FEF9C3,stroke:#CA8A04,stroke-width:1px,color:#713F12

    Browser[" Navegador\n(Usuario)"]:::user

    subgraph Docker [" Docker Compose — Stack Completo"]
        direction LR

        subgraph FE [" Contenedor: e2_frontend"]
            Nginx[" Nginx Alpine\nSirve Vue 3 SPA\nPuerto externo: 8080"]:::frontend
        end

        subgraph BE [" Contenedor: e2_backend"]
            Node[" Node.js 20 Alpine\nExpress + Prisma\nPuerto externo: 3002"]:::backend
        end

        subgraph DB [" Contenedor: e2_mysql"]
            MySQL[" MySQL 8.0\nBase de datos\nPuerto externo: 3307"]:::database
        end

        Vol1[(" backend_uploads\nVolumen Docker")]:::volume
        Vol2[(" db_data\nVolumen Docker")]:::volume
    end

    Browser -- "HTTP :8080" --> Nginx
    Nginx -- "proxy /api/* → :3001" --> Node
    Node -- "TCP :3306" --> MySQL
    Node --- Vol1
    MySQL --- Vol2
```

| Contenedor | Imagen | Puerto Host | Puerto Interno | Descripción |
|---|---|---|---|---|
| `e2_frontend` | Nginx Alpine (build Vite) | `8080` | `80` | SPA Vue 3 servida por Nginx |
| `e2_backend` | Node.js 20 Alpine | `3002` | `3001` | API REST Express + Prisma |
| `e2_mysql` | MySQL 8.0 | `3307` | `3306` | Base de datos relacional |

### Comandos

```bash
# Levantar todo el stack (desde la raíz del proyecto)
docker compose up --build -d

# Ver logs en tiempo real
docker compose logs -f

# Detener los servicios
docker compose down

# Detener y eliminar volúmenes (borra los datos de la BD)
docker compose down -v
```

### Características del contenedor Backend

- **Build multi-stage:** Etapa de compilación (TypeScript → JavaScript) y etapa de producción ligera (`node:20-alpine`).
- **`npm ci`:** Instala dependencias exactas del lockfile — builds reproducibles y más rápidos que `npm install`.
- **`dos2unix` pre-instalado:** Convierte el `docker-entrypoint.sh` para evitar problemas de saltos de línea en Linux.
- **Usuario no-root:** El proceso final corre como `node` (no `root`) por seguridad.
- **Migraciones automáticas:** El `docker-entrypoint.sh` ejecuta `prisma db push` al arrancar.
- **Volumen persistente:** Los archivos subidos (`uploads/`) se persisten mediante un volumen Docker.
- **`.dockerignore`:** Excluye `node_modules/`, `uploads/`, `dist/`, `.env`, `tests/` y `coverage/` del contexto de build.

### Características del contenedor Frontend

- **Build multi-stage:** Etapa `build` con Node.js 20 Alpine (compila con Vite) y etapa `production` con Nginx.
- **`npm ci`:** Builds reproducibles usando exactamente las versiones del `package-lock.json`.
- **Imagen pinneada:** `nginx:1.27-alpine` — versión fija para evitar cambios inesperados en producción.
- **Imagen final mínima:** Solo contiene el `dist/` compilado + Nginx. Sin Node.js, sin `node_modules`, sin código fuente.
- **`.dockerignore`:** Excluye `node_modules/` y `dist/` locales para que Vite compile desde cero dentro del contenedor.

> Para instrucciones detalladas del frontend (instalación, variables, proxy), consulta [`frontend/README.md`](./frontend/README.md).

---

## Endpoints de la API

> Documentación interactiva completa en **[/api-docs](http://localhost:3001/api-docs)** (Swagger UI).  
> **Colección Postman:** [Deltos_API_Postman_Collection.json](./Deltos_API_Postman_Collection.json) (Importable en Postman).

### Autenticación (`/api/auth`)

| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/api/auth/register` | Registrar nuevo usuario (devuelve `token` + `refreshToken`) |
| `POST` | `/api/auth/login` | Iniciar sesión (devuelve `token` + `refreshToken`) |
| `POST` | `/api/auth/refresh` | Renovar el access token enviando el `refreshToken` en el body |
| `GET` | `/api/auth/me` | Obtener perfil del usuario autenticado |
| `POST` | `/api/auth/logout` | Cerrar sesión |
| `PUT` | `/api/auth/profile` | Actualizar información personal |
| `PUT` | `/api/auth/password` | Cambiar contraseña |
| `POST` | `/api/auth/avatar` | Subir foto de perfil (multipart) |


### Rutas de Administrador (`/api/admin/...`) — Rol: `ADMIN`

<details>
<summary><b>Usuarios</b> — <code>/api/admin/usuarios</code></summary>

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/` | Listar usuarios (paginado, filtrable) |
| `GET` | `/exportar` | Exportar usuarios a Excel (.xlsx) |
| `POST` | `/` | Crear usuario |
| `GET` | `/:id` | Obtener usuario por ID |
| `PUT` | `/:id` | Actualizar usuario |
| `DELETE` | `/:id` | Eliminar usuario |

</details>

<details>
<summary><b>Eventos</b> — <code>/api/admin/eventos</code></summary>

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/` | Listar eventos (paginado) |
| `GET` | `/jueces/disponibles` | Jueces disponibles para asignar |
| `POST` | `/` | Crear evento |
| `GET` | `/:id` | Obtener evento por ID |
| `PUT` | `/:id` | Actualizar evento |
| `DELETE` | `/:id` | Eliminar evento |
| `POST` | `/:id/jueces` | Asignar juez al evento |
| `DELETE` | `/:id/jueces/:userId` | Remover juez del evento |
| `POST` | `/:eventoId/criterios` | Agregar criterio de evaluación |

</details>

<details>
<summary><b>Criterios</b> — <code>/api/admin/criterios</code></summary>

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/:id` | Obtener criterio por ID |
| `PUT` | `/:id` | Actualizar criterio |
| `DELETE` | `/:id` | Eliminar criterio |

</details>

<details>
<summary><b>Equipos</b> — <code>/api/admin/equipos</code></summary>

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/` | Listar equipos (paginado, filtrable) |
| `POST` | `/` | Crear equipo |
| `GET` | `/:id` | Obtener equipo por ID |
| `PUT` | `/:id` | Actualizar equipo |
| `DELETE` | `/:id` | Eliminar equipo |
| `POST` | `/:id/miembros` | Agregar miembro |
| `DELETE` | `/:id/miembros/:participanteId` | Remover miembro |

</details>

<details>
<summary><b>Proyectos</b> — <code>/api/admin/proyectos</code></summary>

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/` | Listar proyectos (paginado, filtrable) |
| `GET` | `/:id` | Obtener proyecto por ID |
| `POST` | `/` | Crear proyecto |
| `PUT` | `/:id` | Actualizar proyecto |
| `DELETE` | `/:id` | Eliminar proyecto |

</details>

<details>
<summary><b>Dashboard, Reportes y Más</b></summary>

| Módulo | Método | Ruta | Descripción |
|--------|--------|------|-------------|
| Dashboard | `GET` | `/api/admin/dashboard` | Métricas del dashboard |
| Dashboard | `POST` | `/api/admin/dashboard/preferences` | Guardar preferencias de widgets |
| Dashboard | `GET` | `/api/admin/dashboard/report` | Generar reporte PDF del dashboard |
| Resultados | `GET` | `/api/admin/resultados` | Ranking de proyectos por evento |
| Resultados | `GET` | `/api/admin/resultados/constancia/:proyectoId/:posicion` | Descargar constancia PDF |
| Constancias | `GET` | `/api/admin/constancias` | Listar constancias |
| Constancias | `GET` | `/api/admin/constancias/:id` | Detalle de constancia |
| Reportes | `GET` | `/api/admin/reportes` | Estadísticas generales |
| Reportes | `GET` | `/api/admin/reportes/usuarios/pdf` | PDF de usuarios |
| Reportes | `GET` | `/api/admin/reportes/equipos/pdf` | PDF de equipos |
| Reportes | `GET` | `/api/admin/reportes/eventos/pdf` | PDF de eventos |
| Reportes | `GET` | `/api/admin/reportes/proyectos/pdf` | PDF de proyectos |
| Carreras | `GET/POST` | `/api/admin/carreras` | CRUD catálogo de carreras |
| Carreras | `GET/PUT/DELETE` | `/api/admin/carreras/:id` | Operaciones por ID |
| Perfiles | `GET/POST` | `/api/admin/perfiles` | CRUD catálogo de perfiles |
| Perfiles | `GET/PUT/DELETE` | `/api/admin/perfiles/:id` | Operaciones por ID |

</details>

### Rutas de Juez (`/api/juez/...`) — Rol: `JUEZ`

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/juez/dashboard` | Dashboard del juez |
| `GET` | `/api/juez/eventos/:eventoId` | Detalle de evento asignado |
| `GET` | `/api/juez/evaluacion/:proyectoId` | Formulario de evaluación |
| `POST` | `/api/juez/evaluacion/:proyectoId` | Guardar evaluación |

### Rutas de Participante (`/api/participante/...`) — Rol: `PARTICIPANTE`

<details>
<summary><b>Ver todos los endpoints del participante</b></summary>

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/dashboard` | Dashboard completo del participante |
| `GET` | `/dashboard/registro-inicial` | Datos para registro académico |
| `POST` | `/dashboard/registro-inicial` | Guardar registro académico |
| `GET` | `/eventos-disponibles` | Eventos abiertos para inscripción |
| `GET` | `/eventos-proximos` | Alias de eventos disponibles |
| `GET` | `/equipos-disponibles` | Equipos con vacantes en un evento |
| `POST` | `/equipos` | Crear equipo y proyecto |
| `DELETE` | `/equipos/salir` | Abandonar equipo |
| `GET` | `/avances` | Listar avances del proyecto |
| `POST` | `/avances` | Registrar nuevo avance |
| `PUT` | `/avances/:id` | Actualizar avance |
| `DELETE` | `/avances/:id` | Eliminar avance |
| `GET` | `/invitaciones/mis` | Invitaciones recibidas |
| `POST` | `/invitaciones/equipo/:equipoId` | Enviar invitación |
| `GET` | `/invitaciones/equipo/:equipoId/enviadas` | Invitaciones enviadas |
| `POST` | `/invitaciones/:id/aceptar` | Aceptar invitación |
| `POST` | `/invitaciones/:id/rechazar` | Rechazar invitación |
| `GET` | `/resultados` | Resultados/ranking del participante |

</details>

### Rutas del Sistema

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/` | Health check con info de la API |
| `GET` | `/health` | Health check simple |
| `GET` | `/api-docs` | Swagger UI (documentación interactiva) |

---

## Scripts Disponibles

| Script | Comando | Descripción |
|--------|---------|-------------|
| **dev** | `npm run dev` | Servidor de desarrollo con hot reload (tsx watch) |
| **build** | `npm run build` | Compilar TypeScript a JavaScript (`dist/`) |
| **start** | `npm start` | Ejecutar el build de producción |
| **seed** | `npm run seed` | Poblar la base de datos con datos iniciales |
| **test** | `npm test` | Ejecutar toda la suite de tests |
| **test:watch** | `npm run test:watch` | Tests en modo watch (re-ejecuta al guardar) |
| **test:coverage** | `npm run test:coverage` | Tests con reporte de cobertura de código |

### Comandos Prisma útiles

```bash
npx prisma studio          # Editor visual de base de datos
npx prisma db push         # Sincronizar esquema sin migración
npx prisma migrate dev     # Crear migración de desarrollo
npx prisma generate        # Regenerar el cliente Prisma
```

---

## Testing

El proyecto implementa **dos niveles de tests** con Jest + ts-jest, todos sin necesidad de BD real (mocks de Prisma).

### Ejecutar los tests

```bash
cd backend

# Todos los tests (unitarios + integración)
npm test

# Modo watch — se re-ejecuta al guardar un archivo
npm run test:watch

# Reporte de cobertura de código (genera carpeta coverage/)
npm run test:coverage
```

### Estructura de tests

```
backend/tests/
├── jest.setup.ts              # Variables de entorno para el entorno de test
│
├── unit/                      # Tests UNITARIOS (services con mocks — sin BD)
│   ├── auth.service.test.ts   # 5 tests — login, refresh, getMe
│   ├── evento.service.test.ts # 5 tests — fechas, 404, delete validations
│   └── proyecto.service.test.ts # 5 tests — paginación, 404, create/update/delete
│
└── auth.test.ts               # Tests de INTEGRACIÓN (HTTP con supertest + mock Prisma)
```

### Inventario de tests

| Tipo | Archivo | Tests | Qué prueba |
|------|---------|-------|-----------|
| **Unitario** | `unit/auth.service.test.ts` | 5 | Login inválido, contraseña incorrecta, tokens generados, refresh inválido, getMe 404 |
| **Unitario** | `unit/evento.service.test.ts` | 5 | Evento 404, fecha pasada, fecha_fin inválida, delete 404, delete evento activo |
| **Unitario** | `unit/proyecto.service.test.ts` | 5 | Paginación, 404 en get/update/delete, create exitoso |
| **Integración** | `auth.test.ts` | 5 | Login HTTP 200, sin token 401, rol incorrecto 403, email vacío 400, password wrong 401 |
| | | **20 total** | |

> Los tests unitarios usan **mocks del repositorio** — se inyecta un objeto con `jest.fn()` en el constructor del Service, por lo que nunca tocan Prisma ni MySQL. Los tests de integración usan `supertest` + `jest.mock('../src/prisma.config')`.

---

## Pipeline CI/CD

El proyecto utiliza **GitHub Actions** con cuatro workflows:

```
.github/workflows/
├── ci.yml            # Integración Continua — push/PR a master
├── cd.yml            # Entrega Continua    — push a master (Docker Hub)
├── security.yml      # Auditoría de seguridad — push + semanal
└── docker-verify.yml # Verificación de Dockerfiles — cuando cambian
```

### Flujo completo

```
Push / PR a master
        │
        ▼
┌─────────────────────────────────┐   ┌──────────────────────────────────┐
│       CI — backend-ci           │   │       CI — frontend-ci           │
│   checkout                    │   │   checkout                     │
│   Node.js 20 + npm cache      │   │   Node.js 20 + npm cache       │
│   npm ci                      │   │   npm ci                       │
│   tsc --noEmit (type-check)   │   │   Vite build                   │
│   Tests unitarios (15 tests)  │   │   Artefacto dist/              │
│   Tests integración (5 tests) │   └──────────────────────────────────┘
│   jest --coverage             │
│   npm run build               │
│   Artefacto dist/ + coverage  │
└─────────────────────────────────┘
        │
        │  Solo en push directo a master (merge aprobado)
        ▼
┌─────────────────────────────────────────────────────────────┐
│              CD — docker-build-push                          │
│   Tagging automático (latest + sha)                       │
│   Login en Docker Hub                                     │
│   Build multi-plataforma (linux/amd64 + linux/arm64)     │
│   Push → <usuario>/deltos-backend:latest                  │
│   Push → <usuario>/deltos-frontend:latest                 │
│   Resumen del deploy en GitHub Actions                    │
└─────────────────────────────────────────────────────────────┘
```

### Configurar el pipeline (paso a paso)

#### 1. Secrets de GitHub requeridos

Ve a tu repositorio → **Settings → Secrets and variables → Actions → New repository secret**:

| Secret / Variable | Tipo | Valor |
|---|---|---|
| `DOCKERHUB_TOKEN` | Secret | Access Token de Docker Hub (no la contraseña) |
| `DOCKERHUB_USERNAME` | **Variable** (no secret) | Tu usuario de Docker Hub |
| `JWT_SECRET` | Secret | Valor seguro para el JWT de los tests |
| `JWT_REFRESH_SECRET` | Secret | Valor seguro para el refresh token de los tests |

> `DOCKERHUB_USERNAME` va en **Variables** (no Secrets) porque se referencia con `vars.` en el workflow.

#### 2. Obtener un Access Token de Docker Hub

1. Ir a [hub.docker.com](https://hub.docker.com) → **Account Settings → Personal Access Tokens**
2. Crear un token con permiso **Read & Write**
3. Copiar el token y guardarlo como `DOCKERHUB_TOKEN` en GitHub Secrets

#### 3. Comportamiento del CI (sin configuración adicional)

El CI **funciona sin ningún secret configurado** — los tests no necesitan BD real ya que usan mocks de Prisma. Los secretos solo son necesarios para el step de Docker Hub en el CD.

### Badges de estado

```markdown
![CI Status](https://github.com/LeonardoSGP/e2_backend/actions/workflows/ci.yml/badge.svg)
![CD Status](https://github.com/LeonardoSGP/e2_backend/actions/workflows/cd.yml/badge.svg)
![Security](https://github.com/LeonardoSGP/e2_backend/actions/workflows/security.yml/badge.svg)
![Docker Verify](https://github.com/LeonardoSGP/e2_backend/actions/workflows/docker-verify.yml/badge.svg)
```

---

## Buenas Prácticas y Notas

- **Validación de entorno:** Las variables de entorno se validan al arrancar usando Zod. Si faltan o son inválidas, el servidor no arranca y muestra errores descriptivos.
- **Autenticación JWT:** Todos los endpoints (excepto `/api/auth/register`, `/api/auth/login`, `/health` y `/`) requieren un token Bearer válido.
- **Control de acceso por roles:** Tres roles (`ADMIN`, `JUEZ`, `PARTICIPANTE`) con guards middleware por grupo de rutas.
- **Validación de entrada:** Schemas Zod en cada módulo para validación de payloads antes de llegar al servicio.
- **Manejo de errores centralizado:** Clase `AppError` personalizada + middleware global que captura excepciones y errores de validación.
- **Serialización BigInt:** Los mappers convierten `BigInt` de Prisma a `number` antes de serializar, evitando el error `TypeError: Do not know how to serialize a BigInt`.
- **Migraciones Docker automáticas:** `docker-entrypoint.sh` ejecuta `prisma db push` al iniciar el contenedor, evitando desincronización del esquema.
- **Soft Deletes:** Los modelos `carreras` y `perfiles` implementan soft delete via campo `deleted_at`.
- **Generación de reportes:** PDFs generados con PDFKit y exportaciones Excel con ExcelJS, ambos streameados directamente al cliente.

---

## Autores

| Nombre | Rol |
|--------|-----|
| **García Pino Leonardo Sadot** | Desarrollo Backend & Frontend |
| **Hernández Díaz Leonardo** | Desarrollo Backend & Frontend |
| **Sánchez Pérez Carlos Raúl** | Desarrollo Backend & Frontend |

---

<p align="center">
  <sub>
    Hecho con usando Node.js, Express, TypeScript y Prisma — Deltos &copy; 2026
  </sub>
</p>
