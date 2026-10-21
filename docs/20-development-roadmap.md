# 20 · Hoja de ruta y aceptación

Cada tarea requiere requisitos, UI, lógica, persistencia, validación, permisos, errores, pruebas, documentación e integración. Las fases no se marcan terminadas por tener solo documentación.

| Fase                   | Tareas y dependencias                                         | Criterio de aceptación                            | Estado                            |
| ---------------------- | ------------------------------------------------------------- | ------------------------------------------------- | --------------------------------- |
| 0 Inspección           | Entorno, skills, reglas, dependencias                         | Proyecto instalable y límites documentados        | Verificado localmente             |
| 1 Requisitos           | Investigación, entrevistas, AS-IS, requisitos                 | Evidencia y procesos aprobados por responsables   | Parcial: documentación inicial    |
| 2 Arquitectura/BD      | Modelo, repositorios, migraciones, permisos                   | Migración aplicada y tests SQL/RLS aprobados      | Parcial: local y esquema inicial  |
| 3 UI                   | Tokens, componentes, accesibilidad                            | Teclado, móvil, contraste y estados verificados   | Parcial                           |
| 4 Identidad            | Supabase Auth, 14 roles, permisos configurables, recuperación | E2E de identidad y recursos                       | Parcial: acceso local             |
| 5 Salud                | Agenda editable, cita, reprogramación, derivación             | Sin conflictos y aislamiento por profesional      | Parcial: reserva/cancelación      |
| 6 Campañas             | Estaciones, transiciones, capacidad, turnos, QR               | Flujo multiestación y concurrencia probados       | Parcial: cupo general             |
| 7 Comedor              | Beneficiarios, menús, consumo, pronóstico                     | Elegibilidad y entrega única transaccionales      | Parcial                           |
| 8 Gimnasio/actividades | Aforo físico, entradas/salidas, actividades configurables     | Sin exceso de aforo bajo concurrencia             | Parcial                           |
| 9 Social/apoyos        | Expedientes, almacenamiento privado, convocatorias            | Documentos seguros y flujo completo               | Pendiente; orientación disponible |
| 10 Calidad             | Procesos, riesgos, no conformidades, acciones                 | Trazabilidad completa y verificador independiente | Parcial: acción y evidencia       |
| 11 Indicadores         | Eventos de tiempos, encuestas, definiciones                   | Fórmulas verificadas y datos completos            | Parcial: conteos                  |
| 12 Integración         | RLS, E2E, accesibilidad, backups, manual                      | Verificación reproducible de todos los criterios  | En progreso                       |

Próximo incremento: separar repositorios por dominio; ejecutar Supabase local y conectar Auth; reemplazar roles fijos por permisos; implementar agendas y reprogramación atómica. Después motor de estaciones y escaneo por cámara.

Decisiones bloqueantes para producción: políticas institucionales, acceso sanitario por profesional, elegibilidad, conservación, base legal y autorización de integración. Ninguna bloquea la demostración ficticia local.

## Avance del gimnasio · 20 de octubre de 2026

Implementado localmente: pase temporal de 60 segundos y un uso, validación de reserva/horario/rol, entrada y salida transaccionales, aforo de registros, historial reciente y panel adaptable. Cámara mediante BarcodeDetector cuando el navegador lo admite, con alternativa por texto. Hardware y lectura con cámara física aún no verificados. La fase 8 continúa parcial: no hay sensores, agendas configurables, reconciliación física ni métricas históricas. Se añadió creación de sesiones futuras sin solapamientos; la edición y eliminación de sesiones siguen pendientes. Ver `21-gym-qr-access.md`.

## Reservas operativas y reprogramación · 20 de octubre de 2026

El usuario aclaró que quiere una aplicación de uso real y reprogramar su propia reserva. Se implementaron reprogramación atómica, publicación de horarios de salud y psicología, confirmación con pase y nueva fecha/hora e invalidación del código anterior. No equivale a preparación para producción: siguen pendientes cuentas propias, sustitución de datos precargados, infraestructura de producción y hardware físico. Ver `22-rescheduling-and-attention.md`.
