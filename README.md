# 🎬 WAGWAN Movie

<div align="center">

![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-5.x-000000?style=for-the-badge&logo=express&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Supabase](https://img.shields.io/badge/Supabase-Storage%20%26%20DB-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Vercel](https://img.shields.io/badge/Deploy-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)

</div>

WAGWAN Movie es una plataforma web para explorar, consultar y gestionar un catálogo de películas. La aplicación combina una experiencia de usuario enfocada en contenido cinematográfico con un panel administrativo para administrar la colección, cargar imágenes y controlar el estado del contenido.

## Visión general

El proyecto está diseñado para ofrecer:

- Un catálogo público con películas organizadas visualmente
- Detalles de cada título con información relevante
- Administración de contenido desde un panel interno
- Manejo de portadas e imágenes mediante Supabase Storage
- Gestión de autenticación para usuarios administradores
- API REST para integración entre frontend y backend

## Funcionalidades principales

- Catálogo de películas con navegación intuitiva
- Vista individual de cada película
- Panel administrativo con login
- Creación, edición y eliminación lógica de registros
- Cambio de estado de publicación
- Gestión de contenidos destacados o en promoción
- Carga de imágenes en almacenamiento remoto
- Despliegue preparado para Vercel

## Stack tecnológico

- Node.js
- Express
- JavaScript
- Supabase
- HTML5
- CSS3
- Multer
- dotenv
- CORS
- Vercel

## Estructura del proyecto

```text
wagwan-movie/
├── public/
│   ├── css/
│   ├── data/
│   ├── js/
│   ├── media/
│   └── pages/
├── src/
│   ├── config/
│   ├── controllers/
│   └── routes/
├── package.json
├── server.js
├── vercel.json
├── README.md
└── .env
```

## Requisitos previos

Antes de ejecutar el proyecto, asegúrate de contar con:

- Node.js 18 o superior
- npm
- Una cuenta en Supabase con:
  - URL del proyecto
  - clave del cliente o servicio
  - bucket para almacenamiento de imágenes
  - tablas `peliculas` y `usuarios`

## Instalación y ejecución

1. Clona el repositorio:

```bash
git clone https://github.com/Styngixx/wagwan-movie.git
cd wagwan-movie
```

2. Instala las dependencias:

```bash
npm install
```

3. Crea un archivo `.env` en la raíz del proyecto:

```env
PORT=3600
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_KEY=tu_clave_supabase
NODE_ENV=development
```

4. Inicia la aplicación:

```bash
npm start
```

5. En modo desarrollo:

```bash
npm run dev
```

## URLs de la aplicación

Una vez levantado el servidor, podrás acceder a:

- Frontend: `http://localhost:3600`
- API: `http://localhost:3600/api`
- Administrador: `http://localhost:3600/admin`

## API principal

### Películas

- `GET /api/peliculas` — Obtiene todas las películas
- `GET /api/peliculas/:id` — Obtiene una película por ID
- `POST /api/peliculas` — Crea una nueva película
- `PUT /api/peliculas/:id` — Actualiza una película
- `PATCH /api/peliculas/:id/estado` — Cambia el estado de publicación
- `PATCH /api/peliculas/:id/vitrina` — Actualiza datos de vitrina o destaque

### Autenticación

- `POST /api/auth/login` — Inicia sesión del administrador

## Panel administrativo

El panel permite:

- Iniciar sesión con credenciales de administrador
- Visualizar la colección actual
- Registrar nuevas películas con imagen
- Editar información existente
- Cambiar el estado de contenido
- Gestionar elementos destacados

## Despliegue

El proyecto incluye configuración para desplegarse en Vercel mediante `vercel.json`. Para producción, asegúrate de configurar correctamente las variables de entorno en la plataforma.

## Consideraciones importantes

- No guardar credenciales en el código fuente
- Mantener `.env` fuera del repositorio
- Verificar permisos y políticas de Supabase
- Configurar el bucket de almacenamiento para imágenes correctamente


