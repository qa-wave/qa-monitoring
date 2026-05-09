import { PageHeader } from "@/components/dashboard/PageHeader";
import { getBrandSettings } from "@/lib/branding";
import { BrandingForm } from "./BrandingForm";

export const dynamic = "force-dynamic";

export default async function BrandingPage() {
  const brand = await getBrandSettings();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Vzhled"
        description="Branding produktu — jméno, jméno tenanta, primární / sekundární / třetí barva a vizuální styl. Změny se projeví okamžitě po uložení v celé aplikaci včetně veřejné status stránky."
      />
      <BrandingForm initial={brand} />
    </div>
  );
}
