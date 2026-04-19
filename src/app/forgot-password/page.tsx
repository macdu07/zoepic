"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
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
  Loader2,
  ShieldCheck,
  RotateCcw,
  Eye,
  EyeOff,
  CheckCircle2,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { BrandLogo } from "@/components/icons/BrandLogo";
import { AnimatedSection } from "@/components/core/AnimatedSection";

type Step = "email" | "code" | "password" | "done";

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
          id={`otp-reset-${idx}`}
          autoComplete="one-time-code"
        />
      ))}
    </div>
  );
}

// Indicador de pasos
function StepIndicator({ current }: { current: number }) {
  const steps = ["Email", "Código", "Contraseña"];
  return (
    <div className="flex items-center justify-center gap-1 mb-6">
      {steps.map((label, idx) => {
        const stepNum = idx + 1;
        const isActive = stepNum === current;
        const isDone = stepNum < current;
        return (
          <div key={label} className="flex items-center">
            <div
              className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : isDone
                  ? "bg-primary/20 text-primary"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {isDone ? <CheckCircle2 className="h-4 w-4" /> : stepNum}
            </div>
            {idx < steps.length - 1 && (
              <div
                className={`h-px w-8 mx-1 transition-all ${
                  isDone ? "bg-primary/40" : "bg-border"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileRef = useRef<TurnstileInstance>(null);

  const { toast } = useToast();

  const stepNumber = { email: 1, code: 2, password: 3, done: 3 }[step];

  // ── Paso 1: Enviar OTP ─────────────────────────────────────────────
  const handleSendOtp = async (e: React.FormEvent<HTMLFormElement>) => {
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

    const { error } = await authClient.emailOtp.requestPasswordReset({ email });

    setIsLoading(false);

    if (error) {
      toast({
        title: "Error",
        description: error.message || "No se pudo enviar el código.",
        variant: "destructive",
      });
      return;
    }

    toast({ title: "Código enviado", description: "Revisa tu bandeja de entrada." });
    setStep("code");
  };

  // ── Paso 2: Validar OTP ────────────────────────────────────────────
  const handleVerifyOtp = async () => {
    if (otp.replace(/\D/g, "").length < 6) {
      toast({ title: "Código incompleto", description: "Ingresa los 6 dígitos.", variant: "destructive" });
      return;
    }

    setIsLoading(true);

    const { error } = await authClient.emailOtp.checkVerificationOtp({
      email,
      otp: otp.replace(/\D/g, ""),
      type: "forget-password",
    });

    setIsLoading(false);

    if (error) {
      toast({ title: "Código incorrecto", description: error.message || "El código no es válido o expiró.", variant: "destructive" });
      return;
    }

    setStep("password");
  };

  // ── Reenviar OTP ───────────────────────────────────────────────────
  const handleResend = async () => {
    setIsResending(true);
    const { error } = await authClient.emailOtp.requestPasswordReset({ email });
    setIsResending(false);

    if (error) {
      toast({ title: "Error", description: "No se pudo reenviar el código.", variant: "destructive" });
      return;
    }

    toast({ title: "Código reenviado", description: "Revisa tu bandeja de entrada." });
    setOtp("");
  };

  // ── Paso 3: Cambiar contraseña ─────────────────────────────────────
  const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast({ title: "Error", description: "Las contraseñas no coinciden.", variant: "destructive" });
      return;
    }
    if (newPassword.length < 6) {
      toast({ title: "Error", description: "La contraseña debe tener al menos 6 caracteres.", variant: "destructive" });
      return;
    }

    setIsLoading(true);

    const { error } = await authClient.emailOtp.resetPassword({
      email,
      otp: otp.replace(/\D/g, ""),
      password: newPassword,
    });

    setIsLoading(false);

    if (error) {
      toast({ title: "Error", description: error.message || "No se pudo cambiar la contraseña.", variant: "destructive" });
      return;
    }

    setStep("done");
  };

  // ── Render ─────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-background text-foreground">
      <AnimatedSection variant="scale" amount={0.2} duration={0.4} className="w-full max-w-md">
        <Card className="w-full shadow-xl bg-card text-card-foreground">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex justify-center">
              <BrandLogo className="h-7 w-auto text-foreground" />
            </div>

            {step !== "done" && <StepIndicator current={stepNumber} />}

            {step === "email" && (
              <>
                <CardTitle className="text-xl font-bold">Recuperar Contraseña</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Ingresa tu email y te enviaremos un código de verificación.
                </CardDescription>
              </>
            )}
            {step === "code" && (
              <>
                <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                  <ShieldCheck className="h-7 w-7 text-primary" />
                </div>
                <CardTitle className="text-xl font-bold">Ingresa el Código</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Enviamos un código a{" "}
                  <span className="font-medium text-foreground">{email}</span>
                </CardDescription>
              </>
            )}
            {step === "password" && (
              <>
                <CardTitle className="text-xl font-bold">Nueva Contraseña</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Elige una contraseña segura para tu cuenta.
                </CardDescription>
              </>
            )}
            {step === "done" && (
              <>
                <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
                  <CheckCircle2 className="h-9 w-9 text-green-500" />
                </div>
                <CardTitle className="text-xl font-bold">¡Contraseña Actualizada!</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Tu contraseña fue cambiada exitosamente.
                </CardDescription>
              </>
            )}
          </CardHeader>

          <CardContent>
            {/* ── Paso 1: Email ── */}
            {step === "email" && (
              <form onSubmit={handleSendOtp} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="reset-email" className="text-sm font-medium">
                    Correo electrónico
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="reset-email"
                      type="email"
                      placeholder="tu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="pl-10 bg-input text-foreground border-border focus:bg-background"
                    />
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

                <Button type="submit" className="w-full font-semibold h-11" disabled={isLoading || !turnstileToken}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enviando código...
                    </>
                  ) : (
                    "Enviar Código de Verificación"
                  )}
                </Button>
              </form>
            )}

            {/* ── Paso 2: Código OTP ── */}
            {step === "code" && (
              <div className="space-y-6">
                <OtpInput value={otp} onChange={setOtp} />

                <Button
                  onClick={handleVerifyOtp}
                  className="w-full font-semibold h-11"
                  disabled={isLoading || otp.replace(/\D/g, "").length < 6}
                  id="verify-reset-otp-btn"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verificando...
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="mr-2 h-4 w-4" />
                      Verificar Código
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
                    id="resend-reset-otp-btn"
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
                    onClick={() => { setStep("email"); setOtp(""); }}
                    className="text-muted-foreground hover:text-foreground transition-colors text-xs"
                  >
                    ← Cambiar email
                  </button>
                </div>
              </div>
            )}

            {/* ── Paso 3: Nueva contraseña ── */}
            {step === "password" && (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-password" className="text-sm font-medium">
                    Nueva contraseña
                  </Label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="new-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Mínimo 6 caracteres"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
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
                  <Label htmlFor="confirm-new-password" className="text-sm font-medium">
                    Confirmar contraseña
                  </Label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirm-new-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Repite tu nueva contraseña"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      minLength={6}
                      className="pl-10 bg-input text-foreground border-border focus:bg-background"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full font-semibold h-11"
                  disabled={isLoading}
                  id="reset-password-submit-btn"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    "Guardar Nueva Contraseña"
                  )}
                </Button>
              </form>
            )}

            {/* ── Paso 4: Éxito ── */}
            {step === "done" && (
              <div className="space-y-4 text-center">
                <p className="text-sm text-muted-foreground">
                  Ya puedes iniciar sesión con tu nueva contraseña.
                </p>
                <Link href="/login">
                  <Button className="w-full font-semibold h-11" id="goto-login-btn">
                    Ir al Login
                  </Button>
                </Link>
              </div>
            )}

            {/* ── Enlace volver al login (excepto en done) ── */}
            {step !== "done" && (
              <div className="mt-6 text-center">
                <Link
                  href="/login"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  id="back-to-login-link"
                >
                  ← Volver al login
                </Link>
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
