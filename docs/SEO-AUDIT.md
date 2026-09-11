# Auditoría SEO de ZoePic

Fecha de revisión: 11 de septiembre de 2026
Alcance: repositorio y sitio público `https://zoepic.online`, sin acceso a Search Console ni Analytics.

## Resumen ejecutivo

ZoePic tiene una base técnica funcional: las rutas públicas responden con 200, HTTP redirige a HTTPS con 308, las URLs tienen canonical, existe sitemap, robots, ads.txt y llms.txt, y las rutas privadas se sirven con `noindex, nofollow`. La auditoría renderizada encontró cuatro oportunidades prioritarias:

1. Las páginas públicas no tenían datos estructurados JSON-LD. Se añadió una capa reutilizable para organización, sitio, aplicación, FAQ, colección, artículos y breadcrumbs.
2. El `og:url` estaba fijado a producción aunque el entorno fuera local. Ahora se deriva de `NEXT_PUBLIC_APP_URL` y mantiene coherencia con canonical.
3. El H1 de la portada y el H1 del hub de guías eran expresivos, pero no describían con suficiente precisión la intención principal. Se alinearon con conversión WebP y optimización de imágenes web.
4. Cloudflare añade reglas gestionadas que bloquean GPTBot, ClaudeBot, Google-Extended, PerplexityBot y otros crawlers de IA. El código declara acceso a contenido público, pero la configuración de Cloudflare prevalece en producción y requiere una decisión del titular.

## Evidencia técnica

| Comprobación | Resultado | Evidencia |
| --- | --- | --- |
| Rutas públicas | Correcto | `/`, `/convert`, `/guias`, las tres guías, `/sobre-zoepic`, `/contacto`, `/terminos`, `/politica-de-privacidad`, `/robots.txt`, `/sitemap.xml`, `/ads.txt` y `/llms.txt` devolvieron 200. |
| HTTPS | Correcto | `http://zoepic.online/` devuelve 308 hacia `https://zoepic.online/`. |
| Canonical | Correcto | Cada ruta pública HTML comprobada expone un canonical autorreferente. |
| Sitemap | Correcto con mejora aplicada | Incluye 10 URLs públicas indexables y usa fechas estables de contenido en lugar de `new Date()` por solicitud. |
| Robots | Atención de despliegue | La ruta Next.js permite contenido público y bloquea rutas privadas. Cloudflare añade bloqueos de crawlers de IA en el borde. |
| JSON-LD | Mejora aplicada | El navegador no encontró scripts `application/ld+json` antes del cambio; ahora se generan desde componentes server-rendered. |
| Open Graph | Correcto con mejora aplicada | `og:image` responde 200 y `og:url` comparte la base de URL del entorno. |
| Encabezados | Correcto | Las páginas comprobadas tienen un H1; la jerarquía H1→H2→H3 no presenta saltos relevantes. |
| Móvil | Correcto en local; pendiente producción | En viewport 390×844 las rutas públicas comprobadas no tienen overflow horizontal y mantienen un solo H1. Repetir tras el despliegue. |

## Cambios implementados

- `src/lib/seo.ts` centraliza URL del sitio, identidad, fechas de contenido y constructores de schema.
- `src/components/seo/JsonLd.tsx` serializa JSON-LD de forma segura para evitar que contenido textual cierre el script.
- La portada expone Organization, WebSite, SoftwareApplication y FAQPage.
- El conversor expone SoftwareApplication y BreadcrumbList.
- El hub de guías expone CollectionPage, ItemList y BreadcrumbList.
- Cada guía expone Article, fecha de actualización visible y BreadcrumbList.
- Sobre ZoePic expone AboutPage, Organization y BreadcrumbList.
- `llms.txt` ahora describe con precisión el procesamiento local, el envío opcional a IA, los límites vigentes y todas las páginas públicas.
- Las respuestas FAQ permanecen en el DOM con `hidden` y `aria-controls`, por lo que son accesibles y rastreables sin alterar el comportamiento visual.
- Se añadieron enlaces de continuidad entre cada guía, el hub y el conversor.

## Mapa inicial de intención de búsqueda

Estas consultas son hipótesis basadas en el producto y deben contrastarse con Search Console o una herramienta de palabras clave antes de priorizar contenido nuevo.

