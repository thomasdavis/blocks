import { CheckCircle, XCircle, AlertTriangle, Clock, Zap, Activity, Hash } from "lucide-react";
import { Badge } from "@blocksai/ui/badge";
import type { BlockRunResult } from "@/types";
import { formatDuration } from "@/lib/utils";

interface BlockResultProps {
  block: BlockRunResult;
}

export function BlockResult({ block }: BlockResultProps) {
  const { blockName, hasErrors, hasWarnings, validators } = block;

  const totalDuration = validators.reduce((sum, v) => sum + v.duration, 0);
  const passedValidators = validators.filter((v) => v.passed).length;
  const issueCount = validators.reduce((sum, v) => sum + v.issues.length, 0);
  const aiValidators = validators.filter((v) => v.ai?.model);
  const totalTokens = validators.reduce((sum, v) =>
    sum + (v.ai?.tokensUsed ? v.ai.tokensUsed.input + v.ai.tokensUsed.output : 0), 0
  );

  // Status styling
  const statusConfig = hasErrors
    ? {
        bgColor: "bg-gradient-to-r from-red-500/20 to-red-500/5",
        borderColor: "border-red-500/30",
        iconColor: "text-red-500",
        Icon: XCircle,
      }
    : hasWarnings
      ? {
          bgColor: "bg-gradient-to-r from-amber-500/20 to-amber-500/5",
          borderColor: "border-amber-500/30",
          iconColor: "text-amber-500",
          Icon: AlertTriangle,
        }
      : {
          bgColor: "bg-gradient-to-r from-emerald-500/20 to-emerald-500/5",
          borderColor: "border-emerald-500/30",
          iconColor: "text-emerald-500",
          Icon: CheckCircle,
        };

  const { Icon, iconColor, bgColor, borderColor } = statusConfig;

  return (
    <div className="flex items-center justify-between w-full pr-4">
      <div className="flex items-center gap-4">
        {/* Status Icon with gradient background */}
        <div className={`p-2.5 rounded-xl ${bgColor} border ${borderColor}`}>
          <Icon className={`h-5 w-5 ${iconColor}`} />
        </div>

        {/* Block name and path */}
        <div className="flex flex-col">
          <span className="font-semibold text-base tracking-tight">{blockName}</span>
          <span className="text-xs text-[var(--ui-foreground-muted)] font-mono">
            {block.blockPath.split('/').slice(-2).join('/')}
          </span>
        </div>
      </div>

      {/* Stats and badges */}
      <div className="flex items-center gap-5">
        {/* Issue badge */}
        {issueCount > 0 && (
          <Badge
            variant={hasErrors ? "destructive" : "warning"}
            size="sm"
            className="gap-1.5 px-3"
          >
            <AlertTriangle className="h-3 w-3" />
            {issueCount} issue{issueCount !== 1 ? "s" : ""}
          </Badge>
        )}

        {/* Validators stat */}
        <div className="flex items-center gap-1.5 text-sm">
          <div className="p-1 rounded-md bg-blue-500/10">
            <Activity className="h-3.5 w-3.5 text-blue-500" />
          </div>
          <span className="text-[var(--ui-foreground-muted)]">
            <span className="font-medium text-[var(--ui-foreground)]">{passedValidators}</span>
            /{validators.length}
          </span>
        </div>

        {/* AI validators indicator */}
        {aiValidators.length > 0 && (
          <div className="flex items-center gap-1.5 text-sm">
            <div className="p-1 rounded-md bg-purple-500/10">
              <Zap className="h-3.5 w-3.5 text-purple-500" />
            </div>
            <span className="text-[var(--ui-foreground-muted)]">
              {aiValidators.length} AI
            </span>
          </div>
        )}

        {/* Token usage */}
        {totalTokens > 0 && (
          <div className="flex items-center gap-1.5 text-sm">
            <div className="p-1 rounded-md bg-amber-500/10">
              <Hash className="h-3.5 w-3.5 text-amber-500" />
            </div>
            <span className="text-[var(--ui-foreground-muted)] font-mono text-xs">
              {(totalTokens / 1000).toFixed(1)}k
            </span>
          </div>
        )}

        {/* Duration */}
        <div className="flex items-center gap-1.5 text-sm min-w-[65px] justify-end">
          <Clock className="h-3.5 w-3.5 text-[var(--ui-foreground-muted)]" />
          <span className="text-[var(--ui-foreground-muted)] font-mono text-xs">
            {formatDuration(totalDuration)}
          </span>
        </div>
      </div>
    </div>
  );
}
