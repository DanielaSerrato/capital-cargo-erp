# Modelo de datos — Capital Cargo ERP

## Estado actual (Supabase - kidvrjpelcyjrvonpimf)

### conductores
| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | uuid | PK |
| created_at | timestamptz | Fecha de creación |
| estado | text | Estado de revisión (pendiente/revisado/aprobado/rechazado) |
| primer_nombre | text | |
| segundo_nombre | text | |
| primer_apellido | text | |
| segundo_apellido | text | |
| cedula | text | Documento de identidad |
| direccion | text | |
| ciudad | text | |
| telefono | text | |
| vehiculo_placa | text | Placa del vehículo asignado |
| banco | text | |
| tipo_cuenta | text | Ahorros / Corriente |
| numero_cuenta | text | |
| foto_rostro | text | Path en Storage |
| seguridad_social | text | Path en Storage |
| cedula_frente | text | Path en Storage |
| cedula_reverso | text | Path en Storage |
| pase_frente | text | Path en Storage |
| pase_reverso | text | Path en Storage |
| cert_bancaria | text | Path en Storage |
| ref_familiar_nombre | text | |
| ref_familiar_telefono | text | |
| ref_empresa_nombre | text | |
| ref_empresa_telefono | text | |
| autoriza_datos | boolean | Consentimiento manejo datos |
| autoriza_sensibles | boolean | Consentimiento datos sensibles |

### propietarios
| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | uuid | PK |
| created_at | timestamptz | |
| estado | text | |
| primer_nombre | text | |
| segundo_nombre | text | |
| primer_apellido | text | |
| segundo_apellido | text | |
| cedula | text | |
| direccion | text | |
| ciudad | text | |
| telefono | text | |
| vehiculo_placa | text | |
| banco | text | |
| tipo_cuenta | text | |
| numero_cuenta | text | |
| factura_electronica | text | |
| autoriza_sensibles | boolean | |
| cedula_frente | text | Path en Storage |
| cedula_reverso | text | Path en Storage |
| rut | text | Path en Storage |
| cert_bancaria | text | Path en Storage |

### vehiculos
| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | uuid | PK |
| created_at | timestamptz | |
| estado | text | |
| placa | text | Placa del vehículo |
| tipo | text | Tipo de vehículo |
| satelital | text | Proveedor GPS |
| satelital_usuario | text | |
| satelital_password | text | |
| tarjeta_frente | text | Path en Storage |
| tarjeta_reverso | text | Path en Storage |
| tecnomecanica | text | Path en Storage |
| soat | text | Path en Storage |
| fotos | jsonb | Array de paths en Storage |

### runt_licencias
| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | uuid | PK |
| cedula | text | FK conceptual a conductores |
| estado_conductor | text | Estado del conductor en RUNT |
| estado_licencia | text | Estado de la licencia |
| categoria | text | Categoría principal (legacy, usar licencias_json) |
| fecha_vencimiento_cat | text | Vencimiento cat principal (legacy) |
| restricciones | text | |
| numero_licencia | text | |
| organismo_transito | text | |
| success | boolean | Si la consulta fue exitosa |
| error | text | Mensaje de error si falló |
| fecha_consulta | timestamptz | |
| licencias_json | jsonb | Respuesta COMPLETA del RUNT con todas las categorías |

### runt_vehiculos
| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | uuid | PK |
| placa | text | FK conceptual a vehiculos |
| estado | text | |
| tipo_servicio | text | |
| clase | text | |
| marca | text | |
| linea | text | |
| modelo | text | |
| color | text | |
| cilindraje | text | |
| soat_poliza | text | |
| soat_aseguradora | text | |
| soat_vencimiento | text | |
| soat_estado | text | |
| success | boolean | |
| error | text | |
| fecha_consulta | timestamptz | |

## Modelo objetivo (Fase 1)

### Cambios propuestos

1. **audit_events** — Nueva tabla para historial de cambios
2. **Normalizar relaciones** — `driver_vehicle_assignments` en vez de `vehiculo_placa` directo
3. **Document status per doc** — Estado individual por documento (no solo "subido/no subido")
4. **Separar estado RUNT** — `estado_consulta` vs `resultado_validacion`

Ver `plan_maestro.md` sección 3 para modelo objetivo completo.
