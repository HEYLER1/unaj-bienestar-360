## 1. UNAJ Bienestar 360°

Presentar el proyecto de Ingeniería de Software y Sistemas para Gestión de Calidad. El software es una propuesta académica independiente. Este material analiza ISO 9001:2015 por indicación del curso; la ficha consultada de ISO la muestra sustituida por la edición 2026. No se afirma certificación. Fuente: https://www.iso.org/standard/62085.html

## 2. Problema planteado

Las dificultades de seguimiento, coordinación y cupos son hipótesis del proyecto, no resultados de observación de campo. La UNAJ anunció SIGBU el 16 de marzo de 2026. No se evalúa ese sistema ni se afirman deficiencias institucionales. Fuente: https://portal.unaj.edu.pe/unaj-realizo-presentacion-del-sistema-integrado-de-gestion-de-la-direccion-de-bienestar

## 3. Objetivos del trabajo

Explicar que se inspeccionó el aplicativo existente, sin reconstruirlo. Se priorizó verificar funciones, relacionarlas con ocho numerales ISO y demostrar PHVA con datos sintéticos. No se midieron beneficios institucionales. Fuente: informe académico, objetivos y acta de verificación.

## 4. El aplicativo existente

La aplicación es un monolito Next.js con SQLite. El estudiante utiliza Inicio, Servicios y Mis reservas. La captura procede de la ejecución aislada con identidades ficticias, evidencia E02. Referencia: repositorio commit 27c5d97.

## 5. Módulos implementados

Distinguir disponibilidad de un flujo administrativo de completitud de módulo. Salud carece de historia clínica, campañas no tiene estaciones y social no tiene expedientes. E03 es la captura del catálogo. Fuente: docs/04-scope.md y src/server/service.ts.

## 6. Procesos de bienestar

Describir el flujo común implementado: recurso y horario, reserva, código, llegada, atención y cierre. Comedor utiliza entrega única. Cancelación libera cupo antes del horario. Estos son estados administrativos, no triaje o atención clínica. Fuente: src/domain/rules.ts y evidencias E05-E18.

## 7. Arquitectura general

La interfaz no consulta SQL directamente. La API resuelve la sesión y el servicio aplica validaciones y transacciones. La persistencia ejecutada es SQLite local; la migración PostgreSQL/Supabase no fue aplicada. El administrador técnico no obtiene privilegios clínicos. Fuente: src/server/auth.ts, service.ts, db.ts y app/api/state/route.ts.

## 8. Demostración de una campaña

Primero reservar el cupo como estudiante; después, como gestión, introducir el código, registrar llegada, llamar la fila y finalizar. En la base aislada se ajustó la fecha de campaña al día de la prueba. E09 y E14 muestran la inscripción y la atención de campaña. No existen estaciones ni selección automática del siguiente turno.

## 9. Relación con ISO 9001 2015

Presentar la relación como apoyo parcial. La conformidad requiere procesos organizacionales, responsables, requisitos y evidencia suficiente fuera del software. Se parafrasean los numerales, no se reproduce la norma. Fuente normativa: https://www.iso.org/standard/62085.html. Análisis propio: ANALISIS_ISO_9001.md.

## 10. Matriz de apoyo y brechas

Esta matriz no es una declaración de cumplimiento. Las ocho relaciones son parciales. La matriz completa con requisito, función, evidencia, beneficio y brecha está en el informe y en MATRIZ_ISO_9001.csv. Fuentes: ISO 9001:2015 como referencia académica y código inspeccionado commit 27c5d97.

## 11. Ciclo PHVA en la campaña

Planificar: el recurso se aprovisiona mediante datos semilla, no desde un creador de campañas. Hacer: inscripción y estados administrativos ejecutados. Verificar: conteos visibles y CSV, no tiempos por estación. Actuar: acción ficticia y evidencias, sin vínculo automático ni eficacia real probada. Fuente: CICLO_PHVA.md y E09, E13-E15, E19-E22.

## 12. Indicadores de calidad

Los valores mostrados proceden exclusivamente del escenario de captura: cinco reservas, tres atenciones completas y una producción manual ficticia. No son mediciones UNAJ. No se calcula espera, satisfacción ni ocupación física. Los conteos se limitan a los permisos del actor. Fuente: E22, estado-gestion.json, reporte-demo-bienestar.csv y docs/18-indicators.md.

## 13. Evidencias y pruebas

Se ejecutaron nuevamente 12 pruebas de dominio/integración y 7 E2E, además de TypeScript, lint y build en la copia aislada. Webpack se usó por las dependencias enlazadas. E21 muestra un cierre simulado de calidad; el texto no acredita eficacia real. Fuente: ACTA_VERIFICACION.md y evidencias de captura.

## 14. Conclusiones

El prototipo conserva registros, aplica controles y permite recorrer acciones de calidad. Eso apoya la operación y la revisión, sin demostrar conformidad integral con ISO ni mejoras institucionales. No se validaron tiempos, satisfacción o reducción de residuos. Fuente: resultados y limitaciones del informe.

## 15. Recomendaciones

Priorizar validación de procesos y necesidades, después mediciones e integración técnica segura. Completar riesgos, no conformidades, causas y verificación independiente. El aplicativo debe seguir como propuesta independiente hasta autorización institucional. Repositorio: https://github.com/HEYLER1/unaj-bienestar-360.
