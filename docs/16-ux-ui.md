# 16 · Interfaz y accesibilidad

Sistema visual propuesto: azul UNAJ de referencia, dorado como acento, verde suave para bienestar y fondo claro, tipografía del sistema, sidebar, tarjetas de servicios, agenda, tablas y estados. No usa logotipo oficial ni copia una interfaz institucional. Lucide como iconografía; Tailwind 4 y CSS de tokens. Componentes propios; incorporación completa de shadcn/ui pendiente. React Hook Form + Zod para acceso, validación HTML y servidor en otros formularios. Recharts pendiente; reporte actual usa barras CSS accesibles mediante valores de texto.

Vista móvil con menú desplegable; diálogo HTML nativo, cierre Escape y restauración de foco; campos etiquetados y avisos alert/status; estados vacíos auténticos, sin métricas inventadas; tema oscuro. No se afirma cumplimiento WCAG sin auditoría de contraste, lectores de pantalla y teclado. Foco del menú móvil requiere revisión adicional.

## Actualización cromática · 17 de octubre de 2026

Referencia observada en la [hoja de estilos pública del portal UNAJ](https://portal.unaj.edu.pe/sites/default/files/css/css_ibWj9ZKxcYvdoKOdlT4xXbD7oGg1yeK7274vWtH6Q-8.css), enlazada desde el [portal oficial](https://portal.unaj.edu.pe/): `--modins-theme-color: #E7C35B` y `--modins-theme-color-second: #052795`.

Se adopta el azul #052795 para navegación, acciones y marca; el dorado #E7C35B para detalles decorativos y jerarquía; y verde #287B65 como complemento propuesto para cuidado y bienestar. El dorado claro no se utiliza para texto pequeño sobre blanco; se utiliza un tono oscuro #946D17. Fondos azulados suaves y superficies claras mantienen una experiencia tranquila. Modo oscuro con azules profundos y controles claros.

Estos códigos se verificaron en el tema del portal, no en un manual normativo de identidad. No se atribuyen al verde complementario ni a las variantes de interfaz carácter institucional oficial. No se encontró un manual público aplicable durante esta búsqueda. Se descartaron resultados de la Universidad Nacional Arturo Jauretche, de nombre abreviado coincidente.

## Simplificación de uso

El portal estudiantil presenta tres destinos: Inicio, Servicios y Mis reservas. Los módulos operativos permanecen en el portal de gestión; el control de permisos sigue en el servidor. Inicio prioriza una acción principal, reservar un servicio, y un acceso al QR de la próxima reserva activa. Se sustituyeron las cuatro métricas y el calendario decorativo por información útil para la siguiente acción.

El catálogo reutilizable permite buscar por servicio o intención (por ejemplo, “almuerzo”). Cada tarjeta indica una acción concreta: agendar, reservar, elegir horario o solicitar orientación. Los horarios incluyen retorno al catálogo; una confirmación ofrece acceso a Mis reservas. En móvil hay tres accesos inferiores fijos y servicios en filas compactas. Se aumentaron textos y controles (mínimo 44 px para acciones principales) y se respetan las preferencias de movimiento reducido. Se conserva la paleta de referencia UNAJ y el verde complementario de bienestar.

Componentes de presentación separados: wellness-home.tsx y service-catalog.tsx. La simplificación no añade procedimientos institucionales ni modifica las reglas de reserva.
