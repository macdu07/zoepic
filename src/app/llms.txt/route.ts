export function GET() {
  const content = `# ZoePic
> Conversor de imágenes a WebP con renombrado automático usando inteligencia artificial para SEO.

ZoePic es una herramienta SaaS que convierte imágenes JPG/PNG a formato WebP
directamente en el navegador (sin subir a servidores) y renombra los archivos
automáticamente con nombres descriptivos optimizados para SEO.

## Características principales
- Conversión WebP 100% en el navegador (sin upload a servidores, privacidad total)
- Renombrado automático con IA: analiza el contenido visual y genera nombres SEO
- Compatibilidad: JPG, JPEG, PNG
- Procesamiento por lotes de hasta 100 imágenes

## Planes
- Starter: Gratis — 100 conversiones WebP/mes, 50 renombrados IA/mes, lotes de 5 imágenes
- Pro: $6.99/mes — WebP ilimitado, 3,000 renombrados IA/mes, lotes de 50 imágenes
- Agency: $23.99/mes — WebP ilimitado, 20,000 renombrados IA/mes, lotes de 100 imágenes

## Páginas
- Inicio y producto: https://zoepic.online
- Política de privacidad: https://zoepic.online/politica-de-privacidad
`;

  return new Response(content, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
