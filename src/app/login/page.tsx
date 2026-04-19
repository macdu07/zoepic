"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ImagePlay, Mail, KeyRound, Loader2, Eye, EyeOff } from "lucide-react";
import { signIn } from "@/lib/auth-client";
import { BrandLogo } from "@/components/icons/BrandLogo";
import { AnimatedSection } from "@/components/core/AnimatedSection";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileRef = useRef<TurnstileInstance>(null);
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!turnstileToken) return;
    setIsLoading(true);

    const verifyRes = await fetch("/api/verify-turnstile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: turnstileToken }),
    });
    const { success: turnstileOk } = await verifyRes.json();

    if (!turnstileOk) {
      toast({ title: "Verificación fallida", description: "Completa el desafío de seguridad.", variant: "destructive" });
      turnstileRef.current?.reset();
      setTurnstileToken(null);
      setIsLoading(false);
      return;
    }

    const { data, error } = await signIn.email({
      email,
      password,
    });

    if (error) {
      toast({
        title: "Error de acceso",
        description: error.message || "No se pudo iniciar sesión.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    if (data) {
      toast({
        title: "¡Bienvenido!",
        description: "Iniciaste sesión correctamente.",
      });
      window.location.href = "/dashboard";
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-background text-foreground">
      <AnimatedSection variant="scale" amount={0.2} duration={0.4} className="w-full max-w-md">
        <Card className="w-full shadow-xl bg-card text-card-foreground">
          <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex justify-center">
            <BrandLogo className="h-9 w-auto text-foreground" />
          </div>
          <CardTitle className="text-xl font-bold">Iniciar Sesión</CardTitle>
          <CardDescription className="text-muted-foreground">
            Ingresa tus credenciales para acceder a ZoePic.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Correo electrónico
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-10 bg-input text-foreground border-border focus:bg-background"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium">
                  Contraseña
                </Label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-primary hover:text-primary/80 transition-colors"
                  id="forgot-password-link"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Tu contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pl-10 pr-10 bg-input text-foreground border-border focus:bg-background"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <Turnstile
              ref={turnstileRef}
              siteKey={process.env.NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY!}
              onSuccess={setTurnstileToken}
              onError={() => setTurnstileToken(null)}
              onExpire={() => setTurnstileToken(null)}
              options={{ theme: "light", size: "flexible" }}
            />

            <Button
              type="submit"
              className="w-full font-semibold h-11"
              disabled={isLoading || !turnstileToken}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Iniciando sesión...
                </>
              ) : (
                "Iniciar Sesión"
              )}
            </Button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  ¿No tienes cuenta?
                </span>
              </div>
            </div>
            <Link href="/signup" className="block mt-4">
              <Button variant="outline" className="w-full font-semibold h-11">
                Crear una Cuenta
              </Button>
            </Link>
          </div>
        </CardContent>
        </Card>
      </AnimatedSection>
      <AnimatedSection variant="fadeUp" delay={0.2}>
        <footer className="mt-8 text-center text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground transition-colors">
            ← Volver al inicio
          </Link>
        </footer>
      </AnimatedSection>
    </div>
  );
}
