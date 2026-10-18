# 06 · Requisitos funcionales

| ID   | Requisito     | Criterio de aceptación                                                   | Estado                                            |
| ---- | ------------- | ------------------------------------------------------------------------ | ------------------------------------------------- |
| RF01 | Acceso demo   | Credenciales válidas generan sesión HttpOnly; inválidas se rechazan      | Implementado, verificar en reporte de pruebas     |
| RF02 | Reserva       | Transacción valida rol, fecha, cupo, duplicado y conflicto               | Implementado                                      |
| RF03 | Cancelación   | Solo titular u operador; libera cupo antes del horario                   | Implementado                                      |
| RF04 | Asistencia    | Operador presenta token válido y fecha de servicio; registra estado      | QR local y verificación por código o contenido QR |
| RF05 | Comedor       | Entrega única, rechazo de segunda entrega                                | Implementado                                      |
| RF06 | Producción    | Entregadas ≤ preparadas; kg de aprovechable/residuo separados            | Implementado                                      |
| RF07 | Calidad       | Nueva acción → evidencia → verificación → evidencia de eficacia → cierre | Implementado                                      |
| RF08 | Privacidad    | Técnico no accede a reservas de terceros; gestión no ve psicología       | Implementado con guardas                          |
| RF09 | Campañas      | Estaciones y prioridades configurables con trazabilidad                  | Pendiente                                         |
| RF10 | Auth destino  | Supabase Auth + RLS por actor asignado                                   | Pendiente                                         |
| RF11 | Documentos    | Subida privada con validación y versionado                               | Pendiente                                         |
| RF12 | Configuración | Permisos, reglas y catálogos editables                                   | Pendiente                                         |

El avance de implementación no equivale a aprobación de requisitos institucionales. Cada módulo requiere revisión de los diez criterios del prompt original.
