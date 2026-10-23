# Contratos de API — Capital Cargo ERP

Rutas conceptuales para el backend. Actualmente Supabase con RLS; estas rutas se implementarían como Next.js API routes o Supabase RPC cuando sea necesario.

## Conductores

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/conductores?search=&estado=&page=&limit=` | Listado paginado |
| GET | `/api/conductores/{id}` | Perfil completo |
| PATCH | `/api/conductores/{id}` | Edición parcial (auditada) |
| GET | `/api/conductores/{id}/historial` | Auditoría de cambios |
| GET | `/api/conductores/{id}/documentos` | Documentos con estado |
| GET | `/api/conductores/{id}/runt` | Validaciones RUNT |

## Propietarios

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/propietarios?search=&estado=&page=&limit=` | Listado paginado |
| GET | `/api/propietarios/{id}` | Perfil completo |
| PATCH | `/api/propietarios/{id}` | Edición parcial (auditada) |
| GET | `/api/propietarios/{id}/vehiculos` | Vehículos vinculados |

## Vehículos

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/vehiculos?search=&estado=&page=&limit=` | Listado paginado |
| GET | `/api/vehiculos/{id}` | Perfil completo |
| PATCH | `/api/vehiculos/{id}` | Edición parcial (auditada) |
| GET | `/api/vehiculos/{id}/relaciones?as_of=` | Conductor + propietario en fecha |

## Expedientes

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/expedientes?placa=&as_of=` | Expediente consolidado por placa |

## Validaciones

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/validaciones/runt` | Iniciar consulta RUNT (auditada) |

## Auditoría

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/audit?entity_type=&entity_id=&page=` | Eventos de auditoría |

## Notas

- Todas las rutas requieren autenticación
- PATCH genera evento en `audit_events` automáticamente
- Paginación con `page` + `limit` (default 50)
- Búsqueda: `search` busca en nombre, cédula, placa
- Filtros: `estado`, `ciudad`, `tipo`
