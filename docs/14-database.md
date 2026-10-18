# 14 · Persistencia y migraciones

Local: SQLite `data/bienestar.sqlite`, WAL, busy timeout 5 s, transacciones BEGIN IMMEDIATE. Creación inicial idempotente en src/server/db.ts. Solo para prototipo local, sin escalado horizontal.

Destino: migración versionada PostgreSQL en supabase/migrations/202610170001_foundation.sql. Modelo normalizado de identidad, permisos, disponibilidad y reservas. No contiene todas las entidades del prompt: campañas, comedor específico, actividades, expedientes y documentos deben añadirse por fases. No ha sido aplicada ni verificada en PostgreSQL. No basta con cambiar variables de entorno: requiere implementar repositorio y Supabase Auth.

Invariantes locales: FK, cupo positivo, índice único parcial de reserva activa. Sobrecupo y choque entre recursos se controlan en transacción; migración destino propone exclusión temporal y función SQL con bloqueo. Probar concurrencia real contra PostgreSQL antes de conectar.

Sin datos reales ni secretos. Conservación, respaldo cifrado y procedimiento de restauración son pendientes de producción.

La conexión se abre al primer uso; importar rutas durante el build no crea ni modifica datos. La inicialización de datos ficticios es transaccional e idempotente y configura busy_timeout antes de WAL. quality_action_history conserva cada evidencia y transición; la tarjeta muestra la más reciente.
