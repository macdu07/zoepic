import type { Metadata } from "next";
import PrivacyPolicyContent from "./PrivacyPolicyContent";

export const metadata: Metadata = {
  title: "Política de Privacidad",
  description:
    "Conoce cómo ZoePic recopila, usa y protege tus datos personales.",
  alternates: { canonical: "/politica-de-privacidad" },
};

export default function PrivacyPolicyPage() {
  return <PrivacyPolicyContent />;
}
