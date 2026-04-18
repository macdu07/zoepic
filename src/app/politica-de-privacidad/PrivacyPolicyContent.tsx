"use client";

import Link from "next/link";
import { BrandLogo } from "@/components/icons/BrandLogo";
import { AnimatedSection, StaggerContainer, StaggerItem } from "@/components/core/AnimatedSection";

const LAST_UPDATED = "16 de abril de 2026";

export default function PrivacyPolicyContent() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-background/80 border-b border-border/50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <BrandLogo className="h-7 w-auto text-foreground" />
          </Link>
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Volver al inicio
          </Link>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-6 py-16">
        <AnimatedSection variant="fadeUp" delay={0.1}>
          <div className="mb-12">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Política de Privacidad
            </h1>
            <p className="text-sm text-muted-foreground">
              Última actualización: {LAST_UPDATED}
            </p>
          </div>
        </AnimatedSection>

        <StaggerContainer className="space-y-10 text-[0.9375rem] leading-relaxed text-foreground/90" staggerDelay={0.05} delay={0.15}>
          <StaggerItem variant="fadeUp">
            <Section title="1. Responsable del tratamiento">
            <p>
              El responsable del tratamiento de los datos personales recogidos a
              través de ZoePic es <strong>ZoePic</strong>. Para cualquier
              consulta relacionada con esta política puedes contactarnos en{" "}
              <a
                href="mailto:privacy@zoepic.online"
                className="text-primary underline underline-offset-4 hover:opacity-80"
              >
                privacy@zoepic.online
              </a>
              .
            </p>
          </Section>
          </StaggerItem>

          <StaggerItem variant="fadeUp">
          <Section title="2. Datos que recopilamos">
            <p>Recopilamos los siguientes datos personales:</p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li>
                <strong>Datos de cuenta:</strong> nombre, dirección de correo
                electrónico y contraseña (almacenada en formato cifrado) al
                registrarte.
              </li>
              <li>
                <strong>Datos de uso:</strong> número de conversiones WebP
                realizadas y número de renombrados con IA utilizados en el
                período de facturación actual.
              </li>
              <li>
                <strong>Datos de pago:</strong> gestionados íntegramente por
                PayPal. ZoePic no almacena ni tiene acceso a los datos de tu
                tarjeta o cuenta bancaria.
              </li>
              <li>
                <strong>Datos técnicos:</strong> dirección IP, tipo de
                navegador y sistema operativo, recopilados automáticamente con
                fines de seguridad y rendimiento.
              </li>
            </ul>
          </Section>
          </StaggerItem>

          <StaggerItem variant="fadeUp">
          <Section title="3. Procesamiento de imágenes">
            <p>
              ZoePic aplica dos tratamientos distintos sobre tus imágenes, con
              implicaciones de privacidad diferentes:
            </p>
            <div className="mt-4 space-y-4">
              <div className="rounded-xl border border-border/50 bg-card/40 p-5">
                <p className="font-semibold mb-1">
                  Conversión a WebP — procesamiento local
                </p>
                <p className="text-sm text-muted-foreground">
                  La conversión de tus imágenes al formato WebP se realiza
                  completamente en tu navegador mediante tecnología cliente-side.
                  Tus archivos originales{" "}
                  <strong>nunca se envían ni se almacenan</strong> en nuestros
                  servidores.
                </p>
              </div>
              <div className="rounded-xl border border-border/50 bg-card/40 p-5">
                <p className="font-semibold mb-1">
                  Renombrado con IA — envío a servicio externo
                </p>
                <p className="text-sm text-muted-foreground">
                  Cuando utilizas la función de renombrado inteligente, se
                  genera una versión reducida de tu imagen (512 px) en formato
                  WebP y se envía de forma segura a la API de{" "}
                  <strong>Google Gemini</strong> para su análisis de contenido.
                  Dicha imagen no se almacena en nuestros servidores ni en los
                  de Google más allá del tiempo necesario para generar la
                  respuesta. Puedes consultar la política de privacidad de
                  Google en{" "}
                  <a
                    href="https://policies.google.com/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline underline-offset-4 hover:opacity-80"
                  >
                    policies.google.com/privacy
                  </a>
                  .
                </p>
              </div>
            </div>
          </Section>
          </StaggerItem>

          <StaggerItem variant="fadeUp">
          <Section title="4. Finalidad del tratamiento">
            <p>Utilizamos tus datos para:</p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li>Gestionar tu cuenta y autenticación.</li>
              <li>
                Controlar el uso del servicio y aplicar los límites del plan
                contratado.
              </li>
              <li>
                Procesar pagos y gestionar tu suscripción a través de PayPal.
              </li>
              <li>
                Enviarte comunicaciones relacionadas con el servicio (cambios en
                los planes, alertas de seguridad, etc.).
              </li>
              <li>
                Mejorar y optimizar el funcionamiento de ZoePic mediante datos
                de uso agregados y anonimizados.
              </li>
            </ul>
          </Section>
          </StaggerItem>

          <StaggerItem variant="fadeUp">
          <Section title="5. Base legal del tratamiento">
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Ejecución de un contrato:</strong> el tratamiento de
                tus datos de cuenta y uso es necesario para prestarte el
                servicio.
              </li>
              <li>
                <strong>Interés legítimo:</strong> los datos técnicos se tratan
                para garantizar la seguridad e integridad del servicio.
              </li>
              <li>
                <strong>Cumplimiento legal:</strong> conservamos ciertos datos
                de facturación durante el tiempo exigido por la normativa fiscal
                aplicable.
              </li>
            </ul>
          </Section>
          </StaggerItem>

          <StaggerItem variant="fadeUp">
          <Section title="6. Compartición de datos con terceros">
            <p>
              ZoePic no vende ni cede tus datos personales a terceros con fines
              comerciales. Solo compartimos datos con los siguientes proveedores
              de servicio, bajo acuerdos de tratamiento de datos:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li>
                <strong>PayPal:</strong> para el procesamiento de pagos y
                suscripciones.
              </li>
              <li>
                <strong>Google Gemini API:</strong> para el análisis de
                contenido de imágenes al usar la función de renombrado con IA.
              </li>
            </ul>
          </Section>
          </StaggerItem>

          <StaggerItem variant="fadeUp">
          <Section title="7. Conservación de los datos">
            <p>
              Conservamos tus datos personales mientras tu cuenta esté activa.
              Si eliminas tu cuenta, borraremos tus datos en un plazo máximo de
              30 días, salvo aquellos que debamos conservar por obligación legal
              (p. ej., registros de facturación).
            </p>
          </Section>
          </StaggerItem>

          <StaggerItem variant="fadeUp">
          <Section title="8. Tus derechos">
            <p>
              De acuerdo con la normativa de protección de datos aplicable,
              tienes derecho a:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li>
                <strong>Acceso:</strong> solicitar una copia de los datos
                personales que tenemos sobre ti.
              </li>
              <li>
                <strong>Rectificación:</strong> corregir datos inexactos o
                incompletos.
              </li>
              <li>
                <strong>Supresión:</strong> solicitar la eliminación de tus
                datos («derecho al olvido»).
              </li>
              <li>
                <strong>Portabilidad:</strong> recibir tus datos en un formato
                estructurado y de uso común.
              </li>
              <li>
                <strong>Oposición y limitación:</strong> oponerte al tratamiento
                o solicitar su limitación en determinadas circunstancias.
              </li>
            </ul>
            <p className="mt-4">
              Para ejercer cualquiera de estos derechos, escríbenos a{" "}
              <a
                href="mailto:privacy@zoepic.online"
                className="text-primary underline underline-offset-4 hover:opacity-80"
              >
                privacy@zoepic.online
              </a>
              .
            </p>
          </Section>
          </StaggerItem>

          <StaggerItem variant="fadeUp">
          <Section title="9. Cookies">
            <p>
              ZoePic utiliza únicamente cookies técnicas estrictamente necesarias
              para el funcionamiento del servicio (gestión de sesión y
              autenticación). No utilizamos cookies de rastreo ni publicidad de
              terceros.
            </p>
          </Section>
          </StaggerItem>

          <StaggerItem variant="fadeUp">
          <Section title="10. Seguridad">
            <p>
              Aplicamos medidas técnicas y organizativas razonables para proteger
              tus datos frente a accesos no autorizados, pérdida o destrucción,
              incluyendo cifrado en tránsito (HTTPS) y en reposo para las
              contraseñas.
            </p>
          </Section>
          </StaggerItem>

          <StaggerItem variant="fadeUp">
          <Section title="11. Cambios en esta política">
            <p>
              Podemos actualizar esta política periódicamente. En caso de cambios
              significativos, te notificaremos por correo electrónico o mediante
              un aviso destacado en la aplicación antes de que entren en vigor.
            </p>
          </Section>
          </StaggerItem>

          <StaggerItem variant="fadeUp">
          <Section title="12. Contacto">
            <p>
              Si tienes preguntas, dudas o deseas ejercer tus derechos,
              contáctanos en{" "}
              <a
                href="mailto:privacy@zoepic.online"
                className="text-primary underline underline-offset-4 hover:opacity-80"
              >
                privacy@zoepic.online
              </a>
              .
            </p>
          </Section>
          </StaggerItem>
        </StaggerContainer>
      </main>

      {/* Footer */}
      <AnimatedSection variant="fadeUp" delay={0.2}>
      <footer className="border-t border-border/50 bg-card/20 mt-16">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2">
            <BrandLogo className="h-6 w-auto text-foreground" />
          </Link>
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} ZoePic. Todos los derechos
            reservados.
          </p>
        </div>
      </footer>
      </AnimatedSection>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="text-lg font-bold mb-3 text-foreground">{title}</h2>
      <div className="text-foreground/80 space-y-3">{children}</div>
    </section>
  );
}
