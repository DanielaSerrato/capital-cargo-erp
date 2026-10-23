# Capital Cargo — Módulo 1: plan de mejora de frontend y funcionalidad

**Versión:** 1.0 · 23 de octubre de 2026  
**Alcance:** backoffice administrativo para conductores, propietarios, vehículos y vista consolidada de expediente.

## 1. Diagnóstico del estado actual

En las capturas se observa un panel con navegación horizontal (`Conductores`, `Propietarios`, `Vehículos`, `Expedientes`), cuatro tarjetas KPI, búsqueda, filtro, exportación CSV y tabla de vehículos. La dirección visual es buena: limpia y escalable.

### Hallazgos que hay que verificar, no asumir

| Observación | Riesgo | Acción |
|---|---|---|
| Documentos muestran `8/4`, `5/4` | Contador ambiguo o denominador incorrecto | Revisar fórmula, origen y denominador por entidad |
| Placa `TFP118` aparece dos veces | Posible duplicado o relaciones distintas | Inspeccionar IDs; si son relaciones, explicitar su diferencia |
| RUNT muestra `Fallo` | No distingue error técnico de novedad de negocio | Separar `estado_consulta` de `resultado_validación` |
| Todos aparecen `Pendiente` | No se sabe qué impide avanzar | Mostrar motivos y checklist accionable |
| Tarjetas previas con muchos campos seguidos | Exploración lenta y poco ordenada | Perfiles con secciones y relaciones navegables |

Los conteos de una pestaña deben corresponder a esa entidad y a filtros explícitos; no reutilizar sin etiqueta métricas de conductores dentro de vehículos.

## 2. Objetivo de UX

En menos de unos pocos pasos, un administrativo debe poder:

1. Buscar por nombre, documento, placa o ID.
2. Abrir el **perfil individual** de un conductor, propietario o vehículo.
3. Ver **sus datos completos**, documentos, validaciones, relaciones e historial.
4. Entrar desde un conductor a los vehículos que conduce; desde un propietario a su flota; desde un vehículo a su propietario y conductores.
5. Abrir un **expediente consolidado** que agrupe actores y vehículo sin duplicar registros.
6. Editar con confirmación y saber quién cambió qué y por qué canal.

## 3. Navegación recomendada

**Versión actual (sin sobrecargar):** mantener barra superior con Conductores, Propietarios, Vehículos y Expedientes. El panel general puede añadirse como `Inicio` cuando exista una necesidad operativa real. No introducir menú lateral por estética solamente.

### Listados

- Tabla compacta, paginada y adaptable a escritorio; búsqueda global del módulo.
- Columnas por entidad: Conductor (`Nombre`, `Documento`, `Ciudad`, `Estado`, `Documentos`, `RUNT`); Propietario (`Nombre/Razón social`, `Documento/NIT`, `Vehículos`, `Estado`); Vehículo (`Placa`, `Tipo`, `Propietario`, `Conductor(es)`, `Docs`, `RUNT`, `Estado`).
- Filtros por estado, ciudad/tipo y novedades; ordenamiento real; acciones `Ver perfil` y menú secundario.
- Toda fila abre una vista clara, con título y un identificador único; conservar búsqueda/filtro al regresar.
- `Exportar CSV` exporta columnas adecuadas a permisos y filtros, con aviso del alcance; nunca incluir cuentas bancarias o identificaciones completas por defecto.

### Perfil individual (plantilla compartida)

**Encabezado:** nombre o placa, identificador, estado global, alertas prioritarias, botones `Editar`, `Más acciones`.

**Secciones o pestañas:**

1. **Resumen:** datos clave y tareas pendientes.
2. **Datos:** información completa, agrupada en bloques legibles; financieros restringidos.
3. **Relaciones:** vehículos, conductores y/o propietarios vinculados, con fechas y enlaces a sus perfiles.
4. **Documentos:** tipos requeridos, versión actual, estado de revisión, vencimiento y vista previa.
5. **Validaciones:** consulta más reciente, resultado, fecha, restricciones o novedades, historial de consultas.
6. **Historial:** línea de tiempo de modificaciones, actor, canal, fecha, antes/después autorizado.

La ficha de vehículo adapta `Datos` a atributos técnicos. La ficha de propietario destaca su flota. La del conductor destaca sus vínculos vigentes y su licencia.

### Expediente consolidado

Vista por **relación operacional** o selección de vehículo y fecha, con bloques enlazados:

