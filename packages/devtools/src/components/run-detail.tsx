"use client";

import { useState } from "react";
import { CheckCircle, XCircle, AlertTriangle, Clock, Layers, Info } from "lucide-react";
import { Card, CardContent, CardHeader } from "@blocksai/ui/card";
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

  const statusText = hasErrors
    ? "Failed"
    : hasWarnings
      ? "Warnings"
      : "Passed";

  const openValidatorDetails = (validator: ValidatorRunResult) => {
    setSelectedValidator(validator);
    setModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Summary header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <StatusIcon className={`h-8 w-8 ${statusColor}`} />
              <div>
                <h1 className="text-2xl font-bold">{projectName}</h1>
                <p className="text-sm text-[var(--ui-foreground-muted)]">
                  {configPath}
                </p>
              </div>
            </div>
            <Badge
              variant={hasErrors ? "destructive" : hasWarnings ? "warning" : "success"}
              size="lg"
            >
              {statusText}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-6">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-[var(--ui-foreground-muted)]" />
              <div>
                <p className="text-sm text-[var(--ui-foreground-muted)]">Run time</p>
                <p className="font-medium">{formatDateTime(timestamp)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-[var(--ui-foreground-muted)]" />
              <div>
                <p className="text-sm text-[var(--ui-foreground-muted)]">Duration</p>
                <p className="font-medium">{formatDuration(duration)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Layers className="h-5 w-5 text-[var(--ui-foreground-muted)]" />
              <div>
                <p className="text-sm text-[var(--ui-foreground-muted)]">Blocks</p>
                <p className="font-medium">
                  {summary.passed}/{summary.totalBlocks} passed
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Block results with tabs */}
      <Card>
        <CardContent className="pt-6">
          <Tabs defaultValue="results">
            <TabsList>
              <TabsTrigger value="results">Block Results</TabsTrigger>
              <TabsTrigger value="raw">Raw JSON</TabsTrigger>
            </TabsList>

            <TabsPanel value="results">
              <Accordion>
                {blocks.map((block) => (
                  <AccordionItem key={block.blockName} value={block.blockName}>
                    <AccordionTrigger>
                      <BlockResult block={block} />
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3 pl-8">
                        {block.validators.map((validator) => (
                          <div
                            key={validator.id}
                            className="border-l-2 border-[var(--ui-border)] pl-4 py-2"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-2">
                                {validator.passed ? (
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                ) : (
                                  <XCircle className="h-4 w-4 text-red-500" />
                                )}
                                <span className="font-medium">{validator.label}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-[var(--ui-foreground-muted)]">
                                  {formatDuration(validator.duration)}
                                </span>
                                {(validator.context || validator.ai) && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => openValidatorDetails(validator)}
                                  >
                                    <Info className="h-4 w-4" />
                                    <span className="ml-1">Details</span>
                                  </Button>
                                )}
                              </div>
                            </div>
                            {/* Show summary if available */}
                            {validator.context?.summary && (
                              <p className="text-sm text-[var(--ui-foreground-muted)] mt-2 ml-6">
                                {validator.context.summary}
                              </p>
                            )}
                          </div>
                        ))}
                        {block.validators.some((v) => v.issues.length > 0) && (
                          <div className="mt-4 space-y-2">
                            <h4 className="text-sm font-semibold">Issues</h4>
                            {block.validators.flatMap((v) =>
                              v.issues.map((issue, i) => (
                                <div
                                  key={`${v.id}-${i}`}
                                  className="rounded-lg bg-[var(--ui-background-muted)] p-3"
                                >
                                  <div className="flex items-start gap-2">
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
                                    <div>
                                      <p className="text-sm">{issue.message}</p>
                                      {issue.file && (
                                        <p className="text-xs text-[var(--ui-foreground-muted)] mt-1">
                                          {issue.file}
                                          {issue.line && `:${issue.line}`}
                                        </p>
                                      )}
                                      {issue.suggestion && (
                                        <p className="text-xs text-[var(--ui-foreground-muted)] mt-1 italic">
                                          {issue.suggestion}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </TabsPanel>

            <TabsPanel value="raw">
              <JsonViewer data={run} collapsed={true} maxHeight="600px" />
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
