export interface GuideSection { heading: string; paragraphs: string[]; bullets?: string[]; }
export interface Guide {
  slug: string;
  title: string;
  metaTitle: string;
  description: string;
  readingTime: string;
  datePublished: string;
  dateModified: string;
  sections: GuideSection[];
}

export const guides: Guide[] = [
  {
    slug: "convertir-imagenes-webp",
    title: "Cómo convertir imágenes a WebP sin perder el control",
    metaTitle: "Cómo convertir imágenes a WebP: guía práctica",
    description: "Un método práctico para decidir qué convertir, revisar el resultado y evitar archivos más pesados que el original.",
    readingTime: "7 min",
    datePublished: "2026-09-06",
    dateModified: "2026-09-06",
    sections: [
      { heading: "Qué resuelve WebP", paragraphs: ["WebP es un formato de imagen pensado para la web que admite compresión con y sin pérdida, transparencia y animación. En fotografías suele producir archivos más pequeños que JPEG a una calidad visual comparable; en gráficos con transparencia puede ser una alternativa a PNG. El resultado real depende de la imagen, no solo del formato.", "Convertir tiene sentido cuando el ahorro compensa el coste de mantener otra versión. Una fotografía grande de catálogo suele ofrecer margen; un icono diminuto ya optimizado puede crecer. Por eso conviene comparar el peso antes y después en lugar de asumir un porcentaje fijo."] },
      { heading: "Un flujo de trabajo reproducible", paragraphs: ["Conserva los originales en una carpeta separada. Trabaja sobre copias, agrupa imágenes que tendrán el mismo uso y aplica una configuración común. En ZoePic puedes mantener las dimensiones o elegir una salida concreta antes de convertir el lote."], bullets: ["Selecciona JPG, JPEG o PNG del mismo contexto.", "Empieza con calidad 82–90 para fotografía y revisa detalles finos.", "Comprueba dimensiones, peso y transparencia en cada resultado.", "Descarga solo las versiones que aportan un ahorro útil."] },
      { heading: "Cómo revisar la calidad", paragraphs: ["Mira primero bordes, texto dentro de la imagen, degradados suaves, piel y zonas con ruido. Los defectos de compresión aparecen antes en esas áreas. Revisa a tamaño de uso: ampliar al 300% ayuda a detectar artefactos, pero no representa cómo verá el visitante la imagen.", "Si el archivo WebP pesa más, prueba una calidad menor o reduce dimensiones. Si necesitas transparencia y el gráfico tiene pocos colores, compara también con el PNG original. No existe una configuración universal."] },
      { heading: "Compatibilidad y publicación", paragraphs: ["Los navegadores modernos admiten WebP ampliamente. Aun así, un sistema editorial, una herramienta de correo o un integrador antiguo puede imponer restricciones propias. Valida el flujo donde se publicará el archivo y conserva el original para generar otra variante.", "Define ancho y alto en el marcado de la página para reservar espacio, usa texto alternativo que describa la función de la imagen y habilita carga diferida fuera del primer viewport. El formato es una parte del rendimiento; las dimensiones correctas y la entrega también importan."] },
    ],
  },
  {
    slug: "calidad-dimensiones-imagen-web",
    title: "Calidad y dimensiones: elegir el tamaño correcto para la web",
    metaTitle: "Calidad y dimensiones de imágenes web: guía",
    description: "Cómo equilibrar nitidez, peso y encuadre según el lugar donde aparecerá cada imagen.",
    readingTime: "8 min",
    datePublished: "2026-09-06",
    dateModified: "2026-09-06",
    sections: [
      { heading: "Empieza por el espacio de destino", paragraphs: ["El tamaño correcto nace del componente, no de la cámara. Si una tarjeta nunca supera 640 píxeles de ancho, publicar un archivo de 4000 píxeles obliga al visitante a descargar datos que no verá. Mide el ancho máximo del componente y considera pantallas de alta densidad cuando la imagen lo requiera.", "Una regla de trabajo razonable consiste en exportar hasta el doble del ancho CSS para imágenes importantes en pantallas densas. No siempre hace falta: miniaturas, fondos con poco detalle y conexiones lentas pueden beneficiarse de variantes más pequeñas."] },
      { heading: "Calidad no significa porcentaje visual", paragraphs: ["El control de calidad de un codificador representa un compromiso interno; 80 no equivale a conservar exactamente el 80% de la información. Dos imágenes exportadas con el mismo valor pueden tener resultados muy distintos. Una foto con follaje, cabello o grano necesita más información que un fondo plano.", "Empieza alto, observa y baja en pasos pequeños. Detente cuando el ahorro adicional introduce defectos visibles en el tamaño de uso. Guarda la configuración junto al tipo de contenido, no como norma para toda la biblioteca."] },
      { heading: "Recorte, proporción y deformación", paragraphs: ["Cambiar la relación de aspecto exige recortar o añadir espacio; alterar solo ancho o alto deforma el contenido. Para productos, protege la silueta y deja margen coherente. Para retratos, comprueba rostro y mirada. ZoePic recorta desde el centro en los modos que requieren una proporción, de modo que debes revisar sujetos fuera del centro."], bullets: ["Original: conserva proporción y dimensiones.", "Tamaño popular: crea una salida exacta y puede recortar.", "Relación de aspecto: adapta el encuadre sin ampliar imágenes pequeñas.", "Personalizado: usa ancho y alto exactos; comprueba el recorte."] },
      { heading: "Ejemplo de decisión", paragraphs: ["Una fotografía de producto de 3000 × 2000 px que se mostrará a 720 px puede exportarse a 1440 × 960 px para pantallas densas. Si la tarjeta usa una proporción 4:5, conviene preparar ese recorte de forma consciente y revisar que el producto no quede cortado. Después se compara calidad y peso.", "Registra el ancho, proporción y calidad usados para que el siguiente lote mantenga consistencia. La optimización profesional se parece más a una receta por componente que a pulsar un botón universal."] },
    ],
  },
  {
    slug: "nombres-archivo-imagenes-seo",
    title: "Nombres de archivo para imágenes y SEO: una guía prudente",
    metaTitle: "Nombres de archivo para imágenes y SEO: guía",
    description: "Convenciones útiles para mantener una biblioteca clara sin prometer efectos automáticos en buscadores.",
    readingTime: "6 min",
    datePublished: "2026-09-06",
    dateModified: "2026-09-06",
    sections: [
      { heading: "El objetivo principal es la claridad", paragraphs: ["Un nombre descriptivo ayuda a identificar un archivo fuera del gestor de contenidos, reduce duplicados y hace más fácil colaborar. Puede aportar contexto a los sistemas que procesan la URL, pero no reemplaza el contenido de la página, el texto alternativo ni una buena arquitectura.", "Usa palabras que una persona reconocería al ver la imagen. Evita cadenas de palabras clave, adjetivos promocionales y detalles que no aparecen. `silla-roble-mesa-comedor.webp` es más útil que `IMG_4837.webp`; `mejor-silla-barata-oferta.webp` introduce afirmaciones que la imagen no demuestra."] },
      { heading: "Una convención sencilla", paragraphs: ["Trabaja en minúsculas, separa términos con guiones y elimina signos que puedan complicar una URL. Mantén el nombre lo bastante corto para leerlo en una lista. Añade una variante solo cuando distingue archivos reales."], bullets: ["Objeto o escena principal: `lampara-laton`.", "Ángulo o detalle: `lampara-laton-detalle-base`.", "Contexto útil: `lampara-laton-mesa-noche`.", "Variante estable: `lampara-laton-negra-frontal`."] },
      { heading: "Nombre, texto alternativo y pie de foto", paragraphs: ["Estos campos cumplen funciones diferentes. El nombre organiza el recurso y forma parte de su URL. El texto alternativo comunica el propósito visual cuando la imagen no se ve y debe escribirse según el contexto de la página. El pie de foto es contenido visible y puede ampliar la información.", "No copies automáticamente el nombre en el atributo `alt`. Una foto decorativa puede necesitar un `alt` vacío; una captura que explica un paso necesita describir lo que el lector debe entender. La decisión depende del uso, no del archivo aislado."] },
      { heading: "Cuándo usar renombrado con IA", paragraphs: ["La IA resulta útil como borrador para lotes grandes, siempre con revisión humana. Puede confundir modelos, materiales, lugares o marcas; también puede proponer palabras demasiado genéricas. Aporta contexto solo si es correcto y evita incluir datos personales o confidenciales.", "En ZoePic la conversión local y el renombrado con IA son procesos distintos. Al activar la IA se envía una versión reducida para análisis. Revisa la propuesta, confirma que describe la imagen y mantén una convención uniforme antes de publicar."] },
    ],
  },
];

export function getGuide(slug: string): Guide | undefined { return guides.find((guide) => guide.slug === slug); }
