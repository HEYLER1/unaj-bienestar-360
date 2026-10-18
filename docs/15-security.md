# 15 · Seguridad y privacidad

## Prototipo

Cuentas ficticias preaprovisionadas; contraseñas scrypt con sal individual; token de sesión aleatorio; cookie HttpOnly, SameSite Strict y Secure en build de producción. Expiración 8 h. Rechazo de mutaciones sin Origin coincidente; entrada validada por Zod; datos visibles filtrados en servidor. Intentos de acceso limitados por cuenta (no constituye protección completa contra abuso). Cabeceras de protección básicas; CSP permite inline/eval por compatibilidad del prototipo y debe endurecerse con nonce antes de producción.

El perfil de gestión incluye permisos explícitos médico/comedor/gimnasio/calidad. No tiene rol psicológico; se bloquean consultas y operaciones de recursos psicológicos. La clasificación de psicología por prefijo `psy-` es provisional, debe reemplazarse por dominio/servicio tipado y asignación de profesional antes de habilitar gestión de catálogos. Técnico no recibe acceso operativo ni clínico. No se almacena ningún dato clínico.

## Riesgos pendientes

No expuesto públicamente. Credenciales demo conocidas. No hay recuperación de cuenta, MFA, rotación, revocación global, control de dispositivos, RLS aplicada, almacenamiento privado de documentos, separación de funciones al verificar calidad, auditoría externa inmutable ni protección distribuida contra abuso. La sesión local y SQLite no sirven como afirmación de seguridad de producción.

Antes de datos reales: revisión especializada de base legal, finalidad, consentimiento cuando corresponda, aviso de privacidad, derechos del titular, conservación, transferencias, acceso por profesional y respuesta a incidentes. Se requiere validación institucional y legal. Este documento no determina cumplimiento normativo peruano.

Amenazas: IDOR mitigado por titular/operador; sobrecupos por transacción; doble entrega por estado; CSRF por origen/cookie; XSS por escape React y ausencia de HTML arbitrario. Revisar límites de carga, rate limiting por origen, CSP con nonce y secretos gestionados antes de despliegue.
