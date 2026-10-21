# Entregables académicos de UNAJ Bienestar 360°

Universidad Nacional de Juliaca · Ingeniería de Software y Sistemas · Gestión de Calidad.
Fecha de verificación y edición: 18 de octubre de 2026.

## Contenido

- manual-usuario/: manual de 23 páginas en Word y PDF, con 14 procedimientos y capturas. Incluye contenido Markdown.
- informe-academico/: informe de 17 páginas en Word y PDF, matriz ISO de ocho numerales, análisis de brechas, indicadores y PHVA. Incluye Markdown y matriz CSV.
- presentacion/: PowerPoint editable de 15 diapositivas con una matriz nativa editable, capturas reales y notas del expositor en las 15 diapositivas. Las notas también se conservan en Markdown.
- evidencias/: 25 capturas reales, índice, acta de verificación, exportación CSV, estados ficticios, hashes del código y un capturador reproducible.
- guion-exposicion/: recorrido de demostración, textos de aproximadamente dos y cinco minutos y diez preguntas posibles del docente con respuestas.

## Cómo utilizarlo

1. Leer el acta y las limitaciones del informe antes de exponer.
2. Revisar el manual para los pasos del aplicativo y el guion para el orden de la demostración.
3. Abrir el PPTX en un editor compatible. No se ha afirmado una revisión nativa en PowerPoint; se validó su estructura, edición e importación y se inspeccionó el render de sus 15 diapositivas.
4. Usar las capturas como respaldo cuando no exista una base ficticia preparada para la fecha de exposición.
5. Completar autor o integrantes, docente y ciclo o sección si se desea personalizar la portada: esos datos no fueron proporcionados y no se inventaron. Los índices corresponden a la paginación entregada; revisar los índices después de editar Word.

## Alcance y evidencia

El código original no fue modificado. Se trabajó sobre una copia aislada del commit 27c5d97. La base ficticia fue preparada para verificar operaciones del día, tal como detalla el acta. Se aprobaron 12 pruebas de dominio/integración y 7 de navegador/API; también tipado, lint y build con Webpack.

No se atribuyen a la UNAJ problemas no observados ni se presentan los datos de demostración como mediciones institucionales. El análisis responde al curso sobre ISO 9001:2015 y consigna el estado de esa edición en la ficha de ISO. El prototipo es una herramienta de apoyo parcial, no una certificación ni un SGC completo.

La base SQLite, las dependencias y los renders de revisión no forman parte de este paquete. Los estados JSON y el QR corresponden únicamente a identidades y tokens ficticios.

## Formato académico obligatorio

El informe y el manual se entregan en APA 7: tamaño carta, márgenes de 2,54 cm, Arial 11, cuerpo a doble espacio, sangría inicial de 1,27 cm y numeración superior derecha desde la portada. Tablas con número en negrita, título en cursiva, notas y reglas horizontales; sin bordes verticales ni sombreado. Celdas a espacio sencillo para legibilidad, como permite APA. Figuras con número y título encima y nota debajo. Referencias alfabéticas con sangría francesa. Los índices se comprobaron contra los PDF finales. Los archivos Markdown conservan el texto auxiliar y no reproducen la maquetación Word.
