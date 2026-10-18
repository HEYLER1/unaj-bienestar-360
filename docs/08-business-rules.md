# 08 · Reglas de negocio propuestas

1. Solo estudiantes reservan; horarios, capacidad y profesionales son ficticios.
2. Un cupo por recurso/usuario activo. Capacidad verificada dentro de BEGIN IMMEDIATE.
3. Idempotencia por UUID de solicitud: repetir devuelve la reserva original solo al mismo actor.
4. Horarios se interpretan en America/Lima. Ventana ocupada propuesta: 60 minutos para todos los servicios. No es política institucional.
5. Reservas pasadas y cancelación tras inicio se rechazan.
6. Token de reserva aleatorio de 160 bits; su verificación necesita sesión con permiso. No es credencial de acceso.
7. Llegada y entrega solo en la fecha del servicio.
8. CONFIRMADA → EN_ESPERA → EN_ATENCION → FINALIZADA. Cancelación desde confirmada/espera. Entrega de comedor: CONFIRMADA → CONSUMIDA. Inasistencia: CONFIRMADA → NO_ASISTIO (UI pendiente).
9. Cancelar libera cupo; finalizada/consumida conservan la ocupación histórica de la franja.
10. Calidad: EN_CURSO → EN_VERIFICACION → CERRADA; evidencia mínima 10 caracteres en cada transición. Verificación independiente y suficiencia documental se validan en siguiente fase.
11. Entregadas nunca supera preparadas. No entregadas no se convierte en kg de desperdicio.
12. No existe triaje clínico ni urgencias digitales. La prioridad de campaña no está implementada.
