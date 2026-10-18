# UNAJ Bienestar 360°

Prototipo académico independiente de gestión administrativa de bienestar. **No es software oficial de la UNAJ ni reemplaza al SIGBU.** Solo datos ficticios. No implementa historias clínicas ni diagnósticos.

## Ejecución local

Requiere Node.js 24.19 o superior (usa `node:sqlite`, todavía experimental en este entorno) y npm.

```sh
npm install
npm run dev
```

Abrir http://127.0.0.1:3000. La primera petición crea `data/bienestar.sqlite`, usuarios y horarios para el día siguiente en Perú. Los datos persisten al reiniciar. Los horarios de demo se generan una sola vez; no se actualizan automáticamente.

| Cuenta ficticia | Correo                 | Roles                                            |
| --------------- | ---------------------- | ------------------------------------------------ |
| Lucía           | estudiante@demo.local  | estudiante                                       |
| Diego           | estudiante2@demo.local | estudiante                                       |
| Gestión         | gestion@demo.local     | coordinación, calidad, comedor, gimnasio, médico |
| Técnico         | tecnico@demo.local     | técnico, sin operaciones ni reservas de terceros |

Contraseña de todas las cuentas: `Demo360!2026`. Son credenciales públicas del prototipo, **no reutilizar ni exponer esta instancia a Internet**. Sesiones opacas de 8 horas, cookie HttpOnly/SameSite, hash scrypt, limitación básica de intentos por cuenta y validación de origen para mutaciones. No hay registro público, envío de correos ni recuperación de contraseña.

## Alcance entregado

- Login/logout y cuentas preaprovisionadas, portal estudiantil y de gestión.
- Catálogo ficticio, reserva persistente para citas, comedor, gimnasio, actividades, orientación social y una campaña.
- Cupos transaccionales, idempotencia, cancelación, conflictos de horarios (bloques propuestos de 60 minutos), QR generado localmente, código de reserva y verificación manual.
- Seguimiento de turnos administrativos: llegada → espera → atención → finalización. La llegada/entrega se permite el día de la reserva.
- Entrega única de ración; registro de producción, sobrantes aprovechables y residuos por separado.
- Acciones correctivas con evidencia de ejecución y verificación antes del cierre.
- Indicadores operativos derivados de reservas visibles; exportación CSV, filtro de estados, búsqueda y tema oscuro.

**Adaptación local:** SQLite para ejecutar sin credenciales. La migración PostgreSQL inicial en `supabase/migrations` es una base de arquitectura, no un backend conectado. Supabase Auth, RLS aplicada y validada, escáner QR por cámara, campañas por estación, aforo físico, permisos configurables, documentos privados, becas, encuestas y recordatorios están pendientes. Revisar [alcance](docs/04-scope.md).

## Comprobaciones

```sh
npm run typecheck
npm run lint
npm test
npm run build
npm run test:e2e
```

Playwright requiere Chromium instalado (`npx playwright install chromium`, descarga opcional). Los tests de integración usan una SQLite en memoria. Las pruebas E2E usan un proceso de aplicación y una base temporal aislados. No usar la base de demostración para pruebas destructivas.

## Demostración guiada

1. Entrar como estudiante. Revisar el aviso académico y los indicadores vacíos.
2. Inicio → Salud y psicología → Medicina general → confirmar reserva. Revisar Mis reservas y código.
3. Intentar otra reserva coincidente: debe rechazarse. Cancelar y volver a reservar para demostrar liberación de cupo.
4. Reservar un almuerzo y un turno de gimnasio; recargar y verificar persistencia.
5. Cerrar sesión. Entrar como Gestión. Las reservas psicológicas no se exponen a este perfil.
6. Calidad → nueva acción → evidencia de ejecución → evidencia de eficacia → cierre.
7. Comedor → registrar producción con cantidades ficticias. Comprobar que entregadas no supera preparadas.
8. Indicadores → exportar CSV. Técnico → verificar ausencia de acceso a reservas de terceros.

Para registrar llegada o entrega, la fecha debe coincidir con la reserva. No desactivar esta regla para una exposición; preparar horarios del día mediante un futuro gestor de agenda o fixture de pruebas.

## Estructura

`app/`: interfaz y HTTP. `src/domain/`: contratos y reglas. `src/server/`: aplicación, autenticación y repositorio local. `src/components/`: presentación. `supabase/migrations/`: esquema de destino. `tests/`, `e2e/`: verificaciones. `docs/`: requisitos, decisiones, arquitectura y pendientes.
