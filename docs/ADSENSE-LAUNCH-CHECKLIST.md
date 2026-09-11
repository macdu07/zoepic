# AdSense: lista previa a solicitar revisión

## Datos que debe confirmar el titular

- Confirmar que `ca-pub-6686161902100366` es el ID de editor activo. Debe coincidir en `public/ads.txt`, `NEXT_PUBLIC_ADSENSE_PUBLISHER_ID` y la cuenta que solicita la revisión.
- El layout publica `google-adsense-account` con ese mismo ID para facilitar la verificación del sitio; comprobarlo también en el HTML desplegado.
- Responsable publicado: Mauricio Correa, Colombia. Contacto de privacidad: `privacy@zoepic.online`.
- Añadir el ID del bloque manual de guías en `NEXT_PUBLIC_ADSENSE_GUIDE_SLOT` solo después de crear y revisar el bloque en AdSense. `NEXT_PUBLIC_ADSENSE_CONVERTER_SLOT` se conserva por compatibilidad, pero el conversor permanece excluido en esta fase.
- Mantener `NEXT_PUBLIC_ADSENSE_ENABLED="false"` durante el desarrollo y las pruebas de consentimiento. Tras publicar el mensaje, se puede activar `NEXT_PUBLIC_GOOGLE_CMP_ENABLED="true"` para probarlo sin solicitar anuncios; cambiar `NEXT_PUBLIC_ADSENSE_ENABLED` a `true` solo después de confirmar el editor y completar las pruebas regionales.

## Configuración en AdSense

- Añadir y verificar `https://zoepic.online`; comprobar que HTTPS redirige correctamente y que la página es accesible sin autenticación.
- En **AdSense → Privacidad y mensajes**, publicar el mensaje europeo de la CMP de Google para EEE, Reino Unido y Suiza, con aceptar, rechazar y gestionar opciones. Verificar que la cuenta tiene el mensaje activo antes de activar `NEXT_PUBLIC_GOOGLE_CMP_ENABLED`.
- Mantener el enlace «Configuración de privacidad y cookies» del pie. Usa la cola oficial de `googlefc` y `showRevocationMessage`; si la CMP todavía no responde, muestra ese estado sin crear un banner propio duplicado.
- Desactivar anuncios automáticos. La única ubicación preparada es un bloque manual después del contenido principal de cada guía; portada, índice, conversor, autenticación, dashboard y páginas legales quedan excluidos.
- Crear un bloque de display responsivo para guías y revisar que el espacio esté separado de enlaces, controles y descargas. No activar el bloque hasta haber probado consentimiento y navegación entre rutas.
- Conservar `public/ads.txt` únicamente con la línea del editor confirmada. No publicar otra relación de vendedores sin datos de la cuenta.

## Revisión del sitio

- Publicar y comprobar `/`, `/convert`, `/guias` y las tres guías en móvil y escritorio.
- Confirmar que los enlaces de cabecera y pie, `sitemap.xml`, `robots.txt` y `ads.txt` responden con estado 200.
- Revisar primera visita, aceptar, rechazar, reapertura, cambio de preferencias, persistencia y CMP no disponible. Confirmar en la red que no se solicita publicidad antes de una señal válida y que las rutas excluidas no insertan el script.
- Revisar que la conversión local, el envío opcional a IA, las guías y la publicidad coinciden con la política publicada. Reproducir las muestras descargables y comprobar peso y dimensiones en el navegador.
- Validar títulos, canonical, JSON-LD, sitemap, `robots.txt`, HTTPS y enlaces internos después del despliegue. Repetir la comprobación en producción.
- Solicitar revisión únicamente después de completar los datos del titular, publicar la CMP, confirmar el editor y finalizar las pruebas. La preparación técnica no garantiza la aprobación de Google y ZoePic no reenvía la solicitud automáticamente.
