import { PageHeader } from "@/components/dashboard/PageHeader";
import { getBrandSettings } from "@/lib/branding";
import { BrandingForm } from "./BrandingForm";
import { getT } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";

export default async function BrandingPage() {
  const [brand, { t }] = await Promise.all([getBrandSettings(), getT()]);

  return (
    <div className="space-y-6">
      <PageHeader
        title={t.pages.branding.title}
        description={t.pages.branding.description}
      />
      <BrandingForm initial={brand} />
    </div>
  );
}
