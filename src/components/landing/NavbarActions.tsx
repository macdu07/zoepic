"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/auth-client";

export default function NavbarActions() {
  const { data: sessionData, isPending } = useSession();
  const user = sessionData?.user as any;

  const initial =
    user?.name?.charAt(0)?.toUpperCase() ??
    user?.email?.charAt(0)?.toUpperCase() ??
    "U";

  if (isPending) return <div className="w-24 h-8" />;

  if (user) {
    return (
      <div className="flex items-center gap-3">
        <Button asChild size="sm" variant="outline" className="text-sm font-medium">
          <Link href="/dashboard">Ir al Dashboard</Link>
        </Button>
        <Link href="/dashboard/account">
          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary hover:bg-primary/20 transition-colors cursor-pointer overflow-hidden flex-shrink-0">
            {user?.image ? (
              <img
                src={user.image}
                alt={user?.name ?? "Foto de perfil"}
                className="w-full h-full object-cover"
              />
            ) : (
              initial
            )}
          </div>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Button asChild variant="ghost" size="sm" className="text-sm font-medium">
        <Link href="/login">Iniciar Sesión</Link>
      </Button>
      <Button asChild size="sm" className="text-sm font-semibold">
        <Link href="/signup">Crear Cuenta</Link>
      </Button>
    </div>
  );
}
