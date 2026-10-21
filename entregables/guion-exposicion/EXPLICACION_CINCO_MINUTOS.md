# Explicación de aproximadamente cinco minutos

Nuestro trabajo analiza UNAJ Bienestar 360° como herramienta de apoyo al Sistema de Gestión de Calidad. El punto de partida es un aplicativo ya construido, no una nueva implementación. Por eso primero inspeccionamos sus reglas, sus permisos y su base local, y después ejecutamos los flujos disponibles. La revisión se hizo con una copia aislada y datos ficticios, sin alterar el código del proyecto.

La problemática plantea dificultades para coordinar servicios, reservar horarios, controlar capacidad y seguir acciones de mejora. Es importante precisar que son hipótesis académicas: no hemos realizado entrevistas ni mediciones de la operación institucional. Además, el portal de la UNAJ anunció SIGBU en marzo de 2026. No se pretende reemplazarlo ni atribuirle problemas.

El estudiante encuentra tres destinos: Inicio, Servicios y Mis reservas. Desde el catálogo puede reservar salud, una campaña, el comedor, gimnasio, una actividad o una orientación social. El flujo común es elegir el recurso, revisar fecha y cupo, confirmar y consultar el QR. La cancelación libera el cupo. Los horarios y profesionales son de demostración; no hay integración académica ni historias clínicas.

La arquitectura ejecutada es un monolito Next.js con persistencia SQLite. La API resuelve la sesión y el servicio valida entradas, permisos y transiciones. La reserva se realiza bajo transacción para comprobar capacidad y duplicados. La migración PostgreSQL existe como destino propuesto, pero Supabase/Auth/RLS no están conectados. Esta distinción evita presentar una arquitectura futura como un resultado ya entregado.

Respecto de ISO 9001:2015, analizamos ocho numerales. El catálogo y los estados apoyan la comprensión de procesos de 4.4; el acceso simple y las reservas propias aportan al enfoque al usuario de 5.1.2. Las validaciones atienden ciertos riesgos técnicos de 6.1, aunque no existe un registro de riesgos. La persistencia y la auditoría apoyan información documentada de 7.5 sin sustituir un gestor documental.

En 8.1 se observan controles de cupo, fecha, código y estado. Para 9.1 hay conteos y exportación de registros, pero no tiempos de espera ni satisfacción. En 10.2 se registra una acción con responsable y fecha, después una evidencia de ejecución y finalmente una evidencia de eficacia antes del cierre. Sin embargo, el texto libre no acredita que esa evidencia sea verdadera o suficiente. En 10.3 el sistema puede servir para repetir revisiones, pero aún no relaciona automáticamente indicadores con acciones ni compara resultados antes y después.

El ciclo PHVA se demuestra con la campaña ficticia. La fecha y el cupo se aprovisionan en los datos semilla: esa es una planificación externa al formulario. Hacer consiste en inscribir y recorrer espera, atención y finalización general. Verificar consulta el estado y los conteos. Actuar registra el caso ficticio de revisar instrucciones de llegada. No hay estaciones, prioridad clínica, selección automática del siguiente turno ni eficacia organizacional probada.

La verificación aprobó doce pruebas de dominio e integración y siete de navegador y API, además de tipado, lint y compilación. Se capturaron veinticinco pantallas reales. En el escenario hay cinco reservas y tres atenciones administrativas completas; esos valores son sintéticos y no representan desempeño de la UNAJ. La producción manual de comedor también es ficticia y no se reconcilia automáticamente con entregas individuales.

Concluimos que el aporte es operativo y documental: registrar, controlar y facilitar una revisión. No afirmamos certificación, conformidad completa ni mejora cuantificada. Recomendamos validar procesos y responsabilidades, definir líneas base y metas, completar riesgos y no conformidades, y probar la infraestructura de destino antes de cualquier uso institucional.

Duración orientativa; el texto debe ensayarse, no constituye una medición de tiempo de exposición.
