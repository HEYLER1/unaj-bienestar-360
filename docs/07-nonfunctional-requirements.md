# 07 · Requisitos no funcionales

- TypeScript estricto y validación Zod en servidor.
- Persistencia local durable con transacciones y claves foráneas.
- Seguridad: sesiones opacas, origen obligatorio, mínimo privilegio, auditoría sin motivos de consulta.
- Interfaz responsive, etiquetas, navegación por teclado, diálogo nativo con foco, avisos de error y carga, tema oscuro. WCAG 2.2 AA como objetivo; sin auditoría formal de conformidad.
- Objetivos de rendimiento, disponibilidad y recuperación pendientes de acordar. No se afirman SLA.
- Destino multiinstancia: PostgreSQL con locks y restricciones; SQLite solo un proceso local.
- Backups: copiar base usando backup consistente o proceso detenido; restauración verificada pendiente. No copiar solo el archivo activo en modo WAL.
