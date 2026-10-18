# 04 · Alcance real del incremento 0.1

| Dominio         | Implementado localmente                                                     | Pendiente                                                                                            |
| --------------- | --------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Identidad       | Cuentas demo preaprovisionadas, login/logout, sesión y roles fijos          | Supabase Auth, recuperación, aprovisionamiento UI, 14 roles y permisos configurables                 |
| Salud           | Reserva/cancelación, control de cupos y conflictos, estados administrativos | Reprogramación atómica, derivaciones, disponibilidad editable, formularios por servicio              |
| Psicología      | Reserva privada visible a titular, guardas de permiso por recurso           | Profesional demo, asignación individual, seguimiento restringido; sin contenido clínico              |
| Campaña         | Reserva de cupo y turno administrativo de campaña                           | Estaciones, prioridades, tránsito, escaneo de QR por cámara, reasignación y estimación instrumentada |
| Comedor         | Reserva, entrega única por código, producción y residuos separados          | Beneficiarios y elegibilidad configurable, pronóstico histórico, escaneo por cámara                  |
| Gimnasio        | Reserva por franja, ingreso/salida administrativo                           | Aforo físico transaccional separado de cupos, promedio de ocupación, gestor de horarios              |
| Actividades     | Catálogo y reserva con capacidad                                            | Gestión de talleres, instalaciones, encuestas                                                        |
| Social          | Reserva de orientación                                                      | Expediente, adjuntos, subsanación, reglas socioeconómicas                                            |
| Calidad         | Acción, responsable, fecha, evidencia, verificación y cierre                | Riesgos, procesos configurables, no conformidades formales, objetivos, auditorías                    |
| Reportes        | Conteos visibles por rol, filtro y CSV                                      | Espera, satisfacción y series históricas                                                             |
| Infraestructura | Next.js, TypeScript, SQLite, pruebas                                        | Supabase conectado, RLS probada, despliegue, recuperación de backups                                 |

No se consideran completos los módulos del prompt maestro por disponer de una pantalla o flujo parcial. Este incremento es un MVP parcial ejecutable; la hoja de ruta conserva los criterios faltantes.

Fuera del prototipo: historias clínicas, diagnóstico automático, integraciones académicas reales, producción y certificación ISO.
