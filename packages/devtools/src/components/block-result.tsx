import { CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { Badge } from "@blocksai/ui/badge";
import type { BlockRunResult } from "@/types";
import { formatDuration } from "@/lib/utils";

interface BlockResultProps {
  block: BlockRunResult;
}

export function BlockResult({ block }: BlockResultProps) {
  const { blockName, hasErrors, hasWarnings, validators } = block;

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

  const totalDuration = validators.reduce((sum, v) => sum + v.duration, 0);
  const passedValidators = validators.filter((v) => v.passed).length;
  const issueCount = validators.reduce((sum, v) => sum + v.issues.length, 0);

  return (
    <div className="flex items-center justify-between w-full pr-4">
      <div className="flex items-center gap-3">
        <StatusIcon className={`h-5 w-5 ${statusColor}`} />
        <span className="font-medium">{blockName}</span>
      </div>
      <div className="flex items-center gap-4">
        {issueCount > 0 && (
          <Badge
            variant={hasErrors ? "destructive" : "warning"}
            size="sm"
          >
            {issueCount} issue{issueCount !== 1 ? "s" : ""}
          </Badge>
        )}
        <span className="text-sm text-[var(--ui-foreground-muted)]">
          {passedValidators}/{validators.length} validators
        </span>
        <span className="text-sm text-[var(--ui-foreground-muted)]">
          {formatDuration(totalDuration)}
        </span>
      </div>
    </div>
  );
}
