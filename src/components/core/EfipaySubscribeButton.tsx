"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useSession } from "@/lib/auth-client";
import { Loader2, CreditCard, User, ShieldCheck, type LucideIcon } from "lucide-react";

const IDENTIFICATION_TYPES = [
  "CC",
  "CE",
  "TI",
  "PPT",
  "DNI",
  "NIT",
  "Pasaporte",
  "Otro",
] as const;

const PAYMENT_FIELD_CLASS =
  "h-11 border-border/90 bg-card shadow-[inset_0_1px_2px_rgb(0_0_0/0.04)] transition-[border-color,box-shadow] duration-150 hover:border-foreground/30 focus-visible:border-primary focus-visible:ring-primary/25";

const PAYMENT_LABEL_CLASS = "text-xs font-semibold text-foreground/80";

interface EfipaySubscribeButtonProps {
  planKey: "pro" | "agency";
  planLabel: string;
  billingPeriod?: "monthly" | "annual";
  planPriceLabel?: string;
  planBillingNote?: string;
  onSuccess?: () => void;
}

function splitFullName(fullName: string | undefined): { name: string; lastName: string } {
  if (!fullName?.trim()) return { name: "", lastName: "" };
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return { name: parts[0], lastName: "" };
  return { name: parts[0], lastName: parts.slice(1).join(" ") };
}

function formatCardNumber(value: string): string {
  return value
    .replace(/\D/g, "")
    .slice(0, 16)
    .replace(/(\d{4})(?=\d)/g, "$1 ")
    .trim();
}

