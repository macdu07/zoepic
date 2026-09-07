import type { Metadata } from "next";
import { PublicShell } from "@/components/site/PublicShell";

export const metadata: Metadata = { title: "Términos de uso", description: "Condiciones generales para utilizar ZoePic.", alternates: { canonical: "/terminos" }, robots: { index: true, follow: true } };
const sections = [
  ["Uso del servicio", "ZoePic permite convertir imágenes y, según el plan, utilizar funciones adicionales. Debes utilizar el servicio de forma lícita y contar con autorización para procesar los archivos que selecciones."],
  ["Cuentas y seguridad", "Eres responsable de mantener la confidencialidad de tus credenciales y de la actividad realizada desde tu cuenta. Comunica cualquier acceso no autorizado mediante el canal de contacto."],
  ["Planes y pagos", "Las características, límites, periodicidad y precios visibles al contratar forman parte de la oferta aplicable. Las suscripciones pueden gestionarse desde la cuenta. Los pagos son procesados por el proveedor indicado durante la contratación."],
  ["Contenido e inteligencia artificial", "Conservas los derechos que te correspondan sobre tus archivos. Las propuestas de nombres generadas por IA pueden contener errores y deben revisarse antes de publicarse. No se garantiza un resultado de posicionamiento en buscadores."],
  ["Disponibilidad", "El servicio puede cambiar, interrumpirse o requerir mantenimiento. ZoePic procura mantenerlo disponible, pero no promete funcionamiento ininterrumpido ni compatibilidad con todos los sistemas externos."],
  ["Responsabilidad", "Debes conservar copias de tus archivos originales y comprobar cada resultado. En la medida permitida por la normativa aplicable, ZoePic no responde por pérdidas derivadas de publicar un archivo sin revisarlo."],
  ["Contacto", "Las consultas sobre estos términos pueden enviarse a privacy@zoepic.online."],
];
export default function TermsPage() { return <PublicShell><main className="reading px-5 py-16 sm:px-6 md:py-24"><h1 className="font-display text-5xl font-medium">Términos de uso</h1><p className="mt-3 text-sm text-muted-foreground">Última actualización: 6 de septiembre de 2026</p><div className="mt-12 space-y-10">{sections.map(([title, body]) => <section key={title}><h2 className="text-xl font-semibold">{title}</h2><p className="mt-3 leading-7 text-foreground/80">{body}</p></section>)}</div></main></PublicShell>; }
