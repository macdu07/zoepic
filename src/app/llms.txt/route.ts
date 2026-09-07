export function GET() {
  const content = `# ZoePic
> Conversor de imágenes a WebP con ajustes de tamaño y renombrado opcional mediante inteligencia artificial.

ZoePic es una herramienta para profesionales que preparan imágenes para sitios
web, tiendas y catálogos. La conversión WebP, el cambio de tamaño y el recorte
se realizan directamente en el navegador. Si se activa el renombrado con IA,
se envía una versión reducida de la imagen al servicio de inteligencia
artificial para proponer un nombre descriptivo; la propuesta siempre requiere
revisión humana.

## Características principales
- Conversión por lotes a WebP en el navegador (los archivos no se suben para este proceso)
- Ajuste de dimensiones, proporción y recorte antes de descargar
- Renombrado opcional con IA para cuentas de planes de pago
- Compatibilidad: JPG, JPEG, PNG
- Lotes de hasta 5 imágenes en Starter, 50 en Pro y 100 en Agency

## Planes
- Starter: Gratis — 100 conversiones WebP/día, lotes de 5 imágenes, sin renombrado con IA
- Pro: $6.99/mes — WebP ilimitado, 3.000 renombrados con IA/mes, lotes de 50 imágenes
- Agency: $23.99/mes — WebP ilimitado, 20.000 renombrados con IA/mes, lotes de 100 imágenes

## Páginas públicas
- Inicio y producto: https://zoepic.online/
- Conversor: https://zoepic.online/convert
- Guías: https://zoepic.online/guias
- Convertir imágenes a WebP: https://zoepic.online/guias/convertir-imagenes-webp
- Calidad y dimensiones: https://zoepic.online/guias/calidad-dimensiones-imagen-web
- Nombres de archivo para SEO: https://zoepic.online/guias/nombres-archivo-imagenes-seo
- Sobre ZoePic: https://zoepic.online/sobre-zoepic
- Contacto: https://zoepic.online/contacto
- Precios: https://zoepic.online/#pricing
- Política de privacidad: https://zoepic.online/politica-de-privacidad
- Términos de uso: https://zoepic.online/terminos
`;

  return new Response(content, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
