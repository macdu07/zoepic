"use client";

import { useState, useRef, useCallback } from "react";
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
import {
  Mail,
  KeyRound,
  User,
  Loader2,
  Eye,
  EyeOff,
  ShieldCheck,
  RotateCcw,
} from "lucide-react";
import { signUp, authClient } from "@/lib/auth-client";
import { BrandLogo } from "@/components/icons/BrandLogo";
import { AnimatedSection } from "@/components/core/AnimatedSection";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import { useMounted } from "@/hooks/use-mounted";

type Step = "form" | "verify";

// OTP input: 6 cuadros individuales
function OtpInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = value.padEnd(6, " ").split("").slice(0, 6);

  const handleChange = useCallback(
    (idx: number, raw: string) => {
      const digit = raw.replace(/\D/g, "").slice(-1);
      const next = digits.map((d, i) => (i === idx ? digit : d)).join("");
      onChange(next.slice(0, 6));
      if (digit && idx < 5) inputs.current[idx + 1]?.focus();
    },
    [digits, onChange]
  );

  const handleKeyDown = useCallback(
    (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Backspace" && !digits[idx] && idx > 0) {
        inputs.current[idx - 1]?.focus();
      }
    },
    [digits]
  );

  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLInputElement>) => {
      const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
      if (pasted) {
        onChange(pasted.padEnd(6, "").slice(0, 6));
        inputs.current[Math.min(pasted.length, 5)]?.focus();
      }
      e.preventDefault();
    },
    [onChange]
  );

  return (
    <div className="flex gap-2 justify-center">
      {Array.from({ length: 6 }).map((_, idx) => (
        <input
          key={idx}
          ref={(el) => { inputs.current[idx] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digits[idx] === " " ? "" : digits[idx]}
          onChange={(e) => handleChange(idx, e.target.value)}
          onKeyDown={(e) => handleKeyDown(idx, e)}
          onPaste={handlePaste}
          className="w-11 h-12 text-center text-xl font-bold rounded-lg border border-border bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
          id={`otp-signup-${idx}`}
          autoComplete="one-time-code"
        />
      ))}
    </div>
  );
}