`Vehículo → Propietario(s) vigente(s) → Conductor(es) vinculado(s) → Documentos y validaciones → Pendientes`.

Debe haber selector de fecha para consultar estado histórico. No asumir que placa equivale siempre a un único expediente eterno. Si un vehículo cambia de dueño, conservar ambas relaciones con periodos.

## 4. Estados: modelo explícito

| Dimensión | Valores iniciales sugeridos | Regla |
|---|---|---|
| Integridad del registro | Incompleto / Completo | Requeridos presentes y válidos en formato |
| Revisión administrativa | Pendiente / En revisión / Aprobado / Rechazado | Resultado de decisión humana |
| Documentación | Faltante / Recibida / En revisión / Aprobada / Rechazada / Vencida | Por documento, no solo por entidad |
| Consulta RUNT | No consultado / Ejecutando / Éxito / Error técnico | ¿Se recibió respuesta interpretable? |
| Resultado RUNT | Sin resultado / Conforme / Con novedades | Solo aplica tras consulta exitosa |

El **estado global** se calcula con una política documentada. Ejemplo: `Pendiente — falta validar licencia`. Los estados detallados son visibles en el perfil; no usar solo color para transmitir información.

### Conteo de documentos

- Definir documentos **requeridos** según tipo de entidad/vehículo.
- Mostrar `aprobados / requeridos` o `recibidos / requeridos`, con etiqueta explícita.
- Documentos adicionales se muestran aparte como `Extras: N`; un conteo `8/4` no debería aparecer sin explicación.
- Desduplicar por `entity_id + document_type + versión vigente`; no sumar versiones anteriores en cumplimiento actual.

## 5. Historial de cambios mínimo, desde esta iteración

Cada creación, edición, vinculación, desvinculación y cambio de estado genera un evento en backend:

```json
{
  "event_id": "uuid",
  "entity_type": "driver",
  "entity_id": "uuid",
  "action": "update",
  "actor_id": "admin-user-id",
  "channel": "admin_web",
  "occurred_at": "2026-10-23T20:00:00Z",
  "request_id": "uuid",
  "changes": [{"field": "city", "old": "Girón", "new": "Bucaramanga"}],
  "reason": "Corrección solicitada y validada"
}
```

Ejemplo de estructura, no registro real. Para contraseñas, tokens, cuentas bancarias y documentos completos, guardar referencias o valores enmascarados, no secretos en claro. Capturar el evento en la misma transacción que el cambio cuando sea posible. Prohibir la edición ordinaria de eventos.

## 6. Backlog priorizado

| ID | Prioridad | Historia / cambio | Criterio de aceptación |
|---|---|---|---|
| M1-01 | P0 | Definir identidad de cada entidad y relaciones | Dos perfiles vinculados no duplican datos; las FK son coherentes |
| M1-02 | P0 | Corregir conteos `DOCS` | Ningún valor excede requeridos salvo indicador de extras separado; fórmula probada |
| M1-03 | P0 | Revisar placas aparentemente repetidas | Se explica el ID de cada fila, se consolida o se marca como posible duplicado |
| M1-04 | P0 | Diferenciar consulta RUNT y novedad | Error técnico jamás se presenta como incumplimiento; fecha e intento visibles |
| M1-05 | P0 | Ficha de conductor | Datos, vínculos, documentos, validaciones e historial legibles |
| M1-06 | P0 | Ficha de propietario | Datos y todos sus vehículos vinculados accesibles |
| M1-07 | P0 | Ficha de vehículo | Datos técnicos, propietario y conductores vinculados accesibles |
| M1-08 | P0 | Auditoría de edición | Crear, editar y vincular produce evento con actor, canal y fecha |
| M1-09 | P1 | Expediente agrupado | Navegación cruzada sin datos duplicados; relaciones vigentes e históricas |
| M1-10 | P1 | Búsqueda, filtros y paginación | Funciona con ~800 conductores; no descarga todos los registros innecesariamente |
| M1-11 | P1 | Checklist de pendientes | Cada `Pendiente` explica motivo y acción siguiente |
| M1-12 | P1 | Documentos con vista previa | Acceso protegido, tipo, fecha, estado, descarga autorizada |
| M1-13 | P1 | Edición segura | Validaciones, confirmación, mensajes de éxito/error, sin cambios parciales ocultos |
| M1-14 | P1 | Exportación segura | Respeta filtros, no filtra datos sensibles sin permiso explícito |
| M1-15 | P2 | Pulido UI y responsive | Contraste, estados vacíos, carga, error, tamaños y navegación por teclado |

