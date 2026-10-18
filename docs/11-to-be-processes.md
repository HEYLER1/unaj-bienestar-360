# 11 · TO-BE propuesto

```mermaid
flowchart LR
 A[Sesión estudiantil] --> B[Servicio y horario]
 B --> C{Permiso, fecha y cupo}
 C -->|Válidos| D[Reserva y auditoría atómicas]
 C -->|Inválidos| E[Error comprensible]
 D --> F{Operación autorizada}
 F --> G[Cancelar y liberar cupo]
 F --> H[Verificar código y fecha]
 H --> I[Espera y atención]
 I --> J[Finalizar]
 J --> K[Medir y mejorar]
```

Comedor sustituye espera/atención por entrega única. Campaña multiestación y gimnasio con aforo físico requieren extensiones, no se deducen del flujo genérico. BPMN 2.0 con pools, eventos y excepciones queda pendiente de validar el AS-IS.
