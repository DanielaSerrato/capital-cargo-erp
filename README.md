# Capital Cargo Colombia — ERP Logístico

Sistema de gestión integral para Capital Cargo Colombia: conductores, propietarios, vehículos, documentos, validaciones RUNT y expedientes operativos.

**Estado:** Fase 1 — Maestros y expedientes  
**Stack:** Next.js + Supabase (PostgreSQL + Storage + Edge Functions)  
**Deploy:** Vercel (frontend) + Supabase (backend)

---

## Arquitectura

```
┌──────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                  │
│  Admin Panel · Formularios vinculación · Expedientes  │
└──────────────┬───────────────────────┬───────────────┘
               │                       │
    ┌──────────▼──────────┐  ┌────────▼────────────┐
    │   Supabase (BaaS)   │  │  API RUNT (Render)   │
    │  PostgreSQL + RLS   │  │  FastAPI proxy       │
    │  Storage (docs)     │  │  Captcha + consulta  │
    │  Edge Functions     │  └──────────────────────┘
    │  Realtime           │
    └─────────────────────┘
```

## Módulos (roadmap)

| Fase | Módulo | Estado |
|------|--------|--------|
| 1 | Maestros y expedientes | 🔨 En desarrollo |
| 2 | Documentos y validaciones | Pendiente |
| 3 | Autogestión (portal conductor/propietario) | Pendiente |
| 4 | Operaciones e integración Sysran | Pendiente |
| 5 | Seguimiento, finanzas y analítica | Pendiente |

## Estructura del proyecto

```
capital-cargo-erp/
├── README.md
├── .env.example
├── .gitignore
├── docker-compose.yml          # Entorno local (Supabase local)
├── package.json
│
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/             # Login, password gate
│   │   ├── (admin)/            # Panel administrativo
│   │   │   ├── conductores/    # Listado + detalle conductor
│   │   │   ├── propietarios/   # Listado + detalle propietario
│   │   │   ├── vehiculos/      # Listado + detalle vehículo
│   │   │   └── expedientes/    # Vista consolidada por placa
│   │   ├── vinculacion/        # Formularios públicos
│   │   │   ├── conductor/
│   │   │   ├── propietario/
│   │   │   ├── vehiculo/
│   │   │   └── trailer/
│   │   └── layout.tsx
│   ├── components/             # Componentes compartidos
│   │   ├── ui/                 # Primitivos (Button, Badge, Input, Table, etc.)
│   │   ├── forms/              # Componentes de formulario
│   │   ├── detail/             # Panel de detalle, tabs, secciones
│   │   └── layout/             # Nav, Sidebar, TopBar
│   ├── lib/                    # Utilidades y configuración
│   │   ├── supabase/           # Cliente, tipos, helpers
│   │   ├── constants.ts        # Estados, document types, etc.
│   │   └── utils.ts            # titleCase, formatDate, etc.
│   └── types/                  # TypeScript types/interfaces
│       ├── conductor.ts
│       ├── propietario.ts
│       ├── vehiculo.ts
│       ├── runt.ts
│       └── audit.ts
│
├── supabase/
│   ├── migrations/             # Migraciones SQL ordenadas
│   │   ├── 00001_initial_schema.sql
│   │   ├── 00002_split_name_fields.sql
│   │   └── ...
│   ├── functions/              # Edge Functions (Deno)
│   │   ├── enrich-runt/
│   │   └── sync-sharepoint/
│   ├── seed.sql                # Datos de prueba
│   └── config.toml             # Config Supabase local
│
├── tests/
│   ├── e2e/                    # Pruebas end-to-end
│   ├── integration/            # Pruebas de integración
│   └── unit/                   # Pruebas unitarias
│
├── docs/
│   ├── plan_maestro.md         # Plan ERP completo
│   ├── modulo_1_mejora.md      # Plan detallado Fase 1
│   ├── modelo_datos.md         # Diccionario de datos
│   ├── estados.md              # Definición de estados
│   └── api_contracts.md        # Contratos de API
│
├── infra/                      # IaC (cuando aplique)
│   └── vercel.json
│
└── .github/
    └── workflows/
        ├── ci.yml              # Lint + tests en PR
        └── deploy.yml          # Deploy a Vercel + Supabase
```

## Entidades principales

| Entidad | Tabla actual | Propósito |
|---------|-------------|-----------|
| Conductores | `conductores` | Datos personales, documentos, banking, referencias |
| Propietarios | `propietarios` | Datos personales, documentos, banking |
| Vehículos | `vehiculos` | Placa, tipo, docs, satelital |
| Trailers | `trailers` | Placa trailer, docs |
| RUNT Licencias | `runt_licencias` | Validación licencias de conducción |
| RUNT Vehículos | `runt_vehiculos` | Validación datos vehiculares |
| Auditoría | `audit_events` (por crear) | Historial de cambios |

## Modelo de estados

| Dimensión | Valores | Aplica a |
|-----------|---------|----------|
| Registro | Incompleto / Completo | Todas las entidades |
| Revisión | Pendiente / En revisión / Aprobado / Rechazado | Todas las entidades |
| Documentación | Faltante / Recibida / Aprobada / Rechazada / Vencida | Por documento |
| Consulta RUNT | No consultado / Ejecutando / Éxito / Error técnico | Conductores, Vehículos |
| Resultado RUNT | Sin resultado / Conforme / Con novedades | Conductores, Vehículos |

## Setup local

```bash
# Clonar
git clone https://github.com/DanielaSerrato/capital-cargo-erp.git
cd capital-cargo-erp

# Instalar dependencias
npm install

# Copiar variables de entorno
cp .env.example .env.local

# Levantar Supabase local (opcional)
npx supabase start

# Desarrollo
npm run dev
```

## Proyectos relacionados

| Proyecto | Repo | Descripción |
|----------|------|-------------|
| Formularios vinculación | [vinculacion-app](https://github.com/DanielaSerrato/vinculacion-app) | Formularios HTML actuales (migrar a este proyecto) |
| API RUNT | [api-licencia](https://github.com/DanielaSerrato/api-licencia) | Proxy FastAPI al RUNT en Render |

## Decisiones de arquitectura

1. **Next.js App Router** — SSR, componentes servidor, layouts anidados. Permite separar admin de formularios públicos.
2. **Supabase** — PostgreSQL con RLS, Storage para documentos, Edge Functions para enrichment. Ya en uso.
3. **Vercel** — Deploy automático desde GitHub, preview deployments, CDN global.
4. **Migraciones versionadas** — Toda modificación de schema pasa por migration files numerados.
5. **Auditoría desde día 1** — Tabla `audit_events` registra quién, cuándo, qué cambió.

## Equipo

- **Gerencia:** gerencia@capitalcargocolombia.com
- **Desarrollo:** Daniela Serrato

---

Capital Cargo Colombia · NIT 900491068-0
