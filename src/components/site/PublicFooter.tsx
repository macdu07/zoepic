import Link from "next/link";
import { BrandLogo } from "@/components/icons/BrandLogo";
import { PrivacyChoices } from "./PrivacyChoices";

export function PublicFooter() {
  return (
    <footer className="mt-20 border-t border-border bg-[#eff0e9]">
      <div className="shell grid gap-10 py-12 md:grid-cols-[1.4fr_1fr_1fr]">
        <div><BrandLogo className="h-7 w-auto" /><p className="mt-4 max-w-sm text-sm leading-6 text-muted-foreground">Herramientas claras para convertir, dimensionar y organizar imágenes destinadas a la web.</p></div>
        <div><p className="mb-3 text-sm font-semibold">Producto</p><div className="grid gap-2 text-sm text-muted-foreground"><Link href="/convert">Conversor WebP</Link><Link href="/guias">Guías</Link><Link href="/#pricing">Precios</Link><Link href="/sobre-zoepic">Sobre ZoePic</Link></div></div>
        <div><p className="mb-3 text-sm font-semibold">Información</p><div className="grid gap-2 text-sm text-muted-foreground"><Link href="/contacto">Contacto</Link><Link href="/politica-de-privacidad">Privacidad</Link><Link href="/terminos">Términos</Link><PrivacyChoices /></div></div>
      </div>
      <div className="shell border-t border-border/80 py-5 text-xs text-muted-foreground">© {new Date().getFullYear()} ZoePic. Todos los derechos reservados.</div>
    </footer>
  );
}
