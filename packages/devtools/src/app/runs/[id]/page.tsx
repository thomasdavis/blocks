import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { getRun } from "@/lib/runs";
import { RunDetail } from "@/components/run-detail";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@blocksai/ui/button";

export const dynamic = "force-dynamic";

interface RunPageProps {
  params: Promise<{ id: string }>;
}

export default async function RunPage({ params }: RunPageProps) {
  const { id } = await params;
  const run = await getRun(id);

  if (!run) {
    return (
      <div className="container mx-auto px-6 py-8">
        <Link href="/">
          <Button variant="ghost" className="mb-6">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
        <EmptyState
          title="Run not found"
          description={`The validation run "${id}" could not be found. It may have been deleted or never existed.`}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8">
      <Link href="/">
        <Button variant="ghost" className="mb-6">
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
      </Link>
      <RunDetail run={run} />
    </div>
  );
}
