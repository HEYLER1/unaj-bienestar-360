# 19 · Estrategia de pruebas

- Vitest: transiciones y reglas; integración con SQLite en memoria para permisos, idempotencia, capacidad, cancelación, conflicto, entrega única, producción y evidencia de calidad.
- Playwright: login válido/inválido, reserva, persistencia tras recarga, cancelación, acceso técnico y acción correctiva.
- Concurrencia: la conexión SQLite es síncrona y serializa el proceso. Vitest comprueba el último cupo con operaciones consecutivas y Playwright envía dos peticiones HTTP simultáneas para una misma franja; **no sustituye** una prueba multiproceso ni validación PostgreSQL.
- TypeScript estricto, ESLint y build de Next.js.
- React Testing Library está instalada; pruebas de componentes específicas pendientes.
- Migración destino requiere Supabase local y pgTAP o integración SQL antes de aprobarse.

No se afirman pruebas de escaneo por cámara, recuperación, registro público, estaciones de campaña ni aforo físico: funcionalidades pendientes. Registrar comandos y resultados reales en docs/testing-results.md.
