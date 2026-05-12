import { PageHeader } from "@/components/dashboard/PageHeader";
import { incidents } from "@/data/incidents";
import { ExportIncidentsButton } from "./ExportIncidentsButton";
import { getT } from "@/lib/i18n/server";
import { IncidentsClient } from "./IncidentsClient";

export default async function IncidentsPage() {
  const { t } = await getT();
  return (
    <div className="space-y-6">
      <PageHeader title={t.pages.incidents.title} description={t.pages.incidents.description} actions={<ExportIncidentsButton data={incidents} />} />
      <IncidentsClient incidents={incidents} />
    </div>
  );
}
