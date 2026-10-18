# 12 · Modelo de dominio

Agregados actuales: Usuario, Sesión, RecursoHorario, Reserva, AcciónCorrectiva, RegistroProducción y EventoAuditoría. Un recurso contiene una franja; una reserva referencia usuario y recurso. No hay almacenamiento clínico.

```mermaid
erDiagram
 USERS ||--o{ SESSIONS : tiene
 USERS ||--o{ BOOKINGS : solicita
 RESOURCES ||--o{ BOOKINGS : admite
 USERS ||--o{ AUDIT_LOGS : origina
 QUALITY_ACTIONS {
  string id PK
  string status
  string evidence
 }
 WASTE_RECORDS {
  string id PK
  int prepared
  int delivered
  float recoverable
  float waste
 }
```

El agregado genérico facilita el primer incremento; no reemplaza las entidades específicas de campañas por estaciones, beneficiarios, expedientes ni ocupación física.
