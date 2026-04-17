import type { Metadata } from "next";
import PrivacyPolicyContent from "./PrivacyPolicyContent";

export const metadata: Metadata = {
  title: "Política de Privacidad — ZoePic",
  description:
    "Conoce cómo ZoePic recopila, usa y protege tus datos personales.",
};

export default function PrivacyPolicyPage() {
  return <PrivacyPolicyContent />;
}
