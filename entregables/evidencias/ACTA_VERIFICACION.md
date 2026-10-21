# Acta de verificación del aplicativo

Fecha de revisión: 18 de octubre de 2026, America/Lima.

## Versión y método

Repositorio HEYLER1/unaj-bienestar-360, commit 27c5d97. Se inspeccionaron las reglas de dominio, servicio transaccional, autenticación, filtrado de consultas, persistencia y componentes de presentación. Se ejecutó una copia aislada, usando las dependencias existentes y una base SQLite nueva para las evidencias. No se reconstruyó el aplicativo ni se cambió su código original.

El entorno fue macOS ARM64, Node.js 24.19.0 y Next.js 16.4.2. Se utilizó Webpack en la copia para ejecutar Next.js con las dependencias enlazadas; la única adaptación de configuración fue añadir --webpack al comando de Playwright de esa copia. No se aplicó ninguna migración de PostgreSQL.

## Comandos y resultados de esta sesión

| Comando | Resultado verificado |
| --- | --- |
| npm test | 12 pruebas aprobadas en 2 archivos, Vitest 5.0.5 |
| npm run test:e2e | 7 pruebas aprobadas en Chromium |
| npm run typecheck | Sin errores |
| npm run lint | Sin errores |
| npm run build -- --webpack | Compilación y generación de rutas correctas |

Las pruebas E2E verifican acceso inválido, reserva persistente y cancelación, QR visible, restricción técnica, acción con evidencias, sesión/origen y último cupo bajo dos peticiones simultáneas, navegación móvil y búsqueda del catálogo. Las unitarias/integración incluyen reglas de estados, permisos por recurso, idempotencia, conflictos, liberación de cupo, entrega única, fechas y producción.

## Flujos recorridos para capturas

1. Acceso y cierre de sesión de cuentas ficticias.
2. Catálogo, cita confirmada, consulta del QR y cancelación.
3. Reserva de campaña, comedor, gimnasio y orientación social.
4. Llegada de campaña, selección manual de la fila para atención y finalización general.
5. Entrega única de una reserva de comedor y registro manual de producción.
6. Llegada y finalización administrativa del turno de gimnasio.
7. Creación de acción de calidad, evidencia de ejecución, verificación y cierre simulado.
8. Consulta de indicadores y exportación CSV; restricción del técnico.
9. Vista móvil y tema oscuro.

## Preparación controlada de los datos

La inicialización genera recursos para el día siguiente. Después de reservar, se cambió a la fecha de revisión únicamente la fecha de camp-1, food-1 y gym-1 en la base temporal de evidencias para ejecutar operaciones permitidas solo el día del servicio. No se desactivaron reglas ni se cambió la base habitual del usuario. Esta preparación artificial no es un resultado de producción.

El escenario de evidencia termina con cinco reservas visibles para Gestión: una cancelada, una campaña finalizada, una ración consumida, un gimnasio finalizado y una orientación confirmada. Existen tres atenciones administrativas completas. El registro manual de comedor contiene 20 preparadas, 18 entregadas, 1.2 kg aprovechables y 0.4 kg de residuos. Estas cifras son sintéticas. La producción manual y la entrega individual son registros independientes, sin conciliación automática.

## Incidencias y límites

No se detectó un error del aplicativo que impidiera los flujos recorridos. El selector del arnés de captura se ajustó al contador visible de Mis reservas; no se modificó el producto. Los horarios semilla no se renuevan en una base ya existente: una exposición posterior necesita una base ficticia preparada o capturas de respaldo.

No se verificaron ni se afirman registro público, recuperación por correo, escaneo QR por cámara, estaciones de campaña, prioridades clínicas, aforo físico, elegibilidad de comedor, expediente social, gestores de horarios/catálogos, pronóstico en UI, tiempos de espera ni satisfacción. No hubo datos institucionales, entrevistas o medición de mejoras. No se evaluó producción multiinstancia, RLS, backups restaurados ni cumplimiento legal o certificación.

La clasificación global es prototipo administrativo funcional parcial. Cerrar una acción con texto simulado acredita el flujo técnico, no eficacia organizacional.
