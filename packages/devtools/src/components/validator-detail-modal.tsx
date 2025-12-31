"use client";

import { useState } from "react";
import {
  FileCode,
  BookOpen,
  Brain,
  Clock,
  Copy,
  Check,
  ChevronDown,
  ChevronRight,
  Zap,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Target,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogCloseButton,
} from "@blocksai/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsPanel } from "@blocksai/ui/tabs";
import { Badge } from "@blocksai/ui/badge";
import { Button } from "@blocksai/ui/button";
import type { ValidatorRunResult } from "@/types";
import { formatDuration } from "@/lib/utils";
import { JsonViewer } from "./json-viewer";

interface ValidatorDetailModalProps {
  validator: ValidatorRunResult;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ValidatorDetailModal({
  validator,
  open,
  onOpenChange,
}: ValidatorDetailModalProps) {
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [copiedResponse, setCopiedResponse] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    summary: true,
    input: true,
    output: true,
    files: false,
    rules: false,
    prompt: false,
    response: false,
  });

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const copyToClipboard = async (text: string, setter: (val: boolean) => void) => {
    await navigator.clipboard.writeText(text);
    setter(true);
    setTimeout(() => setter(false), 2000);
  };

  const hasAIData = !!validator.ai;
  const hasContext = !!validator.context;

  // Extract input/output from context if available
  const inputData = (validator.context as any)?.input;
  const outputData = (validator.context as any)?.output;

  return (
    <Dialog open={open} onOpenChange={onOpenChange} dismissible={false}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Enhanced Header */}
        <DialogHeader className="pb-4 border-b border-[var(--ui-border)]">
          <div className="flex items-center justify-between pr-10">
            <div className="flex items-center gap-4">
              {/* Status icon with gradient */}
              <div
                className={`p-3 rounded-xl ${
                  validator.passed
                    ? "bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 border border-emerald-500/30"
                    : "bg-gradient-to-br from-red-500/20 to-red-500/5 border border-red-500/30"
                }`}
              >
                {validator.passed ? (
                  <CheckCircle className="h-6 w-6 text-emerald-500" />
                ) : (
                  <XCircle className="h-6 w-6 text-red-500" />
                )}
              </div>
              <div>
                <DialogTitle className="text-xl font-bold tracking-tight">
                  {validator.label}
                </DialogTitle>
                <p className="text-sm text-[var(--ui-foreground-muted)] mt-0.5 font-mono">
                  {validator.id}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {/* Stats badges */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--ui-background-muted)] border border-[var(--ui-border)]">
                <Clock className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium">{formatDuration(validator.duration)}</span>
              </div>
              {validator.ai?.model && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20">
                  <Brain className="h-4 w-4 text-purple-500" />
                  <span className="text-sm font-medium text-purple-600">{validator.ai.model}</span>
                </div>
              )}
              <Badge
                variant={validator.passed ? "success" : "destructive"}
                size="lg"
                className="px-4"
              >
                {validator.passed ? "Passed" : "Failed"}
              </Badge>
            </div>
          </div>
          <DialogCloseButton />
        </DialogHeader>

        <Tabs defaultValue="details" className="flex-1 overflow-hidden flex flex-col mt-4">
          <TabsList className="gap-1">
            <TabsTrigger value="details" className="gap-2">
              <Sparkles className="h-4 w-4" />
              Details
            </TabsTrigger>
            <TabsTrigger value="artifacts" className="gap-2">
              <ArrowRight className="h-4 w-4" />
              Artifacts
            </TabsTrigger>
            <TabsTrigger value="ai" className="gap-2">
              <Brain className="h-4 w-4" />
              AI Context
            </TabsTrigger>
            <TabsTrigger value="raw" className="gap-2">
              <FileCode className="h-4 w-4" />
              Raw JSON
            </TabsTrigger>
          </TabsList>

          {/* Details Tab */}
          <TabsPanel value="details" className="flex-1 overflow-auto p-1">
            <div className="space-y-4">
              {/* Summary Section */}
              {hasContext && validator.context?.summary && (
                <CollapsibleSection
                  title="Summary"
                  icon={<BookOpen className="h-4 w-4" />}
                  expanded={expandedSections.summary}
                  onToggle={() => toggleSection("summary")}
                  variant="success"
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {validator.context.summary}
                  </p>
                </CollapsibleSection>
              )}

              {/* Files Analyzed */}
              {hasContext && validator.context?.filesAnalyzed && validator.context.filesAnalyzed.length > 0 && (
                <CollapsibleSection
                  title={`Files Analyzed (${validator.context.filesAnalyzed.length})`}
                  icon={<FileCode className="h-4 w-4" />}
                  expanded={expandedSections.files}
                  onToggle={() => toggleSection("files")}
                  variant="blue"
                >
                  <div className="grid grid-cols-2 gap-2">
                    {validator.context.filesAnalyzed.map((file) => (
                      <div
                        key={file}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--ui-background)] border border-[var(--ui-border)] font-mono text-xs"
                      >
                        <FileCode className="h-3 w-3 text-blue-500 flex-shrink-0" />
                        <span className="truncate">{file}</span>
                      </div>
                    ))}
                  </div>
                </CollapsibleSection>
              )}

              {/* Domain Rules Applied */}
              {hasContext && validator.context?.rulesApplied && validator.context.rulesApplied.length > 0 && (
                <CollapsibleSection
                  title={`Domain Rules Applied (${validator.context.rulesApplied.length})`}
                  icon={<Target className="h-4 w-4" />}
                  expanded={expandedSections.rules}
                  onToggle={() => toggleSection("rules")}
                  variant="amber"
                >
                  <div className="flex flex-wrap gap-2">
                    {validator.context.rulesApplied.map((rule) => (
                      <span
                        key={rule}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs font-medium"
                      >
                        <Target className="h-3 w-3 text-amber-500" />
                        {rule}
                      </span>
                    ))}
                  </div>
                </CollapsibleSection>
              )}

              {/* Issues */}
              {validator.issues.length > 0 && (
                <div className="rounded-xl border border-red-500/20 overflow-hidden">
                  <div className="flex items-center gap-2 px-4 py-3 bg-red-500/10 border-b border-red-500/20">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                    <span className="font-semibold text-sm">
                      Issues ({validator.issues.length})
                    </span>
                  </div>
                  <div className="p-4 space-y-3">
                    {validator.issues.map((issue, i) => (
                      <div
                        key={i}
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
                                {issue.file}
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
                    ))}
                  </div>
                </div>
              )}

              {/* No data message */}
              {!hasContext && !hasAIData && validator.issues.length === 0 && (
                <div className="text-center py-12 text-[var(--ui-foreground-muted)]">
                  <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-30" />
                  <p className="text-lg font-medium">No additional details available</p>
                  <p className="text-sm mt-1">This validator ran without generating extra context.</p>
                </div>
              )}
            </div>
          </TabsPanel>

          {/* Artifacts Tab - Input/Output */}
          <TabsPanel value="artifacts" className="flex-1 overflow-auto p-1">
            <div className="grid grid-cols-2 gap-4 h-full">
              {/* Input Artifact */}
              <div className="rounded-xl border border-[var(--ui-border)] overflow-hidden flex flex-col">
                <div className="flex items-center gap-2 px-4 py-3 bg-blue-500/10 border-b border-blue-500/20">
                  <ArrowRight className="h-4 w-4 text-blue-500" />
                  <span className="font-semibold text-sm">Input</span>
                </div>
                <div className="flex-1 overflow-auto">
                  {inputData ? (
                    <JsonViewer data={inputData} collapsed={false} maxHeight="500px" />
                  ) : (
                    <div className="p-8 text-center text-[var(--ui-foreground-muted)]">
                      <ArrowRight className="h-8 w-8 mx-auto mb-3 opacity-30" />
                      <p className="text-sm">No input data captured</p>
                      <p className="text-xs mt-1 opacity-70">
                        Validator did not record input artifacts
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Output Artifact */}
              <div className="rounded-xl border border-[var(--ui-border)] overflow-hidden flex flex-col">
                <div className="flex items-center gap-2 px-4 py-3 bg-emerald-500/10 border-b border-emerald-500/20">
                  <ArrowLeft className="h-4 w-4 text-emerald-500" />
                  <span className="font-semibold text-sm">Output</span>
                </div>
                <div className="flex-1 overflow-auto">
                  {outputData ? (
                    <JsonViewer data={outputData} collapsed={false} maxHeight="500px" />
                  ) : (
                    <div className="p-8 text-center text-[var(--ui-foreground-muted)]">
                      <ArrowLeft className="h-8 w-8 mx-auto mb-3 opacity-30" />
                      <p className="text-sm">No output data captured</p>
                      <p className="text-xs mt-1 opacity-70">
                        Validator did not record output artifacts
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </TabsPanel>

          {/* AI Context Tab */}
          <TabsPanel value="ai" className="flex-1 overflow-auto p-1">
            {hasAIData ? (
              <div className="space-y-4">
                {/* Token Usage Card */}
                {validator.ai?.tokensUsed && (
                  <div className="rounded-xl border border-purple-500/20 overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 bg-purple-500/10">
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-purple-500" />
                        <span className="font-semibold text-sm">Token Usage</span>
                      </div>
                      <div className="flex items-center gap-6 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-[var(--ui-foreground-muted)]">Input:</span>
                          <span className="font-mono font-bold">{validator.ai.tokensUsed.input.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[var(--ui-foreground-muted)]">Output:</span>
                          <span className="font-mono font-bold">{validator.ai.tokensUsed.output.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20">
                          <span className="text-[var(--ui-foreground-muted)]">Total:</span>
                          <span className="font-mono font-bold text-purple-600">
                            {(validator.ai.tokensUsed.input + validator.ai.tokensUsed.output).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* AI Prompt */}
                {validator.ai?.prompt && (
                  <CollapsibleSection
                    title="AI Prompt"
                    icon={<Brain className="h-4 w-4" />}
                    expanded={expandedSections.prompt}
                    onToggle={() => toggleSection("prompt")}
                    variant="purple"
                    action={
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          copyToClipboard(validator.ai!.prompt!, setCopiedPrompt);
                        }}
                        className="gap-1.5"
                      >
                        {copiedPrompt ? (
                          <>
                            <Check className="h-4 w-4 text-emerald-500" />
                            <span className="text-emerald-500">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4" />
                            <span>Copy</span>
                          </>
                        )}
                      </Button>
                    }
                  >
                    <pre className="text-xs font-mono bg-slate-900 text-slate-100 p-4 rounded-lg overflow-auto max-h-80 whitespace-pre-wrap">
                      {validator.ai.prompt}
                    </pre>
                  </CollapsibleSection>
                )}

                {/* AI Response */}
                {validator.ai?.response && (
                  <CollapsibleSection
                    title="AI Response"
                    icon={<Sparkles className="h-4 w-4" />}
                    expanded={expandedSections.response}
                    onToggle={() => toggleSection("response")}
                    variant="emerald"
                    action={
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          copyToClipboard(validator.ai!.response!, setCopiedResponse);
                        }}
                        className="gap-1.5"
                      >
                        {copiedResponse ? (
                          <>
                            <Check className="h-4 w-4 text-emerald-500" />
                            <span className="text-emerald-500">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4" />
                            <span>Copy</span>
                          </>
                        )}
                      </Button>
                    }
                  >
                    <pre className="text-xs font-mono bg-slate-900 text-slate-100 p-4 rounded-lg overflow-auto max-h-80 whitespace-pre-wrap">
                      {validator.ai.response}
                    </pre>
                  </CollapsibleSection>
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-[var(--ui-foreground-muted)]">
                <Brain className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p className="text-lg font-medium">No AI context available</p>
                <p className="text-sm mt-1">This validator did not use AI for analysis.</p>
              </div>
            )}
          </TabsPanel>

          {/* Raw JSON Tab */}
          <TabsPanel value="raw" className="flex-1 overflow-auto p-1">
            <div className="rounded-xl overflow-hidden border border-[var(--ui-border)]">
              <div className="bg-[var(--ui-background-muted)] px-4 py-2 border-b border-[var(--ui-border)] flex items-center justify-between">
                <span className="text-xs font-medium text-[var(--ui-foreground-muted)] font-mono">
                  validator-result.json
                </span>
                <span className="text-xs text-[var(--ui-foreground-muted)]">
                  {JSON.stringify(validator).length.toLocaleString()} bytes
                </span>
              </div>
              <JsonViewer data={validator} collapsed={false} maxHeight="600px" />
            </div>
          </TabsPanel>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

interface CollapsibleSectionProps {
  title: string;
  icon: React.ReactNode;
  expanded: boolean;
  onToggle: () => void;
  action?: React.ReactNode;
  variant?: "default" | "success" | "blue" | "amber" | "purple" | "emerald";
  children: React.ReactNode;
}

function CollapsibleSection({
  title,
  icon,
  expanded,
  onToggle,
  action,
  variant = "default",
  children,
}: CollapsibleSectionProps) {
  const variantStyles = {
    default: {
      border: "border-[var(--ui-border)]",
      header: "bg-[var(--ui-background-muted)]",
      icon: "text-[var(--ui-foreground-muted)]",
    },
    success: {
      border: "border-emerald-500/20",
      header: "bg-emerald-500/5",
      icon: "text-emerald-500",
    },
    blue: {
      border: "border-blue-500/20",
      header: "bg-blue-500/5",
      icon: "text-blue-500",
    },
    amber: {
      border: "border-amber-500/20",
      header: "bg-amber-500/5",
      icon: "text-amber-500",
    },
    purple: {
      border: "border-purple-500/20",
      header: "bg-purple-500/5",
      icon: "text-purple-500",
    },
    emerald: {
      border: "border-emerald-500/20",
      header: "bg-emerald-500/5",
      icon: "text-emerald-500",
    },
  };

  const styles = variantStyles[variant];

  return (
    <div className={`border ${styles.border} rounded-xl overflow-hidden`}>
      <button
        onClick={onToggle}
        className={`w-full flex items-center justify-between p-4 ${styles.header} hover:brightness-95 transition-all`}
      >
        <div className="flex items-center gap-3 text-sm font-semibold">
          {expanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
          <span className={styles.icon}>{icon}</span>
          {title}
        </div>
        {action}
      </button>
      {expanded && (
        <div className="p-4 bg-[var(--ui-background)] border-t border-[var(--ui-border)]/50">
          {children}
        </div>
      )}
    </div>
  );
}
