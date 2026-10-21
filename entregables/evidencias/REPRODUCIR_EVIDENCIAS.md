# Reproducción de las evidencias

Utilice una copia aislada del repositorio con las dependencias instaladas. No utilice una base real ni la habitual de la demostración. Ejemplo para macOS, desde la raíz de esa copia:

```sh
TEST_DB=/private/tmp/evidencia-nueva.sqlite npm run dev -- --port 3200 --webpack
```

En otra terminal, también desde la copia, con este paquete situado en entregables/:

```sh
DEMO_DB=/private/tmp/evidencia-nueva.sqlite node entregables/evidencias/capturar_evidencias.mjs
```

Playwright requiere su Chromium compatible. El script usa cuatro cuentas semilla y el menú actual. Resérvese una base nueva para cada ejecución: no elimina reservas ni reinicia una base reutilizada. Ajusta fechas de tres recursos únicamente en la base indicada, para verificar el flujo del día; no cambia código de la aplicación. Las capturas y los estados se escriben en esta carpeta y sustituyen las evidencias de una ejecución anterior. Para preservar el paquete entregado, ejecute siempre sobre otra copia del paquete.

Las pruebas estándar siguen disponibles en npm test y npm run test:e2e. No confunda los datos de la captura con la base separada que usa Playwright para la suite automatizada.
