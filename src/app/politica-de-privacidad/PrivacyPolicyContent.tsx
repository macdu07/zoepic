import { PublicShell } from "@/components/site/PublicShell";

const LAST_UPDATED = "6 de septiembre de 2026";

export default function PrivacyPolicyContent() {
  return (
    <PublicShell>
      <main className="reading px-5 py-16 sm:px-6 md:py-24">
        <h1 className="font-display text-5xl font-medium tracking-[-.03em]">Política de privacidad</h1>
        <p className="mt-3 text-sm text-muted-foreground">Última actualización: {LAST_UPDATED}</p>
        <div className="mt-12 space-y-11 text-[1.02rem] leading-8 text-foreground/80">
          <Section title="Responsable y contacto"><p>El responsable del servicio opera bajo la marca ZoePic. Para consultas y solicitudes de privacidad está disponible <a href="mailto:privacy@zoepic.online">privacy@zoepic.online</a>.</p></Section>
          <Section title="Datos de cuenta y uso"><p>Cuando creas una cuenta podemos tratar tu nombre, correo electrónico, credenciales protegidas, plan, estado de suscripción y contadores de uso. También pueden registrarse datos técnicos necesarios para seguridad, prevención de abuso y funcionamiento del servicio.</p><p>El proveedor de pagos procesa la información necesaria para el cobro. ZoePic no necesita almacenar el número completo de tu tarjeta.</p></Section>
          <Section title="Procesamiento de imágenes"><p><strong>Conversión local:</strong> la lectura, compresión, conversión a WebP y cambio de tamaño se realizan en el navegador. Los archivos utilizados únicamente en este proceso no se envían a ZoePic.</p><p><strong>Renombrado con IA:</strong> si activas esta opción, se prepara una versión reducida de la imagen y se envía al servicio de inteligencia artificial para proponer un nombre. No actives esta función con imágenes confidenciales o que no estés autorizado a compartir.</p></Section>
          <Section title="Finalidades y conservación"><p>Tratamos los datos para prestar el servicio, autenticar cuentas, aplicar límites, administrar suscripciones, responder solicitudes y proteger la plataforma. Los periodos de conservación dependen de la finalidad y de las obligaciones legales aplicables. Los registros necesarios para facturación pueden conservarse durante el plazo exigido.</p></Section>
          <Section title="Proveedores"><p>ZoePic utiliza proveedores técnicos para autenticación, base de datos, correo, pagos, seguridad e inteligencia artificial. Cada proveedor recibe únicamente la información necesaria para su función. Google puede intervenir como proveedor de IA y, en las páginas públicas donde se habilite, como proveedor de publicidad.</p></Section>
          <Section title="Cookies y publicidad" id="cookies-publicidad"><p>La aplicación utiliza almacenamiento y tecnologías necesarias para sesión, seguridad y límites de uso. Las páginas públicas con contenido pueden cargar Google AdSense, que puede usar cookies o tecnologías similares para medir y mostrar anuncios conforme a tus elecciones y a la configuración regional aplicable.</p><p>Para visitantes del Espacio Económico Europeo, Reino Unido y Suiza, la configuración publicitaria debe utilizar una plataforma de gestión del consentimiento certificada por Google. Puedes volver a abrir las opciones desde el enlace “Privacidad y cookies” del pie de página cuando el mensaje de Google esté disponible.</p></Section>
          <Section title="Tus derechos"><p>Según la normativa aplicable, puedes solicitar acceso, rectificación, supresión, portabilidad, oposición o limitación del tratamiento. Envía la solicitud a <a href="mailto:privacy@zoepic.online">privacy@zoepic.online</a>. Podremos pedir información razonable para verificar la identidad.</p></Section>
          <Section title="Seguridad y cambios"><p>Aplicamos medidas técnicas y organizativas razonables para proteger los datos. Ningún sistema ofrece seguridad absoluta, por lo que conviene mantener copias de los originales y proteger las credenciales. Si esta política cambia, actualizaremos la fecha y, cuando corresponda, informaremos dentro del servicio.</p></Section>
        </div>
      </main>
    </PublicShell>
  );
}

function Section({ title, id, children }: { title: string; id?: string; children: React.ReactNode }) {
  return <section id={id} className="scroll-mt-24"><h2 className="font-display text-3xl font-medium text-foreground">{title}</h2><div className="mt-4 space-y-4 [&_a]:font-semibold [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-4">{children}</div></section>;
}
