import Link from "next/link";
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@blocksai/ui/card";
import { Badge } from "@blocksai/ui/badge";
import type { ValidationRunOutput } from "@/types";
import { formatRelativeTime, formatDuration } from "@/lib/utils";

interface RunCardProps {
  run: ValidationRunOutput;
}

export function RunCard({ run }: RunCardProps) {
  const { summary, projectName, timestamp, duration, blocks, id } = run;
  const hasErrors = summary.failed > 0;
  const hasWarnings = summary.warnings > 0;

  const StatusIcon = hasErrors
    ? XCircle
    : hasWarnings
      ? AlertTriangle
      : CheckCircle;

  const statusColor = hasErrors
    ? "text-red-500"
    : hasWarnings
      ? "text-amber-500"
      : "text-green-500";

  const blockNames = blocks
    .map((b) => b.blockName)
    .slice(0, 3)
    .join(", ");
  const moreBlocks = blocks.length > 3 ? `, +${blocks.length - 3} more` : "";

  return (
    <Link href={`/runs/${id}`}>
      <Card hover className="cursor-pointer">
        <CardContent className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <StatusIcon className={`h-6 w-6 mt-0.5 ${statusColor}`} />
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{projectName}</span>
                  <span className="text-sm text-[var(--ui-foreground-muted)]">
                    {formatRelativeTime(timestamp)}
                  </span>
                </div>
                <p className="text-sm text-[var(--ui-foreground-muted)]">
                  {blockNames}
                  {moreBlocks}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge
                variant={hasErrors ? "destructive" : hasWarnings ? "warning" : "success"}
              >
                {summary.passed}/{summary.totalBlocks}
              </Badge>
              <span className="text-sm text-[var(--ui-foreground-muted)]">
                {formatDuration(duration)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
