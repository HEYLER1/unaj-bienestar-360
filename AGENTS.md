# Reglas del proyecto

- Proyecto académico independiente; nunca afirmar oficialidad UNAJ ni certificación ISO.
- Leer docs/04-scope.md y docs/20-development-roadmap.md antes de ampliar funcionalidades.
- Solo identidades y datos ficticios. No conectar servicios institucionales, publicar, generar costos ni ejecutar migraciones destructivas sin autorización.
- Monolito modular: UI → Route Handlers → aplicación → dominio → repositorio. Validar siempre en servidor.
- Mínimo privilegio. Administrador técnico sin acceso clínico. No añadir contenido clínico al prototipo administrativo.
- Conservar trabajo existente. No sobrescribir cambios desconocidos.
- Reservas bajo transacción con idempotencia, unicidad y control de cupos. Toda mutación administrativa debe auditarse.
- Documentación en español; código técnico en inglés. Etiquetar hechos verificados, hipótesis y propuestas.
- Ejecutar typecheck, lint, pruebas y build según el cambio; registrar solo resultados observados.
- PostgreSQL/Supabase es el destino; SQLite es una adaptación local explícita. Nunca representar ambas implementaciones como equivalentes verificadas.
- No dar por completo un módulo sin todos los criterios del prompt maestro. Mantener pendientes y límites visibles.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
