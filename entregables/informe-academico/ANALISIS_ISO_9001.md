# Matriz de apoyo a ISO 9001 2015


Análisis académico de contribución parcial. No es una auditoría ni una matriz de certificación. Los requisitos se parafrasean; no se reproduce el texto normativo.


## 4.4

Requisito relacionado: Definir procesos, sus relaciones, responsabilidades y controles.

Funcionalidad: Catálogo por servicio y estados de reserva; mapa de procesos documentado.

Evidencia: E03 y E13-E15; src/domain/rules.ts; docs/09-process-map.md.

Beneficio: Hace visible el flujo administrativo y facilita identificar sus controles.

Brecha: No hay diseñador de procesos ni responsables configurables; el mapa es propuesto y no está validado institucionalmente.



## 5.1.2

Requisito relacionado: Orientar la gestión a las necesidades del usuario y a requisitos aplicables.

Funcionalidad: Portal estudiantil simple, consulta de cupos, reserva y cancelación propia.

Evidencia: E02, E03, E08 y E24; src/components/service-catalog.tsx.

Beneficio: Facilita el acceso y da al estudiante visibilidad del estado de su solicitud.

Brecha: La interfaz no demuestra liderazgo de la dirección ni conocimiento validado de necesidades. Encuestas y análisis de satisfacción no implementados.



## 6.1

Requisito relacionado: Considerar riesgos y oportunidades y planificar acciones proporcionales.

Funcionalidad: Validaciones de cupo, fecha, duplicados, conflicto horario y permiso; transacción de reserva.

Evidencia: src/server/service.ts; tests/service.test.ts; E23 y pruebas de último cupo.

Beneficio: Reduce la exposición técnica a sobrecupos y operaciones no autorizadas dentro del alcance probado.

Brecha: No existe registro de riesgos, evaluación de impacto/probabilidad ni seguimiento de oportunidades en la interfaz. No se ha medido reducción de riesgos reales.



## 7.5

Requisito relacionado: Mantener y controlar la información documentada necesaria para operar.

Funcionalidad: Reservas y cambios persistentes; historial de evidencias de calidad; documentación versionada en Git.

Evidencia: E06, E20, E21; src/server/db.ts; quality_action_history y audit_logs.

Beneficio: Conserva información para revisar qué se registró y quién efectuó la operación.

Brecha: El historial técnico no tiene visor completo ni controles de archivo, conservación y eliminación; el gestor documental está pendiente.



## 8.1

Requisito relacionado: Planificar y controlar la prestación mediante criterios y registros.

Funcionalidad: Cupos por franja, reserva, código de asistencia, transiciones y entrega única de comedor.

Evidencia: E04, E13-E18; src/server/service.ts y src/domain/rules.ts.

Beneficio: Apoya la consistencia del registro operativo y evita repetir una entrega en el mismo flujo.

Brecha: Campañas y horarios son datos semilla, no se crean desde la interfaz. No hay estaciones, prioridades clínicas, elegibilidad ni aforo físico.



## 9.1

Requisito relacionado: Definir qué se mide, cómo se analiza y cuándo se revisan los resultados.

Funcionalidad: Conteos por reservas visibles al rol y exportación CSV; registro manual de producción y residuos.

Evidencia: E17 y E22; reporte-demo-bienestar.csv; docs/18-indicators.md.

Beneficio: Proporciona registros y conteos reproducibles para iniciar una revisión operativa.

Brecha: Sin series de espera, satisfacción ni metas validadas. Conteos de una demostración no acreditan mejora ni desempeño institucional.



## 10.2

Requisito relacionado: Tratar incumplimientos, actuar sobre causas y revisar la eficacia de acciones.

Funcionalidad: Acción con responsable y fecha; ejecución, verificación y cierre con evidencia textual.

Evidencia: E19-E21; quality_actions y quality_action_history; tests/service.test.ts.

Beneficio: Estructura el seguimiento de acciones y exige registrar evidencia antes de cerrar.

Brecha: No hay registro formal de no conformidades, análisis causal estructurado ni verificador independiente. Aceptar texto no acredita suficiencia de evidencia.



## 10.3

Requisito relacionado: Sostener la mejora continua con evaluación de resultados y decisiones.

Funcionalidad: Conexión de revisión de indicadores con un flujo de acciones y verificación documentada.

Evidencia: E20-E22; docs/20-development-roadmap.md.

Beneficio: Ofrece soporte para repetir ciclos de revisión y dejar trazabilidad de las decisiones.

Brecha: La relación indicador-acción se interpreta en el análisis; no existe vínculo automático ni comparación antes/después implementada.

