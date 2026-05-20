<p align="center">
  <h1 align="center">️ Deltos — Frontend Vue 3</h1>
  <p align="center">
    Interfaz de usuario construida con <strong>Vue 3</strong>, <strong>Vite</strong>, <strong>Pinia</strong> y <strong>Tailwind CSS</strong> para el Sistema de Gestión de Proyectos Académicos.
  </p>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Vue-3.5-41B883?logo=vue.js&logoColor=white" alt="Vue 3" />
  <img src="https://img.shields.io/badge/Vite-5.x-646CFF?logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/TypeScript-6.0-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Pinia-2.x-F7D336?logo=pinia&logoColor=black" alt="Pinia" />
  <img src="https://img.shields.io/badge/TailwindCSS-4.x-06B6D4?logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
</p>

---

##  Tabla de Contenidos

- [Tecnologías](#-tecnologías)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Requisitos Previos](#-requisitos-previos)
- [Instalación](#-instalación)
- [Conexión al Backend](#-conexión-al-backend)
- [Ejecución](#-ejecución)
- [Construcción para Producción](#-construcción-para-producción)
- [Docker](#-docker)
- [Variables de Entorno](#-variables-de-entorno)

---

##  Tecnologías

| Categoría        | Tecnología                              |
|------------------|-----------------------------------------|
| **Framework**    | Vue 3 (Composition API)                 |
| **Lenguaje**     | TypeScript 6.x                          |
| **Build Tool**   | Vite 5.x                                |
| **Estado**       | Pinia 2.x                               |
| **Routing**      | Vue Router 4.x                          |
| **HTTP Client**  | Axios 1.x                               |
| **CSS**          | Tailwind CSS 4.x                        |
| **Gráficas**     | Chart.js + vue-chartjs                  |
| **Iconos**       | lucide-vue-next                         |
| **Alertas**      | SweetAlert2                             |
| **PDF**          | html2pdf.js                             |
| **Servidor**     | Nginx (en producción / Docker)          |

---

##  Estructura del Proyecto

```
frontend/
├── Dockerfile              # Build multi-stage (Vite + Nginx)
├── nginx.conf              # Configuración de Nginx con proxy al backend
├── index.html              # Punto de entrada HTML
├── vite.config.ts          # Configuración de Vite y proxy de desarrollo
├── package.json
├── tsconfig.json
└── src/
    ├── main.ts             # Punto de entrada de la aplicación
    ├── App.vue             # Componente raíz
    ├── assets/             # Recursos estáticos (imágenes, fuentes)
    ├── components/         # Componentes reutilizables globales
    ├── composables/        # Composables (lógica reutilizable)
    ├── constants/          # Constantes de la aplicación
    ├── features/           # Módulos de dominio (por funcionalidad)
    ├── layouts/            # Layouts de página (Admin, Juez, Participante)
    ├── plugins/            # Plugins de Vue (axios, etc.)
    ├── router/             # Definición de rutas (vue-router)
    ├── services/           # Servicios HTTP (llamadas a la API)
    ├── stores/             # Stores de Pinia (estado global)
    ├── utils/              # Funciones auxiliares
    └── views/              # Vistas/páginas de la aplicación
```

---

##  Requisitos Previos

- **Node.js** ≥ 20
- **npm** (incluido con Node.js)
- El **backend** corriendo en `http://localhost:3001` (ver [`../backend/README.md`](../README.md))

---

## ️ Instalación

```bash
# Desde la raíz del repositorio, entrar al directorio frontend
cd frontend

# Instalar dependencias
npm install
```

---

##  Conexión al Backend

El frontend se comunica con el backend a través de **Axios** y las **variables de entorno**.

### En modo desarrollo (Vite Proxy)

El archivo `vite.config.ts` ya incluye un proxy que redirige automáticamente las llamadas `/api` y `/uploads` al backend:

```ts
// vite.config.ts
server: {
  port: 5173,
  proxy: {
    '/api': {
      target: 'http://localhost:3001',   // ← URL del backend
      changeOrigin: true
    },
    '/uploads': {
      target: 'http://localhost:3001',
      changeOrigin: true
    }
  }
}
```

>  **No es necesario ningún cambio** si el backend corre en `localhost:3001` (puerto por defecto). El proxy evita problemas de CORS en desarrollo.

Si el backend corre en otro puerto, cambia el valor de `target` en `vite.config.ts`.

### En modo producción (Docker / Nginx)

En producción, el `nginx.conf` actúa como proxy inverso hacia el contenedor del backend:

```nginx
location /api/ {
    proxy_pass http://backend:3001;
}
location /uploads/ {
    proxy_pass http://backend:3001;
}
```

El nombre `backend` corresponde al nombre del servicio definido en `docker-compose.yml`. No se requiere configuración adicional al usar Docker Compose.

---

##  Ejecución

### Desarrollo (con hot reload)

```bash
# Asegúrate de estar en el directorio frontend/
cd frontend
npm run dev
```

- **Frontend:** [http://localhost:5173](http://localhost:5173)
- El proxy redirige `/api/*` → `http://localhost:3001`

> ️ El backend debe estar corriendo antes de iniciar el frontend. Consulta la [guía de ejecución del backend](../README.md#-ejecución).

### Preview del build de producción

```bash
npm run build    # Compila el proyecto → dist/
npm run preview  # Sirve el build localmente en http://localhost:4173
```

---

##  Construcción para Producción

```bash
npm run build
```

Los archivos compilados se generan en `frontend/dist/`. Esta carpeta es la que Nginx sirve en el contenedor Docker.

---

##  Docker

El frontend tiene su propio `Dockerfile` con **build multi-stage**:

1. **Etapa `build`** — Node.js 20 Alpine: instala dependencias y compila con Vite.
2. **Etapa `prod`** — Nginx Alpine: sirve el `dist/` resultante.

### Levantar solo el frontend (con docker compose)

```bash
# Desde la raíz del repositorio
docker compose up frontend --build
```

### Levantar todo el stack completo

```bash
# Desde la raíz del repositorio
docker compose up --build -d
```

Servicios disponibles tras levantar el stack:

| Servicio        | URL                                    |
|-----------------|----------------------------------------|
| Frontend Vue    | http://localhost:8080                  |
| Backend API     | http://localhost:3002                  |
| Swagger Docs    | http://localhost:3002/api-docs         |
| MySQL           | localhost:3307                         |

---

##  Variables de Entorno

El frontend en **modo desarrollo** no requiere un archivo `.env` gracias al proxy de Vite.

Si necesitas configurar la URL base de la API manualmente (por ejemplo, para apuntar a un backend remoto), puedes crear un `.env` en `frontend/`:

```env
# frontend/.env
VITE_API_BASE_URL=http://localhost:3001
```

Y usar la variable en tu código:

```ts
const apiBase = import.meta.env.VITE_API_BASE_URL ?? '/api'
```

> ️ En producción con Docker, la URL la gestiona Nginx automáticamente. No se necesita `.env`.

---

<p align="center">
  <sub>
    Hecho con ️ usando Vue 3, Vite y Tailwind CSS — Deltos &copy; 2026
  </sub>
</p>