## 7. Diseño visual

- Mantener rojo corporativo para marca y acción primaria; **rojo semántico** para errores reales.
- Fondo gris muy claro, superficies blancas, bordes suaves y espaciado consistente de 8 px.
- Jerarquía: título y acción principal, estado, resumen, detalles; evitar columnas interminables de etiquetas/valores.
- KPI específicos por pestaña; nunca mezclar registrados de conductores con pendientes de vehículos sin explicarlo.
- Estados con palabra + icono, no depender exclusivamente de rojo/amarillo/verde.
- Cabeceras de tablas legibles; alineación consistente; botones con estados `loading`, `disabled`, confirmación y retroalimentación.
- Para una futura expansión amplia, considerar navegación lateral; hoy el menú horizontal es suficiente.

## 8. Contratos técnicos orientativos

Estas rutas son sugerencias que deben adaptarse al stack real, no afirmaciones de endpoints existentes.

| Método | Ruta conceptual | Uso |
|---|---|---|
| GET | `/drivers?search=&status=&page=` | Listado paginado |
| GET | `/drivers/{id}` | Perfil y resumen |
| PATCH | `/drivers/{id}` | Cambio parcial autenticado y auditado |
| GET | `/drivers/{id}/history` | Auditoría autorizada |
| GET | `/owners/{id}` | Perfil de propietario |
| GET | `/vehicles/{id}` | Perfil de vehículo |
| GET | `/vehicles/{id}/relationships?as_of=` | Relaciones en fecha determinada |
| GET | `/dossiers?vehicle_id=&as_of=` | Expediente consolidado |
| GET | `/documents?entity_type=&entity_id=` | Metadatos y acceso protegido |
| POST | `/validations/runt` | Inicia validación controlada y auditada |

El servidor debe validar permisos, propiedad de datos, formato e integridad; el navegador no debe contener credenciales de RUNT o proveedores.

## 9. Plan de implementación corto

1. **Levantamiento:** revisar tablas y endpoints reales, datos de prueba y reglas de negocio.
2. **Corrección inmediata:** métricas, conteos, duplicados aparentes y estados RUNT.
3. **Base de perfiles:** componentes compartidos, rutas por ID, relaciones entre entidades.
4. **Expediente agrupado:** consulta por vehículo y fecha, enlaces profundos y checklist.
5. **Auditoría y edición:** backend transaccional, evento y UI del historial.
6. **QA:** casos funcionales, privacidad, acceso denegado, filtros, carga y navegador móvil.

## 10. Pruebas de aceptación end-to-end

- Buscar una cédula y abrir exactamente el conductor esperado.
- Abrir un conductor → vehículo relacionado → propietario → volver sin perder contexto.
- Ver dos conductores vinculados a un vehículo sin duplicar el vehículo maestro.
- Cambiar dirección desde un administrativo: comprobar valor nuevo, evento con usuario/canal y visualización autorizada del anterior.
- Cambiar propietario con fecha efectiva: la vista de hoy muestra el nuevo y la vista histórica muestra el anterior.
- Cargar nueva versión de licencia: conservar versión anterior y marcar revisión pendiente según política.
- Simular timeout RUNT: mostrar `Error técnico`, permitir reintento y no afirmar `Con novedades`.
- Simular consulta RUNT exitosa con novedad: mostrar `Con novedades` y detalle de la fuente.
- Comprobar que `DOCS` cuenta tipos requeridos y versiones actuales, no archivos históricos.
- Comprobar que un usuario sin permiso no puede leer datos financieros ni documentos privados por URL directa.
- Probar búsqueda/paginación sobre volumen representativo (~800 conductores).

## 11. Definición de terminado (DoD)

Un ítem está terminado cuando tiene datos reales o fixtures documentados, comportamiento de carga/vacío/error, prueba funcional, control de permisos, registro de auditoría cuando modifica datos, y revisión de UX. No confundir interfaz terminada con integración backend terminada.

## 12. No implementar aún

Portal de conductor, WhatsApp, manifiestos, facturación, GPS o módulos nuevos antes de estabilizar perfiles, relaciones y trazabilidad. Sus dependencias están previstas en `Capital_Cargo_ERP_Plan_Maestro.md`.
