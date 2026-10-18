# 18 · Diccionario de indicadores

| Indicador            | Fórmula / unidad                                          | Fuente                    | Periodicidad      | Limitación                                   |
| -------------------- | --------------------------------------------------------- | ------------------------- | ----------------- | -------------------------------------------- |
| Reservas registradas | COUNT / reservas                                          | bookings visibles por rol | Al cargar/guardar | Incluye canceladas                           |
| Reservas activas     | COUNT estados confirmada, espera y atención / reservas    | bookings visibles         | Al cargar/guardar | No equivale a ocupación física               |
| Atenciones completas | COUNT finalizada + consumida / atenciones                 | bookings visibles         | Al cargar/guardar | Cierre administrativo                        |
| Inasistencias        | COUNT no_asistio / reservas                               | bookings visibles         | Al cargar/guardar | Registro manual vía API, UI pendiente        |
| Cupos usados         | Reservas no canceladas/no asistió / cupos                 | bookings + resources      | Al cargar/guardar | Histórico de franja                          |
| No entregadas        | Preparadas - entregadas / raciones                        | waste_records manual      | Por registro      | No es residuo                                |
| Aprovechable         | Medición directa / kg                                     | waste_records manual      | Por registro      | Sin auditoría de balanza                     |
| Residuos             | Medición directa / kg                                     | waste_records manual      | Por registro      | No se estima por raciones                    |
| Espera media         | Σ(inicio - llegada)/N con ambos eventos / min             | Eventos futuros           | Diario propuesto  | No implementado; mostrar sin datos           |
| Satisfacción         | Σ puntuaciones/N respuestas / escala definida             | Encuestas futuras         | Mensual propuesto | No implementado                              |
| Ocupación media      | Persona-minutos/(capacidad × minutos) / %                 | Ingresos/salidas futuros  | Por franja        | No implementado                              |
| Eficacia de mejoras  | Acciones verificadas eficaces/acciones evaluadas ×100 / % | Modelo de eficacia futuro | Mensual           | Cierre actual no mide resultado cuantitativo |

La función de demanda simple `ceil(confirmadas × tasa histórica)` existe como regla pura; no se utiliza sin historial suficiente ni se presenta como pronóstico validado. Faltan cancelaciones, día de semana, eventos y ajuste manual auditado.
