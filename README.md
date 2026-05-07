# PokeBox Shop

Una plataforma completa para comprar, abrir y comerciar con cajas de Pokémon. Incluye un sistema de pagos integrado, autenticación de usuarios y un entorno interactivo para coleccionar.

## Descripción del Proyecto

PokeBox Shop es una aplicación fullstack que permite a los usuarios:

- **Comprar cajas** de Pokémon con diferentes rarezas y precios
- **Abrir cajas** y revelar de forma interactiva el contenido
- **Comerciar** con otros usuarios
- **Gestionar inventario** de cartas y objetos
- **Participar en batallas** contra otros jugadores
- **Sistema de recompensas** y mejoras
- **Pagos seguros** integrados con Stripe
- **Entregas** de objetos digitales

## Stack Tecnológico

### Backend
- **Node.js** con Express.js
- **Stripe API** para procesamiento de pagos
- **TypeScript** para type safety
- **Webhooks** de Stripe para eventos de pago

### Frontend
- **React** con TypeScript
- **Vite** como bundler
- **Tailwind CSS** + **shadcn/ui** para componentes
- **Material-UI (MUI)** para iconografía
- **Supabase** para autenticación y base de datos

### Herramientas de Desarrollo
- **pnpm** como gestor de paquetes (monorepo)
- **PostCSS** para procesamiento de CSS

## 📁 Estructura del Proyecto

```
pokebox-shop/
├── backend/                 # API Backend con Express
│   ├── api/
│   │   ├── payments/        # Endpoints de pagos y webhooks
│   │   │   ├── checkout.ts
│   │   │   └── webhook.ts
│   ├── database/            # Esquema de base de datos
│   ├── lib/                 # Librerías compartidas
│   │   ├── pokecoin-packages.ts
│   │   ├── stripe.ts
│   │   └── types/
│   └── src/                 # Código principal
│
├── frontend/                # Aplicación React + Vite
│   ├── src/
│   │   ├── app/
│   │   │   ├── App.tsx      # Componente principal
│   │   │   └── components/  # Componentes de UI
│   │   │       ├── auth/    # Autenticación
│   │   │       ├── battles/  # Sistema de batallas
│   │   │       ├── boxes/    # Gestión de cajas
│   │   │       ├── cases/    # Apertura de cajas
│   │   │       ├── dashboard/ # Panel principal
│   │   │       ├── payment/   # Pagos
│   │   │       ├── inventory/ # Inventario
│   │   │       ├── delivery/  # Entregas
│   │   │       ├── rewards/   # Recompensas
│   │   │       └── ui/        # Componentes genéricos
│   │   ├── context/         # Contexto de React (Auth)
│   │   ├── database/        # Esquema local
│   │   ├── lib/             # Utilidades
│   │   └── assets/          # Recursos estáticos
│   ├── vite.config.ts
│   └── index.html
│
├── guidelines/              # Guías del proyecto
├── pnpm-workspace.yaml     # Configuración del monorepo
└── README.md                # Este archivo
```

## 🚀 Instalación y Configuración

### Requisitos Previos
- **Node.js** v18 o superior
- **pnpm** v8 o superior (instalar con `npm install -g pnpm`)
- Cuenta de **Stripe** (para pagos)
- Proyecto de **Supabase** (para autenticación)

### Instalación Inicial

1. **Clonar el repositorio:**
```bash
git clone <tu-repo>
cd pokebox-shop
```

2. **Instalar dependencias:**
```bash
pnpm install
```

3. **Configurar variables de entorno:**

#### Backend (.env)
```bash
cd backend
cp .env.example .env
```

Agregar las variables:
```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
DATABASE_URL=...
```

#### Frontend (.env.local)
```bash
cd ../frontend
cp .env.example .env.local
```

Agregar las variables:
```
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

## 💻 Desarrollo

### Iniciar el servidor de desarrollo

**Terminal 1 - Backend:**
```bash
cd backend
pnpm dev
```
El backend estará disponible en `http://localhost:3000` (o el puerto configurado)

**Terminal 2 - Frontend:**
```bash
cd frontend
pnpm dev
```
El frontend estará disponible en `http://localhost:5173`

### Build para Producción

```bash
# Backend
cd backend
pnpm build

# Frontend
cd frontend
pnpm build
```

## 🔐 Configuración de Servicios

### Stripe

1. Crear una cuenta en [stripe.com](https://stripe.com)
2. Obtener las claves API desde el dashboard
3. Configurar webhooks para eventos de pago
4. Ver [STRIPE_SETUP.md](STRIPE_SETUP.md) para instrucciones detalladas

### Supabase

1. Crear un proyecto en [supabase.com](https://supabase.com)
2. Configurar autenticación (Email/Password)
3. Ver [README_SUPABASE.md](frontend/src/app/README_SUPABASE.md) para detalles

## 📚 Documentación Adicional

- [STRIPE_SETUP.md](STRIPE_SETUP.md) - Guía completa de integración con Stripe
- [frontend/src/app/QUICK_START.md](frontend/src/app/QUICK_START.md) - Guía rápida del frontend
- [frontend/src/app/PROJECT_STRUCTURE.md](frontend/src/app/PROJECT_STRUCTURE.md) - Estructura detallada del proyecto
- [frontend/src/app/SUPABASE_SETUP.md](frontend/src/app/SUPABASE_SETUP.md) - Configuración de Supabase

## ✨ Características Principales

- ✅ **Autenticación segura** con Supabase
- ✅ **Pagos integrados** con Stripe
- ✅ **Sistema de cajas** coleccionables
- ✅ **Apertura interactiva** de cajas
- ✅ **Gestión de inventario**
- ✅ **Comercio entre usuarios**
- ✅ **Batallas Pokémon**
- ✅ **Sistema de recompensas**
- ✅ **Entregas digitales**
- ✅ **Interfaz responsiva** y moderna
- ✅ **Componentes reutilizables** con shadcn/ui

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/mi-feature`)
3. Commit tus cambios (`git commit -m 'Agregar mi feature'`)
4. Push a la rama (`git push origin feature/mi-feature`)
5. Abre un Pull Request

## 📄 Licencia

ISC

## 📞 Soporte

Para reportar bugs o sugerencias, abre un issue en el repositorio.

---

**Última actualización:** Mayo 2026
