"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
import { BrandLogo } from "@/components/icons/BrandLogo";
import NavbarActions from "@/components/landing/NavbarActions";

const links = [
  { href: "/convert", label: "Conversor" },
  { href: "/guias", label: "Guías" },
  { href: "/#pricing", label: "Precios" },
  { href: "/sobre-zoepic", label: "Sobre ZoePic" },
];

export function PublicHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/95 supports-[backdrop-filter]:bg-background/85 supports-[backdrop-filter]:backdrop-blur-xl">
      <div className="shell flex h-16 items-center justify-between gap-5">
        <Link href="/" aria-label="ZoePic, inicio"><BrandLogo className="h-7 w-auto text-foreground" /></Link>
        <nav className="hidden items-center gap-7 md:flex" aria-label="Navegación principal">
          {links.map((link) => <Link key={link.href} href={link.href} className="text-sm font-medium text-muted-foreground underline-offset-8 hover:text-foreground hover:underline">{link.label}</Link>)}
        </nav>
        <div className="hidden md:block"><NavbarActions /></div>
        <details className="group relative md:hidden">
          <summary className="flex h-10 w-10 cursor-pointer list-none items-center justify-center rounded-xl border border-border bg-card" aria-label="Abrir menú"><Menu className="h-5 w-5" /></summary>
          <div className="absolute right-0 top-12 w-64 rounded-2xl bg-card p-3 shadow-[0_18px_50px_-24px_rgba(20,30,23,.5)]">
            <nav className="grid" aria-label="Navegación móvil">
              {links.map((link) => <Link key={link.href} href={link.href} className="rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-muted">{link.label}</Link>)}
            </nav>
            <div className="mt-2 border-t border-border pt-3"><NavbarActions /></div>
          </div>
        </details>
      </div>
    </header>
  );
}