export default function SignUpPage() {
  const [step, setStep] = useState<Step>("form");

  // Paso 1: formulario
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Paso 2: verificación
  const [otp, setOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileRef = useRef<TurnstileInstance>(null);

  const router = useRouter();
  const { toast } = useToast();
  const mounted = useMounted();

  // ── Paso 1: Registrar ──────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast({ title: "Error", description: "Las contraseñas no coinciden.", variant: "destructive" });
      return;
    }
    if (password.length < 6) {
      toast({ title: "Error", description: "La contraseña debe tener al menos 6 caracteres.", variant: "destructive" });
      return;
    }
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

    const { error } = await signUp.email({
      email,
      password,
      name: name || email.split("@")[0],
    });

    setIsLoading(false);

    if (error) {
      toast({ title: "Error al registrarse", description: error.message || "No se pudo crear la cuenta.", variant: "destructive" });
      return;
    }

    const { error: otpError } = await authClient.emailOtp.sendVerificationOtp({
      email,
      type: "email-verification",
    });

    if (otpError) {
      toast({ title: "Error al enviar código", description: "Cuenta creada, pero no pudimos enviar el código. Usa 'Reenviar código'.", variant: "destructive" });
    } else {
      toast({ title: "Cuenta creada", description: "Te enviamos un código de verificación por email." });
    }
    setStep("verify");
  };

  // ── Paso 2: Verificar OTP ──────────────────────────────────────────
  const handleVerify = async () => {
    if (otp.replace(/\D/g, "").length < 6) {
      toast({ title: "Código incompleto", description: "Ingresa los 6 dígitos del código.", variant: "destructive" });
      return;
    }

    setIsVerifying(true);

    const { error } = await authClient.emailOtp.verifyEmail({
      email,
      otp: otp.replace(/\D/g, ""),
    });

    setIsVerifying(false);

    if (error) {
      toast({ title: "Código incorrecto", description: error.message || "El código no es válido o expiró.", variant: "destructive" });
      return;
    }

    toast({ title: "¡Email verificado!", description: "Tu cuenta está lista. Bienvenido/a." });
    window.location.href = "/dashboard";
  };

  // ── Reenviar código ────────────────────────────────────────────────
  const handleResend = async () => {
    setIsResending(true);

    const { error } = await authClient.emailOtp.sendVerificationOtp({
      email,
      type: "email-verification",
    });

    setIsResending(false);

    if (error) {
      toast({ title: "Error", description: "No se pudo reenviar el código.", variant: "destructive" });
      return;
    }

    toast({ title: "Código reenviado", description: "Revisa tu bandeja de entrada." });
    setOtp("");
  };

  // ── Render ─────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-background text-foreground">
      <AnimatedSection variant="scale" amount={0.2} duration={0.4} className="w-full max-w-md">
        <Card className="w-full shadow-xl bg-card text-card-foreground">

          {/* ── Header ── */}
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex justify-center">
              <BrandLogo className="h-7 w-auto text-foreground" />
            </div>

            {step === "form" ? (
              <>
                <CardTitle className="text-xl font-bold">Crear Cuenta</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Regístrate para comenzar a optimizar tus imágenes.
                </CardDescription>
              </>
            ) : (
              <>
                <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                  <ShieldCheck className="h-7 w-7 text-primary" />
                </div>
                <CardTitle className="text-xl font-bold">Verifica tu Email</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Ingresa el código de 6 dígitos enviado a{" "}
                  <span className="font-medium text-foreground">{email}</span>
                </CardDescription>
              </>
            )}
          </CardHeader>

          <CardContent>
            {/* ── Paso 1: Formulario de registro ── */}
            {step === "form" && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium">
                    Nombre <span className="text-muted-foreground">(opcional)</span>
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="Tu nombre"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="pl-10 bg-input text-foreground border-border focus:bg-background"
                    />
                  </div>
                </div>

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
                  <Label htmlFor="password" className="text-sm font-medium">
                    Contraseña
                  </Label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Mínimo 6 caracteres"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      className="pl-10 pr-10 bg-input text-foreground border-border focus:bg-background"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium">
                    Confirmar contraseña
                  </Label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="Repite tu contraseña"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      minLength={6}
                      className="pl-10 bg-input text-foreground border-border focus:bg-background"
                    />
                  </div>
                </div>

                {mounted ? (
                  <Turnstile
                    ref={turnstileRef}
                    siteKey={process.env.NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY!}
                    onSuccess={setTurnstileToken}
                    onError={() => setTurnstileToken(null)}
                    onExpire={() => setTurnstileToken(null)}
                    options={{ theme: "light", size: "flexible" }}
                  />
                ) : (
                  <div className="h-[65px] w-full" />
                )}

                <Button type="submit" className="w-full font-semibold h-11" disabled={isLoading || !turnstileToken}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creando cuenta...
                    </>
                  ) : (
                    "Crear Cuenta"
                  )}
                </Button>
              </form>
            )}

            {/* ── Paso 2: Verificación OTP ── */}
            {step === "verify" && (
              <div className="space-y-6">
                <OtpInput value={otp} onChange={setOtp} />

                <Button
                  onClick={handleVerify}
                  className="w-full font-semibold h-11"
                  disabled={isVerifying || otp.replace(/\D/g, "").length < 6}
                >
                  {isVerifying ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verificando...
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="mr-2 h-4 w-4" />
                      Verificar Codigo
                    </>
                  )}
                </Button>

                <div className="flex flex-col items-center gap-3 text-sm">
                  <span className="text-muted-foreground">¿No recibiste el código?</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleResend}
                    disabled={isResending}
                    className="text-primary hover:text-primary/80"
                    id="resend-signup-otp"
                  >
                    {isResending ? (
                      <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                    ) : (
                      <RotateCcw className="mr-2 h-3 w-3" />
                    )}
                    Reenviar código
                  </Button>
                  <button
                    type="button"
                    onClick={() => { setStep("form"); setOtp(""); }}
                    className="text-muted-foreground hover:text-foreground transition-colors text-xs"
                  >
                    ← Volver al formulario
                  </button>
                </div>
              </div>
            )}

            {/* ── Enlace a Login (solo en paso form) ── */}
            {step === "form" && (
              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">¿Ya tienes cuenta?</span>
                  </div>
                </div>
                <Button asChild variant="outline" className="w-full font-semibold h-11 mt-4">
                  <Link href="/login">
                    Iniciar Sesión
                  </Link>
                </Button>
              </div>
            )}
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
