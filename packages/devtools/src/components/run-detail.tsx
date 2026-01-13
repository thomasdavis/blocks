"use client";

import { useState } from "react";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Layers,
  Info,
  Zap,
  FileCode,
  Brain,
  ChevronRight,
  Sparkles,
  Activity,
  Target,
} from "lucide-react";
import { Card, CardContent } from "@blocksai/ui/card";
import { Badge } from "@blocksai/ui/badge";
import { Button } from "@blocksai/ui/button";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@blocksai/ui/accordion";
import { Tabs, TabsList, TabsTrigger, TabsPanel } from "@blocksai/ui/tabs";
import type { ValidationRunOutput, ValidatorRunResult } from "@/types";
import { formatDateTime, formatDuration } from "@/lib/utils";
import { BlockResult } from "./block-result";
import { JsonViewer } from "./json-viewer";
import { ValidatorDetailModal } from "./validator-detail-modal";

interface RunDetailProps {
  run: ValidationRunOutput;
}

export function RunDetail({ run }: RunDetailProps) {
  const [selectedValidator, setSelectedValidator] = useState<ValidatorRunResult | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const { summary, projectName, timestamp, duration, blocks, configPath } = run;
  const hasErrors = summary.failed > 0;
  const hasWarnings = summary.warnings > 0;

  const openValidatorDetails = (validator: ValidatorRunResult) => {
    setSelectedValidator(validator);
    setModalOpen(true);
  };

  // Calculate stats
  const totalValidators = blocks.reduce((sum, b) => sum + b.validators.length, 0);
  const passedValidators = blocks.reduce(
    (sum, b) => sum + b.validators.filter((v) => v.passed).length,
    0
  );
  const _totalIssues = blocks.reduce(
    (sum, b) => sum + b.validators.reduce((s, v) => s + v.issues.length, 0),
    0
  );

  return (
    <div className="space-y-8">
      {/* Hero Summary Card */}
      <div
        className={`relative overflow-hidden rounded-2xl p-8 ${
          hasErrors
            ? "bg-gradient-to-br from-red-500/10 via-red-500/5 to-transparent border border-red-500/20"
            : hasWarnings
              ? "bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20"
              : "bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/20"
        }`}
      >
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 opacity-10">
          <Sparkles className={`w-full h-full ${hasErrors ? "text-red-500" : hasWarnings ? "text-amber-500" : "text-emerald-500"}`} />
        </div>

        <div className="relative z-10">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-5">
              <div
                className={`p-4 rounded-2xl ${
                  hasErrors
                    ? "bg-red-500/20"
                    : hasWarnings
                      ? "bg-amber-500/20"
                      : "bg-emerald-500/20"
                }`}
              >
                {hasErrors ? (
                  <XCircle className="h-10 w-10 text-red-500" />
                ) : hasWarnings ? (
                  <AlertTriangle className="h-10 w-10 text-amber-500" />
                ) : (
                  <CheckCircle className="h-10 w-10 text-emerald-500" />
                )}
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">{projectName}</h1>
                <p className="text-sm text-[var(--ui-foreground-muted)] mt-1 flex items-center gap-2">
                  <FileCode className="h-4 w-4" />
                  {configPath}
                </p>
              </div>
            </div>
            <Badge
              variant={hasErrors ? "destructive" : hasWarnings ? "warning" : "success"}
              size="lg"
              className="text-base px-4 py-2"
            >
              {hasErrors ? "Failed" : hasWarnings ? "Warnings" : "All Passed"}
            </Badge>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8">
            <StatCard
              icon={<Clock className="h-5 w-5" />}
              label="Run Time"
              value={formatDateTime(timestamp)}
              color="blue"
            />
            <StatCard
              icon={<Zap className="h-5 w-5" />}
              label="Duration"
              value={formatDuration(duration)}
              color="purple"
            />
            <StatCard
              icon={<Layers className="h-5 w-5" />}
              label="Blocks"
              value={`${summary.passed}/${summary.totalBlocks}`}
              color="emerald"
            />
            <StatCard
              icon={<Activity className="h-5 w-5" />}
              label="Validators"
              value={`${passedValidators}/${totalValidators}`}
              color="amber"
            />
          </div>
        </div>
      </div>

      {/* Block Results */}
      <Card className="border-0 shadow-xl shadow-black/5">
        <CardContent className="p-0">
          <Tabs defaultValue="results">
            <div className="border-b border-[var(--ui-border)] px-6 pt-4">
              <TabsList className="gap-1">
                <TabsTrigger value="results" className="gap-2">
                  <Target className="h-4 w-4" />
                  Block Results
                </TabsTrigger>
                <TabsTrigger value="raw" className="gap-2">
                  <FileCode className="h-4 w-4" />
                  Raw JSON
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsPanel value="results" className="p-6">
              <Accordion className="space-y-3">
                {blocks.map((block) => (
                  <AccordionItem
                    key={block.blockName}
                    value={block.blockName}
                    className="border border-[var(--ui-border)] rounded-xl overflow-hidden hover:border-[var(--ui-border-hover)] transition-colors"
                  >
                    <AccordionTrigger className="px-5 py-4 hover:bg-[var(--ui-background-muted)]/50">
                      <BlockResult block={block} />
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="border-t border-[var(--ui-border)] bg-[var(--ui-background-muted)]/30">
                        {/* Validators List */}
                        <div className="divide-y divide-[var(--ui-border)]">
                          {block.validators.map((validator) => (
                            <ValidatorRow
                              key={validator.id}
                              validator={validator}
                              onShowDetails={() => openValidatorDetails(validator)}
                            />
                          ))}
                        </div>

                        {/* Issues Section */}
                        {block.validators.some((v) => v.issues.length > 0) && (
                          <div className="p-5 border-t border-[var(--ui-border)] bg-red-500/5">
                            <h4 className="text-sm font-semibold flex items-center gap-2 mb-3">
                              <AlertTriangle className="h-4 w-4 text-red-500" />
                              Issues Found
                            </h4>
                            <div className="space-y-2">
                              {block.validators.flatMap((v) =>
                                v.issues.map((issue, i) => (
                                  <div
                                    key={`${v.id}-${i}`}
                                    className="rounded-lg bg-[var(--ui-background)] p-4 border border-[var(--ui-border)]"
                                  >
                                    <div className="flex items-start gap-3">
                                      <Badge
                                        variant={
                                          issue.type === "error"
                                            ? "destructive"
                                            : issue.type === "warning"
                                              ? "warning"
                                              : "info"
                                        }
                                        size="sm"
                                      >
                                        {issue.type}
                                      </Badge>
                                      <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium">{issue.message}</p>
                                        {issue.file && (
                                          <p className="text-xs text-[var(--ui-foreground-muted)] mt-1 font-mono">
                                            📄 {issue.file}
                                            {issue.line && `:${issue.line}`}
                                          </p>
                                        )}
                                        {issue.suggestion && (
                                          <p className="text-xs text-blue-500 mt-2 flex items-center gap-1">
                                            <ChevronRight className="h-3 w-3" />
                                            {issue.suggestion}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                ))
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </TabsPanel>

            <TabsPanel value="raw" className="p-6">
              <div className="rounded-xl overflow-hidden border border-[var(--ui-border)]">
                <div className="bg-[var(--ui-background-muted)] px-4 py-2 border-b border-[var(--ui-border)] flex items-center justify-between">
                  <span className="text-xs font-medium text-[var(--ui-foreground-muted)]">
                    validation-run.json
                  </span>
                  <span className="text-xs text-[var(--ui-foreground-muted)]">
                    {JSON.stringify(run).length.toLocaleString()} bytes
                  </span>
                </div>
                <JsonViewer data={run} collapsed={true} maxHeight="600px" />
              </div>
            </TabsPanel>
          </Tabs>
        </CardContent>
      </Card>

      {/* Validator Detail Modal */}
      {selectedValidator && (
        <ValidatorDetailModal
          validator={selectedValidator}
          open={modalOpen}
          onOpenChange={setModalOpen}
        />
      )}
    </div>
  );
}

// Stat Card Component
function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: "blue" | "purple" | "emerald" | "amber";
}) {
  const colorClasses = {
    blue: "bg-blue-500/10 text-blue-500",
    purple: "bg-purple-500/10 text-purple-500",
    emerald: "bg-emerald-500/10 text-emerald-500",
    amber: "bg-amber-500/10 text-amber-500",
  };

  return (
    <div className="flex items-center gap-3 p-4 rounded-xl bg-[var(--ui-background)]/60 backdrop-blur-sm border border-[var(--ui-border)]">
      <div className={`p-2 rounded-lg ${colorClasses[color]}`}>{icon}</div>
      <div>
        <p className="text-xs text-[var(--ui-foreground-muted)] uppercase tracking-wide">{label}</p>
        <p className="font-semibold mt-0.5">{value}</p>
      </div>
    </div>
  );
}

// Validator Row Component
function ValidatorRow({
  validator,
  onShowDetails,
}: {
  validator: ValidatorRunResult;
  onShowDetails: () => void;
}) {
  const hasMetadata = validator.context || validator.ai;

  return (
    <div className="px-5 py-4 hover:bg-[var(--ui-background-muted)]/50 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`p-1.5 rounded-lg ${
              validator.passed ? "bg-emerald-500/10" : "bg-red-500/10"
            }`}
          >
            {validator.passed ? (
              <CheckCircle className="h-4 w-4 text-emerald-500" />
            ) : (
              <XCircle className="h-4 w-4 text-red-500" />
            )}
          </div>
          <div>
            <span className="font-medium">{validator.label}</span>
            {validator.ai?.model && (
              <span className="ml-2 text-xs text-[var(--ui-foreground-muted)] bg-[var(--ui-background-muted)] px-2 py-0.5 rounded-full">
                <Brain className="h-3 w-3 inline mr-1" />
                {validator.ai.model}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-[var(--ui-foreground-muted)] font-mono">
            {formatDuration(validator.duration)}
          </span>
          {validator.issues.length > 0 && (
            <Badge variant="destructive" size="sm">
              {validator.issues.length} issue{validator.issues.length !== 1 ? "s" : ""}
            </Badge>
          )}
          {hasMetadata && (
            <Button variant="ghost" size="sm" onClick={onShowDetails} className="gap-1">
              <Info className="h-4 w-4" />
              Details
            </Button>
          )}
        </div>
      </div>

      {/* Summary Preview */}
      {validator.context?.summary && (
        <p className="text-sm text-[var(--ui-foreground-muted)] mt-2 ml-10 line-clamp-2">
          {validator.context.summary}
        </p>
      )}

      {/* Quick Stats Row */}
      {hasMetadata && (
        <div className="flex items-center gap-4 mt-3 ml-10 text-xs text-[var(--ui-foreground-muted)]">
          {validator.context?.filesAnalyzed && (
            <span className="flex items-center gap-1">
              <FileCode className="h-3 w-3" />
              {validator.context.filesAnalyzed.length} files
            </span>
          )}
          {validator.context?.rulesApplied && (
            <span className="flex items-center gap-1">
              <Target className="h-3 w-3" />
              {validator.context.rulesApplied.length} rules
            </span>
          )}
          {validator.ai?.tokensUsed && (
            <span className="flex items-center gap-1">
              <Zap className="h-3 w-3" />
              {(validator.ai.tokensUsed.input + validator.ai.tokensUsed.output).toLocaleString()} tokens
            </span>
          )}
        </div>
      )}
    </div>
  );
}