function formatExpiration(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

function expirationToEfipay(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (digits.length !== 4) return value;
  return `20${digits.slice(2)}-${digits.slice(0, 2)}`;
}

function SectionTitle({ icon: Icon, children }: { icon: LucideIcon; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <span className="flex size-6 items-center justify-center rounded-md bg-primary/10 text-primary">
        <Icon className="size-3.5" />
      </span>
      <h3 className="text-sm font-semibold tracking-tight">{children}</h3>
    </div>
  );
}

export default function EfipaySubscribeButton({
  planKey,
  planLabel,
  billingPeriod = "monthly",
  planPriceLabel,
  planBillingNote,
  onSuccess,
}: EfipaySubscribeButtonProps) {
  const { data: sessionData } = useSession();
  const user = sessionData?.user as any;
  const { toast } = useToast();

  const split = splitFullName(user?.name);

  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;

    const scrollY = window.scrollY;
    const previousBodyStyles = {
      position: document.body.style.position,
      top: document.body.style.top,
      width: document.body.style.width,
      overflow: document.body.style.overflow,
    };
    const previousRootStyles = {
      overflow: document.documentElement.style.overflow,
      overscrollBehavior: document.documentElement.style.overscrollBehavior,
    };

    document.documentElement.style.overflow = "hidden";
    document.documentElement.style.overscrollBehavior = "none";
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";
    document.body.style.overflow = "hidden";

    return () => {
      document.documentElement.style.overflow = previousRootStyles.overflow;
      document.documentElement.style.overscrollBehavior =
        previousRootStyles.overscrollBehavior;
      document.body.style.position = previousBodyStyles.position;
      document.body.style.top = previousBodyStyles.top;
      document.body.style.width = previousBodyStyles.width;
      document.body.style.overflow = previousBodyStyles.overflow;
      window.scrollTo(0, scrollY);
    };
  }, [open]);

  // Datos de facturación (suscriptor)
  const [identificationType, setIdentificationType] = useState("CC");
  const [idNumber, setIdNumber] = useState("");
  const [name, setName] = useState(split.name);
  const [lastName, setLastName] = useState(split.lastName);
  const [phoneCode, setPhoneCode] = useState("57");
  const [cellphone, setCellphone] = useState("");
  const [billingAddress, setBillingAddress] = useState("");
  const [billingCity, setBillingCity] = useState("");
  const [billingCountry, setBillingCountry] = useState("Colombia");

  // Datos de tarjeta
  const [holder, setHolder] = useState(user?.name ?? "");
  const [cardNumber, setCardNumber] = useState("");
  const [expiration, setExpiration] = useState(""); // mm/yy
  const [cvv, setCvv] = useState("");

  const handleSubmit = async () => {
    if (submitting) return;

    if (!name.trim() || !lastName.trim()) {
      toast({ title: "Faltan datos", description: "Ingresa tu nombre y apellido.", variant: "destructive" });
      return;
    }
    if (!idNumber.trim()) {
      toast({ title: "Faltan datos", description: "Ingresa tu número de documento.", variant: "destructive" });
      return;
    }
    if (!cellphone.trim()) {
      toast({ title: "Faltan datos", description: "Ingresa tu número de celular.", variant: "destructive" });
      return;
    }
    if (!billingAddress.trim() || !billingCity.trim()) {
      toast({ title: "Faltan datos", description: "Ingresa tu dirección y ciudad de facturación.", variant: "destructive" });
      return;
    }
    if (!holder.trim()) {
      toast({ title: "Faltan datos", description: "Ingresa el titular de la tarjeta.", variant: "destructive" });
      return;
    }
    const cardDigits = cardNumber.replace(/\s+/g, "");
    if (!/^\d{14,16}$/.test(cardDigits)) {
      toast({ title: "Tarjeta inválida", description: "Ingresa un número de tarjeta válido.", variant: "destructive" });
      return;
    }
    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiration)) {
      toast({ title: "Fecha inválida", description: "Ingresa el vencimiento en formato MM/AA.", variant: "destructive" });
      return;
    }
    if (!/^\d{3,4}$/.test(cvv)) {
      toast({ title: "CVV inválido", description: "Ingresa el código de seguridad de tu tarjeta.", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/efipay/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planKey,
          billingPeriod,
          subscriber: {
            identificationType,
            idNumber: idNumber.trim(),
            name: name.trim(),
            lastName: lastName.trim(),
            phoneCode: Number(phoneCode),
            cellphoneNumber: cellphone.trim(),
            billingAddress: billingAddress.trim(),
            billingCity: billingCity.trim(),
            billingCountry: billingCountry.trim(),
          },
          card: {
            holder: holder.trim(),
            number: cardDigits,
            datetime: expirationToEfipay(expiration),
            cvv: Number(cvv),
          },
        }),
      });

      const result = await res.json();
      if (res.ok && result.success) {
        toast({
          title: "¡Suscripción Activada!",
          description: `Tu plan ${planLabel} está activo. ¡Disfruta de las funciones premium!`,
        });
        setOpen(false);
        onSuccess?.();
      } else {
        toast({
          title: "Error",
          description: result.error || "No se pudo activar la suscripción.",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Error",
        description: "Error al procesar el pago. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full font-semibold shadow-md transition-[background-color,opacity,scale] duration-150 active:scale-[0.96]">
          <CreditCard className="mr-2 h-4 w-4" />
          Suscribirme a {planLabel}{billingPeriod === "annual" ? " (Anual)" : ""}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-hidden overscroll-none border-border/80 bg-background p-0 shadow-2xl sm:max-w-xl">
        <div
          data-lenis-prevent
          className="max-h-[calc(100dvh-2rem)] touch-pan-y overflow-y-auto overscroll-contain p-6 [-webkit-overflow-scrolling:touch]"
        >
        <DialogHeader className="text-left">
          <DialogTitle className="pr-10 text-balance">
            Suscribirte a {planLabel}
            {billingPeriod === "annual" ? " (Anual)" : " (Mensual)"}
          </DialogTitle>
          <DialogDescription className="text-pretty">
            Completa tus datos de facturación y de tarjeta para activar el plan.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <section className="space-y-3">
            <SectionTitle icon={User}>Datos de facturación</SectionTitle>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="name" className={PAYMENT_LABEL_CLASS}>Nombre</Label>
                <Input id="name" autoComplete="given-name" className={PAYMENT_FIELD_CLASS} value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lastname" className={PAYMENT_LABEL_CLASS}>Apellido</Label>
                <Input id="lastname" autoComplete="family-name" className={PAYMENT_FIELD_CLASS} value={lastName} onChange={(e) => setLastName(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label className={PAYMENT_LABEL_CLASS}>Tipo de documento</Label>
                <Select value={identificationType} onValueChange={setIdentificationType}>
                  <SelectTrigger className={PAYMENT_FIELD_CLASS}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {IDENTIFICATION_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="idnumber" className={PAYMENT_LABEL_CLASS}>Número de documento</Label>
                <Input id="idnumber" inputMode="numeric" className={`${PAYMENT_FIELD_CLASS} tabular-nums`} value={idNumber} onChange={(e) => setIdNumber(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phonecode" className={PAYMENT_LABEL_CLASS}>Indicativo</Label>
                <Input id="phonecode" inputMode="numeric" className={`${PAYMENT_FIELD_CLASS} tabular-nums`} value={phoneCode} onChange={(e) => setPhoneCode(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cellphone" className={PAYMENT_LABEL_CLASS}>Celular</Label>
                <Input id="cellphone" inputMode="numeric" autoComplete="tel" className={`${PAYMENT_FIELD_CLASS} tabular-nums`} value={cellphone} onChange={(e) => setCellphone(e.target.value)} />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="address" className={PAYMENT_LABEL_CLASS}>Dirección</Label>
                <Input id="address" autoComplete="street-address" className={PAYMENT_FIELD_CLASS} value={billingAddress} onChange={(e) => setBillingAddress(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="city" className={PAYMENT_LABEL_CLASS}>Ciudad</Label>
                <Input id="city" autoComplete="address-level2" className={PAYMENT_FIELD_CLASS} value={billingCity} onChange={(e) => setBillingCity(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="country" className={PAYMENT_LABEL_CLASS}>País</Label>
                <Input id="country" autoComplete="country-name" className={PAYMENT_FIELD_CLASS} value={billingCountry} onChange={(e) => setBillingCountry(e.target.value)} />
              </div>
            </div>
          </section>

          <section className="space-y-3 border-t border-border/60 pt-5">
            <SectionTitle icon={CreditCard}>Datos de la tarjeta</SectionTitle>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="holder" className={PAYMENT_LABEL_CLASS}>Titular de la tarjeta</Label>
                <Input id="holder" autoComplete="cc-name" className={PAYMENT_FIELD_CLASS} value={holder} onChange={(e) => setHolder(e.target.value)} />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="cardnumber" className={PAYMENT_LABEL_CLASS}>Número de tarjeta</Label>
                <Input
                  id="cardnumber"
                  inputMode="numeric"
                  autoComplete="cc-number"
                  placeholder="1234 5678 9012 3456"
                  className={`${PAYMENT_FIELD_CLASS} tabular-nums`}
                  value={cardNumber}
                  onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="expiration" className={PAYMENT_LABEL_CLASS}>Vencimiento</Label>
                <Input
                  id="expiration"
                  inputMode="numeric"
                  autoComplete="cc-exp"
                  placeholder="MM/AA"
                  maxLength={5}
                  className={`${PAYMENT_FIELD_CLASS} tabular-nums`}
                  value={expiration}
                  onChange={(e) => setExpiration(formatExpiration(e.target.value))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cvv" className={PAYMENT_LABEL_CLASS}>CVV</Label>
                <Input
                  id="cvv"
                  inputMode="numeric"
                  autoComplete="cc-csc"
                  placeholder="123"
                  maxLength={4}
                  className={`${PAYMENT_FIELD_CLASS} tabular-nums`}
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value.replace(/\D/g, ""))}
                />
              </div>
            </div>
          </section>

          {(planPriceLabel || planBillingNote) && (
            <div className="flex items-center justify-between gap-4 rounded-xl bg-muted/50 px-4 py-3">
              <div className="min-w-0">
                <p className="text-sm font-medium">Plan {planLabel}</p>
                {planBillingNote && <p className="text-xs text-muted-foreground">{planBillingNote}</p>}
              </div>
              {planPriceLabel && (
                <p className="text-sm font-semibold tabular-nums whitespace-nowrap">{planPriceLabel}</p>
              )}
            </div>
          )}

          <div className="space-y-3">
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full font-semibold shadow-sm transition-[background-color,opacity,scale] duration-150 active:scale-[0.96]"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Procesando...
                </>
              ) : (
                `Pagar y activar ${planLabel}`
              )}
            </Button>
            <p className="flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5" />
              Pago seguro procesado por Efipay
            </p>
          </div>
        </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
