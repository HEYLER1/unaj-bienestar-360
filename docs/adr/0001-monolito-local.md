# ADR 0001 · Monolito y adaptación local

Estado: aceptada para prototipo; Supabase pendiente.

Contexto: repositorio vacío, sin credenciales de Supabase ni integración autorizada. El usuario pide ejecución local y progresiva.

Decisión: Next.js monolítico, reglas puras, SQLite transaccional para primer incremento; mantener migración PostgreSQL de destino. No desplegar ni inventar integración. Reversibilidad: extraer interfaces de repositorio y conectar PostgreSQL manteniendo contratos HTTP.

Consecuencias: demo autónoma y persistente, pero no equivalencia con Supabase Auth/RLS ni soporte multiinstancia. Reserva genérica sirve solo para flujo administrativo básico. No se marca stack destino como completado.
