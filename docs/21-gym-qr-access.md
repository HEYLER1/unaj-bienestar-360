# Control de acceso QR al gimnasio

Incremento local del 20 de octubre de 2026. Proyecto académico independiente con datos ficticios.

## Comportamiento implementado

El titular abre Mis reservas → Ver código. Para gimnasio se emite un pase temporal distinto del código estático de la reserva. El QR contiene versión, finalidad, identificador de reserva y un secreto aleatorio de 256 bits; no incluye nombre, correo ni rol. El servidor conserva su SHA-256. Dura 60 segundos y se consume una sola vez; generar otro revoca el anterior. La interfaz muestra el tiempo restante y permite renovar o copiar el contenido para el simulador.

Gestión → Gimnasio muestra el puesto de acceso, dirección de ingreso/salida, ocupación calculada, plazas disponibles e historial de los últimos doce movimientos. Se consulta cada cinco segundos. El operador necesita rol gimnasio: la cuenta técnica y el estudiante no pueden autorizar accesos. El pase solo puede emitirse a su titular con rol estudiante.

Para entrar se exige reserva CONFIRMADA de gimnasio, pase vigente, ausencia de otro ingreso activo de la persona y aforo disponible. La política de demostración permite entrar desde diez minutos antes del inicio hasta el final de una sesión de sesenta minutos, usando America/Lima (UTC−05:00). Es una política del prototipo, pendiente de validación institucional. Una reserva finalizada o cancelada no permite ingresar.

Para salir se exige un ingreso activo de esa reserva y un nuevo pase válido. La salida puede registrarse aunque haya terminado el horario; no libera un acceso inexistente. La reserva pasa a FINALIZADA y no admite reingreso. El lector no sustituye una salida de emergencia física.

La validación, el consumo del pase, la visita, la actualización del estado y el evento se confirman en una sola transacción SQLite BEGIN IMMEDIATE. Se registra actor y fecha en auditoría; los secretos no se escriben en los eventos. Los intentos denegados se muestran al operador y no crean una visita ni consumen el pase. Las acciones antiguas checkin/call/finish/exit de gimnasio se rechazan para evitar eludir el control nuevo.

## Aforo y persistencia

Las tablas locales gym_settings, gym_credentials, gym_visits y gym_events se crean de forma aditiva sin borrar reservas. El aforo ficticio inicial es veinte para el gimnasio completo, separado de los cupos de cada franja. Se cuenta gym_visits sin exited_at, no reservas confirmadas. No hay ajuste de aforo desde la interfaz ni medición física por sensores. Los estados EN_ATENCION del flujo administrativo anterior no se convierten en visitas físicas: una migración operativa requeriría reconciliación supervisada; no deben utilizarse como prueba de ocupación.

Gestión puede abrir una sesión de sesenta minutos con fecha, hora en Perú y cupos desde el panel. El servidor rechaza horarios pasados, sesiones solapadas y cupos superiores al aforo. No permite editar ni borrar una sesión existente. Los datos siguen siendo de demostración. Se necesita una reserva de una franja futura y, para probar ingreso, un horario del día dentro de la ventana permitida. La verificación usó exclusivamente una base temporal preparada para la hora de prueba.

## Cámara y alternativa

Activar cámara usa getUserMedia y BarcodeDetector si existen en el navegador, sobre localhost o un origen seguro. Solicita permiso y detiene las pistas al cerrar la vista o detener el lector. En navegadores sin detector o con permiso denegado se muestra una alternativa por contenido QR. La ruta de cámara está implementada, pero no se ha verificado con una cámara física; la prueba automatizada valida el contenido copiado. No se afirma compatibilidad universal con cámaras ni con lectores USB.

## API local

- POST /api/gym-access con action issue y bookingId: emite el pase al titular autenticado.
- POST con action scan, direction entry/exit y qr: valida y registra para un operador de gimnasio.
- POST con action schedule, date, time y capacity: crea una sesión futura para operadores de gimnasio.
- GET: devuelve ocupación y movimientos solo a operadores de gimnasio.

Las mutaciones comprueban sesión, origen y esquema de entrada; las respuestas usan Cache-Control: no-store. El reloj de servidor decide vigencia y horario. La interfaz no abre el acceso por un temporizador del navegador. El QR sigue siendo una credencial de portador: una copia vigente puede presentarse antes que el titular; caducidad y uso único no acreditan identidad. No se ha implementado autenticación de dispositivos ni integración multiinstancia.

## Apertura física pendiente

No hay hardware instalado. La respuesta exitosa informa simulated=true y physicalDoorOpened=false. Ninguna ruta envía señales de apertura y los eventos dicen simulated. Para una etapa física se requieren modelo del controlador, protocolo, credenciales de dispositivo, comando con identificador único y acuse del dispositivo. La autorización, el acuse de apertura y el paso detectado deben ser eventos separados; no basta con cambiar una etiqueta del simulador. También faltan reconciliación por sensor, tratamiento de interrupciones, políticas institucionales y validación de salida libre.

## Documentación académica

El manual y el informe Word/PDF entregados el 18 de octubre describen la versión anterior. Este incremento es posterior: no presentar aquellas capturas ni el flujo administrativo de gimnasio como documentación del nuevo acceso QR. Al actualizar los entregables académicos debe mantenerse APA 7.

## Verificación ejecutada

El 20 de octubre de 2026 aprobaron 19 pruebas de dominio e integración y 7 E2E existentes, además de lint, TypeScript y build con Webpack. El recorrido adicional de navegador verificó pase del estudiante, ingreso, rechazo de reutilización, salida, aforo final cero, sesión anónima bloqueada y vista móvil sin desbordamiento. La creación de una sesión desde la interfaz también se verificó. Dos solicitudes HTTP simultáneas para una plaza produjeron una autorización y un rechazo, conservando una visita activa. Todas estas operaciones se ejecutaron con datos ficticios sobre una base temporal, separada de la base del proyecto. No se verificó hardware, cámara física ni concurrencia distribuida.
