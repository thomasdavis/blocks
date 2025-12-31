"use client";

import { useState } from "react";
import { X, FileCode, BookOpen, Brain, Clock, Copy, Check, ChevronDown, ChevronRight } from "lucide-react";
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between pr-8">
            <div className="flex items-center gap-3">
              <DialogTitle>{validator.label}</DialogTitle>
              <Badge
                variant={validator.passed ? "success" : "destructive"}
                size="sm"
              >
                {validator.passed ? "Passed" : "Failed"}
              </Badge>
            </div>
            <div className="flex items-center gap-4 text-sm text-slate-500">
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {formatDuration(validator.duration)}
              </span>
              {validator.ai?.model && (
                <span className="flex items-center gap-1">
                  <Brain className="h-4 w-4" />
                  {validator.ai.model}
                </span>
              )}
            </div>
          </div>
          <DialogCloseButton />
        </DialogHeader>

        <Tabs defaultValue="details" className="flex-1 overflow-hidden flex flex-col">
          <TabsList>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="raw">Raw JSON</TabsTrigger>
          </TabsList>

          <TabsPanel value="details" className="flex-1 overflow-auto">
            <div className="space-y-4">
              {/* Summary Section */}
              {hasContext && validator.context?.summary && (
                <CollapsibleSection
                  title="Summary"
                  icon={<BookOpen className="h-4 w-4" />}
                  expanded={expandedSections.summary}
                  onToggle={() => toggleSection("summary")}
                >
                  <p className="text-sm text-slate-700 whitespace-pre-wrap">
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
                >
                  <ul className="text-sm font-mono space-y-1">
                    {validator.context.filesAnalyzed.map((file) => (
                      <li key={file} className="text-slate-600">
                        • {file}
                      </li>
                    ))}
                  </ul>
                </CollapsibleSection>
              )}

              {/* Domain Rules Applied */}
              {hasContext && validator.context?.rulesApplied && validator.context.rulesApplied.length > 0 && (
                <CollapsibleSection
                  title={`Domain Rules Applied (${validator.context.rulesApplied.length})`}
                  icon={<BookOpen className="h-4 w-4" />}
                  expanded={expandedSections.rules}
                  onToggle={() => toggleSection("rules")}
                >
                  <ul className="text-sm space-y-1">
                    {validator.context.rulesApplied.map((rule) => (
                      <li key={rule} className="text-slate-600">
                        • <code className="px-1 py-0.5 bg-slate-100 rounded text-xs">{rule}</code>
                      </li>
                    ))}
                  </ul>
                </CollapsibleSection>
              )}

              {/* AI Prompt */}
              {hasAIData && validator.ai?.prompt && (
                <CollapsibleSection
                  title="AI Prompt"
                  icon={<Brain className="h-4 w-4" />}
                  expanded={expandedSections.prompt}
                  onToggle={() => toggleSection("prompt")}
                  action={
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        copyToClipboard(validator.ai!.prompt!, setCopiedPrompt);
                      }}
                    >
                      {copiedPrompt ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  }
                >
                  <pre className="text-xs font-mono bg-slate-900 text-slate-100 p-4 rounded-lg overflow-auto max-h-64 whitespace-pre-wrap">
                    {validator.ai.prompt}
                  </pre>
                </CollapsibleSection>
              )}

              {/* AI Response */}
              {hasAIData && validator.ai?.response && (
                <CollapsibleSection
                  title="AI Response"
                  icon={<Brain className="h-4 w-4" />}
                  expanded={expandedSections.response}
                  onToggle={() => toggleSection("response")}
                  action={
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        copyToClipboard(validator.ai!.response!, setCopiedResponse);
                      }}
                    >
                      {copiedResponse ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  }
                >
                  <pre className="text-xs font-mono bg-slate-900 text-slate-100 p-4 rounded-lg overflow-auto max-h-64 whitespace-pre-wrap">
                    {validator.ai.response}
                  </pre>
                </CollapsibleSection>
              )}

              {/* Token Usage */}
              {hasAIData && validator.ai?.tokensUsed && (
                <div className="flex items-center gap-4 text-sm text-slate-500 p-3 bg-slate-50 rounded-lg">
                  <span>Tokens used:</span>
                  <span>
                    Input: <strong>{validator.ai.tokensUsed.input.toLocaleString()}</strong>
                  </span>
                  <span>
                    Output: <strong>{validator.ai.tokensUsed.output.toLocaleString()}</strong>
                  </span>
                  <span>
                    Total: <strong>{(validator.ai.tokensUsed.input + validator.ai.tokensUsed.output).toLocaleString()}</strong>
                  </span>
                </div>
              )}

              {/* Issues */}
              {validator.issues.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-slate-700">
                    Issues ({validator.issues.length})
                  </h4>
                  {validator.issues.map((issue, i) => (
                    <div
                      key={i}
                      className="rounded-lg bg-slate-50 p-3 border border-slate-200"
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
                          <p className="text-sm text-slate-700">{issue.message}</p>
                          {issue.file && (
                            <p className="text-xs text-slate-500 mt-1 font-mono">
                              {issue.file}
                              {issue.line && `:${issue.line}`}
                            </p>
                          )}
                          {issue.suggestion && (
                            <p className="text-xs text-slate-500 mt-1 italic">
                              {issue.suggestion}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* No data message */}
              {!hasContext && !hasAIData && validator.issues.length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  No additional details available for this validator.
                </div>
              )}
            </div>
          </TabsPanel>

          <TabsPanel value="raw" className="flex-1 overflow-auto">
            <JsonViewer data={validator} collapsed={false} maxHeight="600px" />
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
  children: React.ReactNode;
}

function CollapsibleSection({
  title,
  icon,
  expanded,
  onToggle,
  action,
  children,
}: CollapsibleSectionProps) {
  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 transition-colors"
      >
        <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
          {expanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
          {icon}
          {title}
        </div>
        {action}
      </button>
      {expanded && <div className="p-3 bg-white">{children}</div>}
    </div>
  );
}
