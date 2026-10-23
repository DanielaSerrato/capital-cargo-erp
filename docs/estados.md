# Definición de estados — Capital Cargo ERP

## Dimensiones de estado

Un registro tiene múltiples dimensiones de estado independientes. No mezclar.

### 1. Integridad del registro
| Estado | Significado | Regla |
|--------|------------|-------|
| Incompleto | Faltan campos requeridos | Campos requeridos vacíos |
| Completo | Todos los campos requeridos presentes | Validación de formato OK |

### 2. Revisión administrativa
| Estado | Significado | Quién cambia |
|--------|------------|-------------|
| Pendiente | Aún no revisado por admin | Automático al crear |
| En revisión | Admin está revisando | Admin |
| Aprobado | Admin validó todo | Admin |
| Rechazado | Admin encontró problemas | Admin (debe incluir motivo) |

### 3. Documentación (por documento individual)
| Estado | Significado |
|--------|------------|
| Faltante | No se ha subido |
| Recibida | Subido, pendiente de revisión |
| En revisión | Admin revisando |
| Aprobada | Admin validó el documento |
| Rechazada | Documento inválido (motivo requerido) |
| Vencida | Fecha de vencimiento pasada |

### 4. Consulta RUNT (estado técnico)
| Estado | Significado |
|--------|------------|
| No consultado | Nunca se ha consultado |
| Ejecutando | Consulta en progreso |
| Éxito | Se recibió respuesta del RUNT |
| Error técnico | Fallo de conexión, captcha, timeout |

### 5. Resultado RUNT (estado de negocio)
Solo aplica cuando consulta = Éxito.

| Estado | Significado |
|--------|------------|
| Sin resultado | No hay consulta exitosa |
| Conforme | Licencia vigente, sin novedades |
| Con novedades | Licencia vencida, restricciones, suspensión |

## Estado global

El estado global se CALCULA, no se asigna manualmente. Ejemplo:

```
Estado global = "Pendiente — falta validar licencia"
  porque:
    - Registro: Completo ✓
    - Revisión: Pendiente
    - Documentos: 6/7 aprobados, 1 faltante (cert_bancaria)
    - RUNT: Éxito, Con novedades (C1 vencida)
```

## Reglas de color

| Color | Uso |
|-------|-----|
| Verde | Aprobado, vigente, conforme, completo |
| Ámbar/Amarillo | Pendiente, en revisión, parcial |
| Rojo | Rechazado, vencido, error, con novedades graves |
| Gris | Sin información, no consultado, no aplica |
| Azul | Informativo, en progreso |

**NUNCA** usar solo color para comunicar estado. Siempre acompañar con texto y/o ícono.
