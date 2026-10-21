# Reservas, reprogramación y turnos de atención

Incremento del 20 de octubre de 2026. Objetivo del usuario: evolucionar a una aplicación de uso real para gestionar reservas y atención, sin limitarla a una demostración visual.

## Flujo implementado

1. Gestión publica una sesión de gimnasio, o un horario de salud/psicología con servicio, profesional existente, fecha, hora en Perú y cupos. Se rechazan horarios pasados y solapamientos del mismo profesional. Coordinación puede publicar agendas administrativas de psicología sin recibir acceso a sus reservas privadas; el profesional psicológico conserva el permiso operativo separado.
2. El estudiante reserva un horario publicado. Se abre automáticamente su pase: en gimnasio se muestra el QR temporal de acceso; en salud y psicología se muestra un turno confirmado con hora, fecha, profesional, lugar, referencia y QR de la reserva.
3. En Mis reservas, Cambiar fecha y hora permite elegir otro horario publicado y con cupo del mismo servicio. La interfaz indica días disponibles y no inventa disponibilidad si el día elegido carece de horarios.
4. Confirmar nuevo horario cambia la reserva dentro de una transacción, libera el cupo anterior y ocupa el nuevo. Mantiene el identificador de reserva y renueva su token. El pase anterior se invalida, incluidas las credenciales temporales de gimnasio. Se conserva el cambio de recurso origen/destino y su fecha en booking_changes y auditoría.
5. En salud y psicología el personal autorizado puede validar el QR en la fecha de atención y seguir los estados de llegada, espera, llamada y finalización ya existentes. El horario confirmado no es una estimación de espera ni una garantía de puntualidad. La referencia alfanumérica identifica la reserva; no es una posición numérica en una cola clínica.

## Reglas del servidor

Solo el titular estudiante puede reprogramar una reserva CONFIRMADA sin asistencia registrada. No se permite reprogramar una reserva ya atendida, cancelada o con ingreso registrado. El nuevo horario debe ser futuro. Salud y psicología permanecen separados, incluso cuando comparten el tipo técnico appointment. Se comprueba el cupo en servidor y que no exista otra reserva activa del titular a menos de sesenta minutos. La exclusión del propio registro evita un conflicto artificial con la reserva que está cambiando.

La actualización, renovación de código, revocación de pase de gimnasio, trazabilidad y auditoría son atómicas. Si falla una regla, se mantiene el recurso y token originales. El requestId permite repetir la misma solicitud sin repetir la mutación ni regenerar el código; reutilizarlo para otra operación se rechaza.

Los horarios de atención nuevos se publican mediante POST /api/schedules. Requieren sesión, origen válido y permiso de coordinación o del profesional correspondiente. La reprogramación utiliza POST /api/operations con action reschedule, bookingId, resourceId y requestId. No se ha añadido edición ni borrado de horarios existentes. Publicar horarios conserva los profesionales y lugares actualmente configurados; no crea identidades reales ni sustituye datos precargados por personas inventadas.

## Verificación

Aprobaron 26 pruebas de dominio/integración y 8 E2E. La nueva prueba de navegador publica un horario de salud, reserva, cambia fecha/hora, verifica el QR actualizado y rechaza el código anterior. También comprueba el pase en móvil sin desbordamiento. Las pruebas del servidor cubren conservación de la reserva al llenarse el destino, permisos, estados, conflictos, idempotencia, revocación de QR de gimnasio y separación de psicología. Las pruebas usan bases temporales y cuentas ficticias. Lint y TypeScript aprobados; compilación verificada por separado.

## Preparación para uso real

Las reservas y la reprogramación ya son operaciones persistentes en SQLite local. El entorno todavía tiene cuentas y datos precargados; no se declara apto para producción ni sistema oficial de la UNAJ. El acceso físico al gimnasio sigue sin controlador. Para una operación real faltan identidad y aprovisionamiento de cuentas propias, configuración institucional de servicios/profesionales/reglas, despliegue, respaldos/restauración verificados y conexión del controlador cuando exista. No se han borrado datos existentes ni conectado servicios institucionales.

El informe y manual del 18 de octubre son una instantánea anterior. Su próxima actualización debe incorporar este flujo manteniendo APA 7.
