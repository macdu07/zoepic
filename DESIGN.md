# ZoePic Design System

## Direction

ZoePic se siente como una mesa de publicación digital: clara, precisa y preparada para trabajar con archivos reales. El contenido descansa sobre papel cálido; el grafito organiza la información y un verde bosque identifica acciones, progreso y estados correctos.

## Foundations

- Fondo `#f7f7f2`, superficies `#ffffff`, texto `#20251f` y verde principal `#286044`.
- Figtree se usa en toda la interfaz, incluidos el cuerpo y los títulos.
- La escala se basa en 4 px; los contenedores públicos alcanzan 1200 px y la lectura se limita a 70 caracteres.
- Las superficies se separan con borde o con sombra, nunca con ambos. Radios de 12–16 px.

## Components

- Cabecera pública compacta con navegación visible en escritorio y acceso directo al conversor.
- Botones sólidos para la acción principal; contorno para alternativas; enlaces subrayados al pasar el cursor.
- El conversor usa una mesa en tres zonas: archivos, ajustes y resultados. Las opciones avanzadas viven en elementos `details` nativos.
- Las páginas editoriales utilizan índice, texto con ritmo amplio, tablas y ejemplos; los anuncios ocupan reservas separadas y etiquetadas.
- El panel mantiene una navegación horizontal y superficies blancas de baja elevación.

## Motion and Accessibility

El hero entra con una sola transición corta. Los demás estados responden sin coreografías repetitivas. `prefers-reduced-motion` elimina desplazamientos y animaciones. Todo control tiene foco visible, contraste AA y un nombre accesible.
