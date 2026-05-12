import { PageHeader } from "@/components/dashboard/PageHeader";
import { applications } from "@/data/applications";
import { environments } from "@/data/environments";
import { testRuns } from "@/data/test-runs";
import { ExportTestsButton } from "./ExportTestsButton";
import { TestsClient } from "./TestsClient";

export default function TestsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Testy"
        description="Matice pass/fail pro každou aplikaci, prostředí a test suite."
        actions={<ExportTestsButton data={testRuns} />}
      />
      <TestsClient
        applications={applications}
        environments={environments}
        testRuns={testRuns}
      />
    </div>
  );
}