| URL | Intención | Consultas candidatas | Etapa |
| --- | --- | --- | --- |
| `/` | Comercial / herramienta | conversor WebP, optimizar imágenes para web, convertidor de imágenes online | Decisión |
| `/convert` | Transaccional | convertir JPG a WebP, convertir PNG a WebP, conversor WebP gratis | Acción |
| `/guias` | Informativa | optimizar imágenes web, guías WebP, calidad de imágenes para web | Descubrimiento |
| `/guias/convertir-imagenes-webp` | Informativa | cómo convertir imágenes a WebP, WebP vs JPG, cuándo usar WebP | Descubrimiento |
| `/guias/calidad-dimensiones-imagen-web` | Informativa | calidad WebP, dimensiones de imágenes web, tamaño de imágenes para tienda | Descubrimiento |
| `/guias/nombres-archivo-imagenes-seo` | Informativa | nombres de imágenes para SEO, cómo nombrar imágenes, texto alternativo y nombre de archivo | Descubrimiento |
| `/sobre-zoepic` | Marca / confianza | qué es ZoePic, conversor WebP local | Evaluación |

## Arquitectura y enlazado

```text
Inicio
├── Conversor WebP (/convert)
├── Guías (/guias)
│   ├── Convertir imágenes a WebP
│   ├── Calidad y dimensiones
│   └── Nombres de archivo para SEO
├── Precios (/#pricing)
├── Sobre ZoePic (/sobre-zoepic)
└── Información
    ├── Contacto (/contacto)
    ├── Privacidad (/politica-de-privacidad)
    └── Términos (/terminos)
```

La portada enlaza al conversor, precios, guías y página de confianza. El hub enlaza cada guía. Cada guía enlaza al hub, al conversor y a otras guías relacionadas. Las rutas privadas no forman parte del sitemap y mantienen `noindex, nofollow`.

## Contenido y AI SEO

- Las guías usan respuestas directas, ejemplos de dimensiones y límites reales del producto.
- Las fechas de actualización aparecen en la página y en Article schema.
- No se publican testimonios, porcentajes universales ni resultados garantizados que no estén comprobados.
- `llms.txt` facilita contexto a agentes no Google, pero no sustituye SEO técnico ni garantiza citas.
- Google-Extended y crawlers de IA están bloqueados por reglas gestionadas de Cloudflare. Si se busca visibilidad en respuestas de IA, revisar Cloudflare → robots/content signals y permitir los bots de búsqueda elegidos; mantener bloqueados los accesos que el titular no autorice.

## Plan priorizado

### P0 — Antes de solicitar indexación o AdSense

- Desplegar los cambios y comprobar que JSON-LD aparece en HTML renderizado de portada, conversor, hub y guías.
- Ejecutar Rich Results Test sobre las URLs públicas desplegadas.
- Confirmar en Search Console el dominio, sitemap y cobertura de las 10 URLs públicas.
- Confirmar que la identidad publicada (Mauricio Correa, Colombia, `privacy@zoepic.online`) coincide con la cuenta real antes de solicitar revisión.

### P1 — Próxima iteración

- Revisar Cloudflare Managed Content Signals para la política de crawlers de IA.
- Medir Core Web Vitals en PageSpeed Insights y corregir LCP, INP o CLS si aparecen fuera de objetivo.
- Registrar consultas y páginas en Search Console para sustituir las hipótesis del mapa por datos reales.

### P2 — Crecimiento editorial

- Crear un hub más amplio sobre optimización de imágenes solo cuando exista demanda y cada guía aporte experiencia o ejemplos propios.
- Añadir comparativas equilibradas de formatos cuando puedan probarse con los flujos reales de ZoePic.
- Actualizar guías trimestralmente o cuando cambien límites, compatibilidad o recomendaciones técnicas.

## Pendientes fuera del repositorio

- Conectar y revisar Search Console y Analytics.
- Configurar la CMP certificada de Google y validar preferencias regionales.
- Confirmar la propiedad de `ca-pub-6686161902100366` y los bloques de anuncios.
- Ajustar Cloudflare si se desea permitir crawlers de IA.
- Ejecutar la validación final en Rich Results Test y PageSpeed Insights con el dominio desplegado.
