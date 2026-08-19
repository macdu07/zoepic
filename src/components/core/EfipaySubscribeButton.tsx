"use client";

import { useState } from "react";
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
import { Loader2, CreditCard } from "lucide-react";

const IDENTIFICATION_TYPES = ["CC", "CE", "TI", "PA", "PEP", "PPT", "NIT", "Pasaporte", "Otro"];

interface EfipaySubscribeButtonProps {
  planKey: "pro" | "agency";
  planLabel: string;
  billingPeriod?: "monthly" | "annual";
  onSuccess?: () => void;
}

function splitFullName(fullName: string | undefined): { name: string; lastName: string } {
  if (!fullName?.trim()) return { name: "", lastName: "" };
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return { name: parts[0], lastName: "" };
  return { name: parts[0], lastName: parts.slice(1).join(" ") };
}

export default function EfipaySubscribeButton({
  planKey,
  planLabel,
  billingPeriod = "monthly",
  onSuccess,
}: EfipaySubscribeButtonProps) {
  const { data: sessionData } = useSession();
  const user = sessionData?.user as any;
  const { toast } = useToast();

  const split = splitFullName(user?.name);

  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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
  const [expiration, setExpiration] = useState(""); // yyyy-mm
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
    if (!cardNumber.trim() || !holder.trim() || !expiration || !cvv.trim()) {
      toast({ title: "Faltan datos", description: "Completa todos los datos de la tarjeta.", variant: "destructive" });
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
            number: cardNumber.replace(/\s+/g, ""),
            datetime: expiration,
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
        <Button className="w-full font-semibold shadow-md">
          <CreditCard className="mr-2 h-4 w-4" />
          Suscribirme a {planLabel}{billingPeriod === "annual" ? " (Anual)" : ""}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Suscribirte a {planLabel}
            {billingPeriod === "annual" ? " (Anual)" : " (Mensual)"}
          </DialogTitle>
          <DialogDescription>
            Completa tus datos de facturación y de tarjeta para activar el plan.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <p className="text-sm font-semibold mb-2">Datos de facturación</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="name" className="text-xs">Nombre</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label htmlFor="lastname" className="text-xs">Apellido</Label>
                <Input id="lastname" value={lastName} onChange={(e) => setLastName(e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label className="text-xs">Tipo de documento</Label>
                <Select value={identificationType} onValueChange={setIdentificationType}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {IDENTIFICATION_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="idnumber" className="text-xs">Número de documento</Label>
                <Input id="idnumber" value={idNumber} onChange={(e) => setIdNumber(e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label htmlFor="phonecode" className="text-xs">Indicativo</Label>
                <Input id="phonecode" value={phoneCode} onChange={(e) => setPhoneCode(e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label htmlFor="cellphone" className="text-xs">Celular</Label>
                <Input id="cellphone" inputMode="numeric" value={cellphone} onChange={(e) => setCellphone(e.target.value)} className="mt-1" />
              </div>
              <div className="col-span-2">
                <Label htmlFor="address" className="text-xs">Dirección</Label>
                <Input id="address" value={billingAddress} onChange={(e) => setBillingAddress(e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label htmlFor="city" className="text-xs">Ciudad</Label>
                <Input id="city" value={billingCity} onChange={(e) => setBillingCity(e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label htmlFor="country" className="text-xs">País</Label>
                <Input id="country" value={billingCountry} onChange={(e) => setBillingCountry(e.target.value)} className="mt-1" />
              </div>
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold mb-2">Datos de la tarjeta</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <Label htmlFor="holder" className="text-xs">Titular de la tarjeta</Label>
                <Input id="holder" value={holder} onChange={(e) => setHolder(e.target.value)} className="mt-1" />
              </div>
              <div className="col-span-2">
                <Label htmlFor="cardnumber" className="text-xs">Número de tarjeta</Label>
                <Input id="cardnumber" inputMode="numeric" placeholder="0000 0000 0000 0000" value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label htmlFor="expiration" className="text-xs">Vencimiento</Label>
                <Input id="expiration" type="month" value={expiration} onChange={(e) => setExpiration(e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label htmlFor="cvv" className="text-xs">CVV</Label>
                <Input id="cvv" inputMode="numeric" maxLength={4} value={cvv} onChange={(e) => setCvv(e.target.value)} className="mt-1" />
              </div>
            </div>
          </div>

          <Button onClick={handleSubmit} disabled={submitting} className="w-full font-semibold">
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Procesando...
              </>
            ) : (
              `Pagar y activar ${planLabel}`
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
