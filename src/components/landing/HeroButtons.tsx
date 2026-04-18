"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronDown } from "lucide-react";
import { useSession } from "@/lib/auth-client";

interface HeroButtonsProps {
  showLearnMore?: boolean;
  primaryLabel?: string;
}

export default function HeroButtons({
  showLearnMore = false,
  primaryLabel,
}: HeroButtonsProps) {
  const { data: sessionData, isPending } = useSession();
  const user = sessionData?.user as any;

  if (isPending) return <div className="h-12" />;

  const label = primaryLabel ?? (user ? "Ir al Dashboard" : "Comenzar Gratis");
  const href = user ? "/dashboard" : "/signup";

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
      <Button
        asChild
        size="lg"
        className="h-12 px-8 text-base font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-shadow"
      >
        <Link href={href}>
          {label}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </Button>
      {showLearnMore && (
        <Button asChild variant="outline" size="lg" className="h-12 px-8 text-base font-medium">
          <a href="#features">
            Saber más
            <ChevronDown className="ml-2 h-4 w-4" />
          </a>
        </Button>
      )}
    </div>
  );
}
