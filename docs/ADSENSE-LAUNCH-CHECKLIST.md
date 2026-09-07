# AdSense: lista previa a solicitar revisión

## Datos que debe confirmar el titular

- Confirmar que `ca-pub-6686161902100366` es el ID de editor activo. Debe coincidir en `public/ads.txt`, `NEXT_PUBLIC_ADSENSE_PUBLISHER_ID` y la cuenta que solicita la revisión.
- Añadir los IDs de bloques manuales en `NEXT_PUBLIC_ADSENSE_GUIDE_SLOT` y `NEXT_PUBLIC_ADSENSE_CONVERTER_SLOT`. Si se dejan vacíos, ZoePic no renderiza esos espacios.
- Completar la identidad legal y jurisdicción del responsable en Privacidad y Términos según asesoría aplicable. El código no inventa esos datos.

## Configuración en AdSense

- Añadir y verificar `https://zoepic.online`; comprobar que HTTPS redirige correctamente y que la página es accesible sin autenticación.
- En Privacidad y mensajes, publicar el mensaje para normativa europea usando la CMP de Google, certificada e integrada con el TCF. Habilitar la opción para rechazar o gestionar finalidades según corresponda.
- Mantener un enlace para revocar o cambiar las elecciones. El pie de ZoePic intenta abrir `googleFC.prompt` y ofrece la política como alternativa.
- Desactivar anuncios automáticos en `/dashboard`, autenticación y páginas legales. La app no carga el script de AdSense en esas rutas; revisar también cualquier regla por URL creada en la cuenta.
- Crear bloques de display responsivos para guías y conversor. No colocar anuncios cerca del selector de archivos, botones de conversión o descargas.

## Revisión del sitio

- Publicar y comprobar `/`, `/convert`, `/guias` y las tres guías en móvil y escritorio.
- Confirmar que los enlaces de cabecera y pie, `sitemap.xml`, `robots.txt` y `ads.txt` responden con estado 200.
- Revisar que la conversión local, el envío opcional a IA y la publicidad coinciden con la política publicada.
- Solicitar revisión únicamente después de completar los datos del titular y la configuración de consentimiento. La preparación técnica no garantiza la aprobación de Google.
