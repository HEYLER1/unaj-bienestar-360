# 13 · Arquitectura

Monolito modular Next.js App Router. Presentación en componentes cliente, HTTP en Route Handlers, reglas puras en dominio, transacciones y casos de uso en servicio y persistencia SQL local. El repositorio SQLite aún es compartido: extraer interfaces por dominio antes de ampliar.

```mermaid
flowchart LR
 B[Navegador React] --> H[Route Handlers]
 H --> A[Autenticación y autorización]
 A --> S[Servicios de aplicación]
 S --> D[Reglas de dominio]
 S --> R[Repositorio SQL]
 R --> L[(SQLite local)]
 R -. destino pendiente .-> P[(PostgreSQL y Supabase)]
```

```mermaid
sequenceDiagram
 participant U as Estudiante
 participant API as API autenticada
 participant S as Servicio
 participant DB as SQLite
 U->>API: reservar + UUID
 API->>S: actor confiable + entrada validada
 S->>DB: BEGIN IMMEDIATE
 S->>DB: validar idempotencia, cupo y conflictos
 S->>DB: insertar reserva y auditoría
 S->>DB: COMMIT
 S-->>U: reserva confirmada
```

No microservicios, no consultas SQL desde navegador, sin conexiones institucionales. Sesión actual se resuelve exclusivamente en servidor.
